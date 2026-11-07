---
title: "Patch 2.1: Teleport Confirmation & Economy Updates"
date: 2026-11-05T19:00:00+05:30
draft: false
slug: "patch-notes-2.1-tpa-confirmation-economy-system-tuning"
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Release notes for Patch 2.1: 4-second /tpaccept movement penalty to stop combat escapes, ChestShop buy/sell rates adjusted, and CoreProtect log rotation."
tags: ["Patch Notes", "Updates", "Economy"]
---

Patch 2.1 updates teleport timers, fixes bed respawn coordinate tags in cold biomes, and adjusts ChestShop transaction limits.

## Gameplay & Combat Adjustments

### 1. Mandatory /tpaccept Confirmation
Direct teleports via `/tpa` no longer execute without target consent:
- The receiving player must type `/tpaccept` or `/tpdeny` within the 60-second request window.
- Teleport requests expire automatically after 60 seconds.
- Taking damage or moving during the 4-second warmup cancels the incoming teleport to stop combat escapes.

### 2. Teleport Arrival Invulnerability
Arrival now triggers a 4-second invulnerability timer. Players can load chunks without taking suffocating block damage or falling into instant lava traps upon arrival.

### 3. Bed Respawn Coordinates
Fixed an issue where beds placed in snowy mountain biomes failed to save coordinate tags upon server restarts. Death in any dimension now reads the saved Overworld bed block before falling back to the spawn harbor.

## Commerce & Trade Configurations

### 1. InTrade Safe Window
The `/trade <player>` interface requires both parties to click accept twice. If an item is added or removed after the initial lock, the countdown resets to 3 seconds to prevent last-tick item swaps.

### 2. ChestShop Formatting
Adjusted ChestShop text lines for Bedrock touch displays. Price tags and quantity counts now wrap cleanly without overlapping container inventories.

## Infrastructure Specifications

```text
Server Core: Dedicated High-Performance Stack
Crossplay Stack: Geyser-Spigot build 582, Floodgate 2.2.3
Tick Rate: Fixed 20.0 TPS
Storage Backend: SQLite WAL mode for CoreProtect 24.0
Log Retention: Block placement and container transactions kept for 90 days
```

Report reproducible errors or crashes in the `#bug-reports` channel on [Discord](https://discord.gg/6wS2dpyX57).

*cbladeOfficial & debarkak, FiestaSMP Engineering*
