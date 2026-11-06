---
title: "Season 2 Setup & Connection Specifications"
date: 2026-11-06T15:00:00+05:30
draft: false
slug: "season-2-launch-server-guide"
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Technical setup for Season 2: Paper 1.21.x networking, AuthMe SHA-256 account registration, 4-second TPA warmups, bed respawn mechanics, and physical chest barter."
tags: ["Announcements", "Season 2", "Server"]
---

FiestaSMP Season 2 runs on Paper 1.21.x with Geyser crossplay. The server operates at a fixed 20.0 TPS with no virtual currency plugins, no scoreboard balances, and unmoderated PvP outside the spawn perimeter.

## Connection Addresses

The server accepts connections from both Java & Bedrock clients:

- **Java Edition:** `fiesta.debarkak.xyz:25565` (ViaVersion handles protocols 1.8 through 1.21.x)
- **Bedrock Edition:** `fiesta.debarkak.xyz:19132` (Geyser-Spigot bridge on UDP port 19132)

### Authentication & Player Skins

Player accounts use AuthMe with PBKDF2 SHA-256 password hashing:
- First connection: run `/register <password> <confirmPassword>` in chat.
- Returning connections: run `/login <password>`.
- Skin textures: SkinsRestorer manages player skins across offline and online clients with `/skin <username>`.

## Gameplay Rules & Anti-Cheat

Player interaction rules are split between the protected spawn island and the wilderness:
- **Wilderness Raiding:** Beyond the 150-block spawn perimeter, base raiding, chest theft, and PvP combat are allowed. We don't restore stolen inventory items or repair griefed bases.
- **Cheat Detection:** Packet-level movement hacks, fly mods, Baritone automation, and X-ray packs are blocked by packet analysis. CoreProtect 24.0 logs block changes and chest transactions to an SQLite backend.
- **In-Game Rules:** Run `/rules` to view current server flags.

## Server Mechanics

### 1. Teleport Requests & Combat Timing
- Teleport requests use `/tpa <player>`.
- Teleports require explicit acceptance. The recipient must type `/tpaccept` within 60 seconds.
- Arrival grants a 4-second invulnerability timer to prevent instant fall or suffocating traps. Moving cancels the teleport during the warmup window.

### 2. Bed Respawns & Spawn Anchors
Bed respawn anchors function normally in Overworld dimensions. Right-clicking an unobstructed bed sets player coordinates; dying without an active anchor returns the player to the Spawn Archipelago docks.

### 3. Clan Management
Team creation uses the FiestaTeams plugin:
- Run `/team create <name>` to register a clan tag.
- Run `/team invite <player>` to add members.
- Clan members share friendly-fire toggles & land coordinate bookmarks.

### 4. Physical Item Barter
The server doesn't use virtual money. Players trade with physical items:
- Direct player-to-player trade: run `/trade <player>` through InTrade.
- Merchant shops: ChestShop allows selling items from locked wooden containers using diamonds or gold as currency.
- Public listings: EzAuction handles timed item bidding boards.

*cbladeOfficial & debarkak, FiestaSMP Engineering*
