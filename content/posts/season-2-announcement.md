---
title: "Season 2 Launch & Server Guide"
date: 2026-11-06T15:00:00+05:30
draft: false
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "FiestaSMP Season 2 is live! Everything you need to know about Paper 1.21.x crossplay, AuthMe registration, TPA rules, bed respawns, and the barter economy."
tags: ["Announcements", "Season 2", "Server"]
---

Welcome to **FiestaSMP Season 2**! Our team has prepared a streamlined, competitive survival multiplayer world running on high-performance Paper/Folia infrastructure.

Whether you are a returning veteran or exploring our world for the first time, here is the complete guide to Season 2.

## How to Connect

FiestaSMP natively supports both Java Edition and Bedrock Edition players, with multi-version client compatibility:

- **Java Edition Address:** `fiesta.debarkak.xyz:25565` (Supports 1.8 to 1.21.x / 26.x via ViaVersion)
- **Bedrock Edition Address:** `fiesta.debarkak.xyz:19132` (Port `19132` via Geyser-Spigot)

### Account Authentication & Skins
Our server welcomes both premium and offline-mode clients using **AuthMe**:
- First-time joining: Run `/register <password> <confirmPassword>` in chat.
- Subsequent logins: Run `/login <password>`.
- Character Skins: Handled automatically via **SkinsRestorer** (`/skin <name>`).

## Core Gameplay: Survival with the Safety Off

FiestaSMP is built on unfiltered survival mechanics:
- **Wilderness Raiding & PvP:** Outside the protected Spawn Archipelago, PvP, territory skirmishes, and raiding unprotected chests are fully allowed.
- **Fair Play Enforcement:** Cheating, flight hacks, X-ray texture packs, and automated botting are strictly forbidden. All block placements, container withdrawals, and entity damage are logged around the clock by **CoreProtect 24.0** and filtered by **UltimateAntiBot**.
- **Server Conduct:** Always review `/rules` in-game before venturing out.

## Key Mechanics & Systems

### 1. Teleportation Safety & TPA
- Sending a teleport request is done with `/tpa <player>`.
- **Mandatory Confirmation:** Teleports do **not** happen automatically. The recipient must explicitly accept using `/tpaccept`.
- **Invulnerability Grace Period:** Teleported players receive a 4-second invulnerability window upon arrival to prevent instant trap ambushes.

### 2. Bed Respawns & Home Anchors
The earlier bug where bed respawns reverted to the center world spawn has been fully resolved. Sleeping in any valid bed in the Overworld will properly set your individual respawn coordinates.

### 3. FiestaTeams & Clan Warfare
Band together with friends or establish rival factions using our custom **FiestaTeams** plugin:
- `/team create <name>` to establish your squad.
- `/team invite <player>` to recruit trusted allies.
- Plan defenses, coordinate outpost raids, and conquer the wilderness together.

### 4. Barter Economy
There are no artificial infinite coin shops. The economy is 100% player-driven through physical bartering:
- Trade directly using `/trade <player>` via **InTrade**.
- Establish automated merchant stalls using **ChestShop**.
- List rare artifacts on the player-run auction board with **EzAuction**.

See you all on the server!

*&mdash; cbladeOfficial &amp; debarkak (FiestaSMP Core Team)*
