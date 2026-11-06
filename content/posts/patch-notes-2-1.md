---
title: "Patch Notes 2.1: TPA Confirmation, Economy & System Tuning"
date: 2026-11-05T19:00:00+05:30
draft: false
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Changelog for Patch 2.1 addressing mandatory /tpaccept confirmation, 4-second teleport safety, ChestShop balances, and Paper 20.0 TPS stability."
tags: ["Patch Notes", "Updates", "Economy"]
---

Welcome to the **Patch 2.1** release notes for FiestaSMP. This update addresses important community feedback regarding teleport safety, player trade mechanics, and back-end server responsiveness.

## Gameplay & Mechanics Adjustments

### 1. Mandatory /tpaccept Confirmation
In response to community reports where players experienced unauthorized incoming teleports:
- Direct teleportation via `/tpa` no longer auto-executes under any conditions.
- The target player must explicitly type `/tpaccept` (or `/tpdeny`) within the 60-second request window.
- Teleport delays and cooldowns have been adjusted to prevent combat evasion.

### 2. Teleport Arrival Invulnerability
- Configured a dedicated **4-second invulnerability timer** immediately following any successful teleport command.
- If you accept a teleport or arrive at a designated outpost, you cannot take immediate damage, giving you time to render chunks and assess surroundings.

### 3. Bed Respawn Coordinate Fix
- Corrected coordinate persistence in world metadata where beds in certain snowy and mountain biomes failed to save the respawn tag.
- Players will now reliably respawn at their home bed location upon death rather than defaulting back to center spawn.

## Economy & Commerce Updates

### 1. Safe In-Person Bartering
- Enhanced the `/trade <player>` interface (powered by **InTrade**) with dual-confirmation locking to prevent trade scamming.
- Physical diamonds, ancient debris, and enchanted gear can now be safely exchanged between Java and Bedrock players simultaneously.

### 2. ChestShop & Auction House Enhancements
- Adjusted **ChestShop** price formatting to improve readability on mobile Bedrock devices.
- Refined listing expiration timers on **EzAuction** to maintain an active market turnover.

## Server Performance & Architecture

```text
Server Core: Paper 1.21.x / Folia Multi-threaded Pipeline
Network Stack: ViaVersion + ViaBackwards + Geyser 19132
Chunk Generator: Chunky Async Pre-generator
Logging Engine: CoreProtect 24.0 (Block, Container, and Kill Logs)
Average Tick Rate: Sustained 20.0 TPS
```

- Cleaned up unneeded inventory menu popups on join. When new players arrive, clean vanilla system messages are displayed alongside a prompt to review `/rules`.
- Verified Discord bot bridge synchronization and real-time console status reporting.

If you encounter any anomalies, please report them via our `#bug-reports` channel on [Discord](https://discord.gg/6wS2dpyX57).

*&mdash; cbladeOfficial &amp; debarkak (FiestaSMP Engineering Team)*
