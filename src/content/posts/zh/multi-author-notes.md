---
title: 多作者内容组织实践
summary: 多作者场景下，如何在内容集合中维护作者资料与文章引用。
translationKey: multi-author-notes
publishedAt: 2026-03-05
tags:
  - content
  - workflow
language: zh
authors:
  - zhong
---

多作者博客的关键不是页面，而是内容模型。

在 Astro 的 Content Collections 里，文章通过 `authors` 字段引用作者集合，可以在构建时进行校验，避免引用不存在作者。
