# Fiesta SMP Official Website

Official website for **Fiesta SMP**: survival Minecraft server with physical barter, raiding, clan warfare, long seasons, and crossplay on Java and Bedrock.

Documentation and player web portal featuring 2009 Microsoft Aero styling, calendar agenda, player-attributed gallery, support ticket forms, and Hugo Markdown news system.

## Pages

- **[Home](https://open-fiestasmp.github.io/)** (`index.html` / `home.html`): Server connection specs, live status pill, screenshot, broadcast calendar, and footer links.
- **[News & Updates](https://open-fiestasmp.github.io/news/)** (`news/index.html` / `news.html`): Hugo-powered bulletins feed with tag filters, search, and Markdown article pages.
- **[Terms](https://open-fiestasmp.github.io/terms.html)** (`terms.html`): Server rules, allowed mechanics, anti-cheat limits, barter economy charter, and community conduct.
- **[Gallery](https://open-fiestasmp.github.io/gallery.html)** (`gallery.html`): In-game screenshot gallery with player skin avatar attribution.
- **[Socials](https://open-fiestasmp.github.io/socials.html)** (`socials.html`): Streaming platforms (Twitch, Kick, YouTube), communication channels (Mail, Discord, X), and GitHub repositories.
- **[Contact / Support](https://open-fiestasmp.github.io/contactsupport.html)** (`contactsupport.html` / `support.html`): Direct mail notices, forms for ban appeals, player reports, and gallery submissions.

## Creating & Publishing News Posts with Markdown (Hugo)

News articles are written in standard Markdown and compiled with Hugo:

### 1. Create a New Post
Run Hugo's archetype generator:
```bash
hugo new content posts/my-post-title.md
```
Or simply create a new `.md` file inside `content/posts/`:
```markdown
---
title: "My Post Title"
date: 2026-11-06T15:00:00+05:30
draft: false
author: "debarkak"
summary: "A brief summary of this update for the news feed."
tags: ["Announcements", "Server"]
---

Write your Markdown post content here...
```

### 2. Build the Static Site
```bash
hugo
```
Hugo will compile your Markdown post into `news/<slug>/index.html` and update the news archive at `news/index.html`.

### 3. Automatic Deployment
Pushing your changes to GitHub triggers the automated GitHub Action (`.github/workflows/hugo.yml`) which automatically compiles Hugo and publishes the static pages to GitHub Pages.

## Server Connection

- **Java IP**: `fiesta.debarkak.xyz`
- **Bedrock IP**: `fiesta.debarkak.xyz`
- **Platform**: Java & Bedrock Crossplay
- **Official Contact**: `fiestamg@murena.io`
- **Discord**: [discord.gg/6wS2dpyX57](https://discord.gg/6wS2dpyX57)

## Repository Structure

```
open-fiestasmp.github.io/
├── index.html                  # Home page
├── home.html                   # Home page alias
├── news.html                   # News redirect alias
├── terms.html                  # Terms & Rules page
├── gallery.html                # Gallery page
├── socials.html                # Socials & links page
├── contactsupport.html         # Contact & Support page
├── support.html                # Contact & Support alias
├── hugo.toml                   # Hugo configuration
├── content/                    # Markdown posts
│   └── posts/                  # News articles (*.md)
├── layouts/                    # Hugo Google Sites theme templates
│   ├── _default/
│   │   ├── baseof.html         # Master Google Sites shell
│   │   ├── list.html           # Taxonomy tag list template
│   │   └── single.html         # Article detail template
│   └── index.html              # News archive & search template
├── news/                       # Compiled static HTML news site
├── archetypes/                 # Hugo post template archetype
├── assets/
│   ├── css/
│   │   └── google-sites.css    # Core Google Sites stylesheet
│   ├── gallery/                # Authentic gallery images (gallery_1 to 4)
│   ├── js/
│   │   └── mobile-nav.js       # Mobile navigation & copy utility
│   └── img/
│       ├── avatars/            # Player avatars (debarkak, cbladeOfficial, kytrakton, ShadowViper4746)
│       └── server_image.png    # Authentic home server feature image
└── README.md                   # Repository documentation
```
