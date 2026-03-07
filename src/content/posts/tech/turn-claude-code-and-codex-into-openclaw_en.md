---
title: Turning Claude Code and Codex into Your Own "Openclaw"
published: 2026-03-07
tags: [Artisan, Openclaw, AI]
category: AI
draft: false
---

> Cover image source: [Source](./codex_cc_openclaw.png)

`Openclaw` has been gaining a lot of attention in the community recently:

::github{repo="openclaw/openclaw"}

It introduces several interesting ideas:

- Integrates with IM tools so you can remotely control your local environment from your phone
- Uses `SOUL`, `IDENTITY`, `MEMORY`, and `memory/*` to give the model personalized memory
- Includes built-in scheduled task support

That said, compared with coding agents like `Codex` / `Claude Code`, `Openclaw` still has some clear drawbacks:

- Weaker context-cache management; similar research tasks often consume 5-10x more tokens
- Frequent updates and relatively many bugs; as a personal project, stability still lags
- A high barrier in the permission model for regular users; exposing public interfaces can easily introduce data and financial security risks

![Token usage comparison between Openclaw and Codex on the same research task](./openclaw_codex_token_compare.png)

So in practice, I built my own "Openclaw-style" workflow with `Happy` on mobile + `Codex` + `SMTP` email notifications.

## Why

::github{repo="slopus/happy"}

`Happy` lets `Codex` / `Claude Code` run tasks directly in a chat interface with a clean UX. For Chinese users, the key point is that it works directly in mainland China's network environment.

Its limitations are: it mainly targets Git file browsing, has weak capabilities for day-to-day automation, and does not support direct file transfer. So I used an email channel to fill that gap.

::github{repo="openai/codex"}

`Codex` has very low token cost. As shown above, it consumes significantly fewer tokens on comparable research tasks, which makes it cost-effective for daily automation.

As for `Claude Code`, the official [remote control](https://code.claude.com/docs/en/remote-control) feature already exists. I did not choose it mainly because account stability is not ideal for my current use case.

## How

### Step 1: Find a Home for Your "Openclaw"

You need an always-on server. `Linux/macOS` both work, and having a GUI is best so the model can observe and interact with the interface when needed.

I chose `AWS EC2`. New users usually get some credits (I had `$100`), which can roughly cover 3-6 months depending on instance configuration.

### Step 2: Install Codex and Happy

```bash
# Install Codex
npm install -g @openai/codex

# Install Happy
npm install -g happy-coder
```

### Step 3: Let Codex Take Over Automation

After installation, open `codex` and ask it to do the following:

- Pull all `md` files under `https://github.com/openclaw/openclaw/tree/main/docs/reference/templates` (excluding `.dev.md`), save them locally, remove the first 6 lines, then complete initialization according to `BOOTSTRAP.md`

- Configure an SMTP relay to build a notification path that can send mail without receiving mail; set the default sender to `XXX@AAA.com`, and verify attachment delivery

- Use system `cron` to complete an end-to-end loop test of "scheduled trigger -> Codex execution -> email notification", then distill it into a reusable skill

### Step 4: Let Happy Handle Mobile Access

You need to complete:

- Download `Happy Coder` from the App Store
- Run `happy codex` on the server to open the Happy channel, then scan the QR code on your phone for authorization

Then ask Codex to finish:

- Configure `happy codex` with `systemctl` for auto-start and daemon management

### Done

At this point, you have a code agent with "Openclaw-style" capabilities: more stable core, better cost control, compatibility with Chinese network conditions, and a closed-loop remote task workflow via email.
