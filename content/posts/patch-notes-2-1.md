---
title: "Patch 2.1: Teleport Confirmation & Economy Updates"
date: 2026-11-05T19:00:00+05:30
draft: false
slug: "patch-notes-2.1-tpa-confirmation-economy-system-tuning"
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Patch 2.1 brings teleport warmup timers to prevent combat escapes, safe trade confirmation, and mobile touch improvements."
---

Patch 2.1 is now deployed across the server. This update focuses on combat fairness, trade security, and minor bug fixes.

## Combat & Teleport Changes

- **Teleport Confirmation:** `/tpa` requests now require the receiving player to confirm with `/tpaccept` within 60 seconds.
- **Warmup & Combat Cancels:** Moving or taking damage during the 4-second teleport warmup immediately cancels the request, preventing combat escapes.
- **Arrival Protection:** Players receive a brief 4-second invulnerability window upon arrival so chunks can load safely without instant damage traps.

## Trade & Economy Fixes

- **Safe Trading:** The `/trade <player>` window now requires a two-step confirmation from both players. If any item is swapped or removed, the timer resets to 3 seconds.
- **Mobile Touch Display:** ChestShop text and item quantities have been formatted to fit cleanly on mobile touch screens without overlapping chest inventories.

## Bug Fixes

- Fixed an issue where beds placed in cold mountain biomes occasionally failed to save respawn points after restarts.
- General server stability improvements during peak player hours.

Found a bug? Let us know in `#bug-reports` on our [Discord](https://discord.gg/6wS2dpyX57).
