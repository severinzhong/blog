---
title: 可读源码：Slay the Spire 2（Godot + C#）逆向学习与项目结构拆解
published: 2026-03-09
image: ./slay-the-spire-2-cover.jpg
tags: [godot, bot]
category: AI
draft: false
---

## 写在前面

这篇是我的实操复盘：我如何从本机 Steam 安装的《Slay the Spire 2》出发，恢复出可学习的 Godot 项目结构，并提取 C# 逻辑代码，最后把它整理成可以系统阅读的工程。

目标不是“跑通项目”或“二次发布”，而是学习一个商业卡牌游戏的工程组织方式：
- 战斗系统怎么分层
- 卡牌与数值是怎么建模的
- 地图/事件/奖励如何串成一局 Run
- Godot 场景和 C# 逻辑如何协同

## 1. 我是怎么逆向出来的

### 1.1 确认 Steam 安装位置与核心包

本机路径：
- `~/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.app`

核心资源包：
- `.../Contents/Resources/Slay the Spire 2.pck`

这是 Godot 发布产物里最关键的资源容器。

### 1.2 用 GDRETools 恢复 Godot 项目

我使用 `GDRETools`（`gdsdecomp`）对 `.pck` 做 recover。

::github{repo="GDRETools/gdsdecomp"} 

恢复结果关键数据（来自 `gdre_export.log`）：
- Detected Engine Version: `4.5.1`
- Verified files: `9947`
- Extracted files: `9947`
- Decompiled scripts: `48`（主要是 `.gd`）

最终得到一个可读项目目录

### 1.3 提取 C# 主逻辑（sts2.dll）

Godot 场景里大量脚本指向 `res://src/Core/.../*.cs`，但 recover 后并不自带完整 C# 源码。

所以我从游戏 runtime 目录取出程序集：
- `.../Contents/Resources/data_sts2_macos_arm64/sts2.dll`

然后用 `ilspycmd` 反编译出 C#：
- 反编译后约 `3.2k+` 个 `.cs`

::github{repo="icsharpcode/ILSpy"} 

### 1.4 把 C# 回填到 Godot 项目路径

关键一步是按 `[ScriptPath("res://...")]` 把反编译文件写回项目对应路径，例如：
- `res://src/Core/Nodes/NGame.cs`
- `res://src/Core/Nodes/Screens/Map/NMapScreen.cs`

这样 Godot 场景引用的脚本路径就能对上。

我还做了完整性校验：
- 场景/资源里引用的 `res://*.cs` 共 `598` 个
- 缺失：`0`

另外，无法映射到 `ScriptPath` 的反编译文件统一放在：
- `src/_decompiled_noscriptpath/`

这部分主要是补充阅读和类型定义，不影响“按场景跳转看代码”的学习路径。

## 2. 项目总览：它是怎么组织的

## 2.1 启动入口与全局配置

关键文件：
- `project.godot`
- `scenes/game.tscn`
- `src/Core/Nodes/NGame.cs`

在 `project.godot` 里可以直接看到：
- `config/name="Slay the Spire 2"`
- `run/main_scene="res://scenes/game.tscn"`
- `project/assembly_name="sts2"`

`autoload` 里挂了几个全局系统：
- Sentry 初始化
- AssetLoader
- DevConsole / CommandHistory / MemoryMonitor
- FMOD 管理器

这说明它不是“单场景脚本工程”，而是有明确全局服务层。

## 2.2 场景层（表现与交互）

`scenes/` 下有大量业务域场景（约 `892` 个 `.tscn`）：
- `combat/` 战斗 UI 与战斗容器
- `cards/` 卡牌表现、手牌容器、Overlay
- `screens/` 主菜单、地图、设置、图鉴、历史、自定义等界面
- `events/` 事件场景
- `merchant/` 商店
- `relics/` `potions/` `rewards/`
- `vfx/` 特效簇

可以把它理解为：Godot 场景负责“看得见的东西”，大量状态与规则在 C# 模型层。

## 2.3 Core/Nodes：场景控制器层

`src/Core/Nodes/` 是最核心的“UI/流程控制器层”（约 `620` 个 `.cs`）。

代表文件：
- `NGame.cs`：全局根节点控制、输入与全局容器
- `NRun.cs`：单局运行容器，负责在不同 room/screen 间切换
- `NMapScreen.cs`：地图交互、投票、滚动、输入处理
- `NCombatRoom.cs`（及相关）：战斗表现桥接

这是典型 Godot+C# 的写法：
- 场景节点（Node/Control）挂控制器
- 控制器调用 Core 模型和命令系统

## 2.4 Model 层：卡牌游戏的“规则内核”

大量规则模型在 `src/_decompiled_noscriptpath/MegaCrit.Sts2.Core.Models.*`。

典型结构：
- `Models.Cards`（577）
- `Models.Relics`（290）
- `Models.Powers`（260）
- `Models.Monsters`（121）
- `Models.Encounters`（88）
- `Models.Events`（68）

这组数字非常直观地说明了内容密度：
- 卡牌、遗物、能力、怪物、事件都是独立模型类型
- 新内容扩展本质上是“加模型 + 接入池/流程”

### 关键类：`ModelDb`

`ModelDb.cs` 是内容索引中枢，集中暴露：
- 所有卡池 / 角色 / 事件 / 遭遇 / 药水 / 遗物 / Orb / Act
- 还提供 mod 反射入口（`GetSubtypesInMods<AbstractModel>()`）

这意味着它的内容系统不是散落 hardcode，而是“统一注册 + 查询”。

### 关键类：`CardModel`

`CardModel.cs` 体现了卡牌抽象：
- 基础属性：类型、稀有度、费用、目标类型、升级等
- 视觉资源路径：边框、图标、portrait
- 运行时行为：`OnPlay`、升级、关键词、动态变量

具体卡牌（如 `Zap.cs`）只是覆写差异逻辑，例如：
- 播放施法动画
- Channel 一个闪电球
- 升级降低费用

这种模式很适合持续扩卡。

## 2.5 行为执行层：Commands + GameActions

这套工程里我认为最值得学的是“命令/动作层”。

### `Commands`（动作原语）

例如：
- `CreatureCmd`：加怪、造成伤害、触发受击/动画/VFX
- `CardCmd`：自动打牌、弃牌、抽牌、升级、消耗等

特点：
- 大量 `async Task`
- 每个命令把“规则 + 表现 + Hook”串起来

### `GameActions`（网络友好动作封装）

例如 `PlayCardAction.cs`：
- 描述“谁打了哪张牌，目标是谁”
- 可序列化成网络动作（`ToNetAction()`）
- 能被队列与同步系统统一处理

这让“单机行为”和“多人同步”共用同一套动作语义，设计非常稳。

## 2.6 Run 与局内流程

核心类：
- `RunState.cs`
- `RunManager.cs`

`RunState` 维护一局中的：
- 玩家集合
- 当前 Act 与地图坐标
- 已访问点、房间栈、事件历史
- 全局随机数集（`RunRngSet`）
- 解锁态、Modifier 等

`RunManager` 则是流程编排器，负责：
- 新局创建/继续
- 房间推进
- 各类 Synchronizer 管理
- Action 队列执行

## 2.7 存档系统

核心类：
- `SaveManager.cs`

可见它拆成多管理器：
- Settings / Progress / Run / RunHistory / Prefs / Profile

并支持：
- 迁移系统（Migration）
- 本地存储 + Steam Cloud 存储切换

这对商业游戏很关键：版本演进、跨设备、坏档恢复。

## 2.8 多人与同步（这项目的亮点之一）

从目录能看到相当完整的多人模块：
- `Core.Multiplayer.*`
- `Core.Multiplayer.Game.*`
- `Transport.ENet` + `Transport.Steam`
- 大量 `*Synchronizer`

再结合 `RunManager` 里的字段（MapSelectionSynchronizer、EventSynchronizer、RewardSynchronizer 等），可以判断它不是“把单机硬改联机”，而是从架构层就为同步设计了分层。

## 2.9 外围能力：插件与中间件

`addons/` 内可见：
- `fmod`：音频中间件
- `sentry`：异常上报
- `mega_text`：文本 UI 扩展（含 C# 组件）
- `atlas_generator` / `dev_tools` / `megacontentcreator`

再配合：
- `banks/desktop`（FMOD bank）
- `shaders/`、`materials/`、`animations/`、`images/`

说明这是“工具链完善的生产项目”，不是仅代码堆积。

## 3. 我对这个项目架构的结论

如果你学习目标是“怎么做一个可扩展卡牌 roguelike”，这套工程最值得抄作业的是：

1. **模型先行**：卡牌/遗物/能力/怪物都对象化，内容扩展靠模型而非巨型 if-else。  
2. **动作中台**：`Commands + GameActions` 把规则执行标准化，天然适配回放/联网。  
3. **状态清晰**：`RunState` 管局内状态，`RunManager` 管流程 orchestration。  
4. **表现解耦**：Godot 场景负责视图与交互，核心规则多数在 C# Core 层。  
5. **工程化完整**：存档迁移、云存档、调试工具、崩溃上报、音频管线都齐。  

## 4. 建议的学习路径（按 7 天）

1. **Day 1**：`project.godot` + `game.tscn` + `NGame.cs`（全局入口）  
2. **Day 2**：`NRun.cs` + `RunState.cs` + `RunManager.cs`（一局生命周期）  
3. **Day 3**：`CardModel.cs` + 10 张具体卡（如 `Zap`）  
4. **Day 4**：`CreatureCmd` / `CardCmd` / `PlayCardAction`（动作执行链）  
5. **Day 5**：`NMapScreen.cs` + `Core.Map.*`（地图与推进）  
6. **Day 6**：`SaveManager.cs` + `Runs/History/Metrics`（持久化与统计）  
7. **Day 7**：`Core.Multiplayer.*`（同步系统）

## 5. 结果与当前状态

特点：
- 场景引用的 `.cs` 已全部补齐（可用于阅读/跳转）
- 项目不保证可直接编译运行（反编译代码有已知噪声）
- 但“架构学习价值”已经完整可用

