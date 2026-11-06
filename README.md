# Fiesta SMP Official Website

Official website for **Fiesta SMP** — a long-haul survival Minecraft server with pure physical barter, raiding, clan warfare, long-term seasons, and full crossplay for Java Edition and Bedrock Edition.

Direct 1:1 pixel-perfect clone of the official Google Sites prototype (`https://sites.google.com/view/fiestatesttemplate/home`), reproducing the authentic typography, responsive navigation drawer, layout grids, calendar embed, gallery, contact/support workflows, and Hugo-powered Markdown news & blog.

## Pages

- **[Home](https://open-fiestasmp.github.io/)** (`index.html` / `home.html`) — Banner title `FiestaSMP`, 2-column server specs with live status pill, screenshot, live Google Calendar agenda stream schedule, and footer contacts.
- **[News & Updates](https://open-fiestasmp.github.io/news/)** (`news/index.html` / `news.html`) — Hugo-powered news & announcements feed with tag filters, live search, and full Markdown article pages.
- **[Terms](https://open-fiestasmp.github.io/terms.html)** (`terms.html`) — Official server terms, allowed mechanics, prohibited exploits, barter economy charter, season lifecycle rules, and community conduct.
- **[Gallery](https://open-fiestasmp.github.io/gallery.html)** (`gallery.html`) — Google Sites authentic 3-column + 1-column image grid displaying community world captures with debarkak's extracted player skin avatar.
- **[Socials](https://open-fiestasmp.github.io/socials.html)** (`socials.html`) — Live streaming platforms (Twitch, Kick, YouTube), communications channels (Mail, Discord, X), and core development contributors.
- **[Contact / Support](https://open-fiestasmp.github.io/contactsupport.html)** (`contactsupport.html` / `support.html`) — Official communication mail notice, Google forms for Ban Appeals, Player Reports, Gallery Submissions, and Discord ticketing.

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

- **Java Edition IP**: `fiesta.debarkak.xyz:25565`
- **Bedrock Edition IP**: `fiesta.debarkak.xyz:19132`
- **Supported Versions**: Minecraft 1.8 - 26.3+ (Offline clients supported)
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
│       ├── avatars/            # Player avatars (debarkak.png)
│       └── server_image.png    # Authentic home server feature image
└── README.md                   # Repository documentation
```
