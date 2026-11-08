---
title: "Patch 2.1 Notes: Combat Teleports and Trade Window"
date: 2026-11-05T19:00:00+05:30
draft: false
slug: "patch-notes-2.1-tpa-confirmation-economy-system-tuning"
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Added warmup and cancel-on-damage to /tpa, a two-step confirm on /trade, and mobile shop UI fixes."
---

debarkak and I pushed a small update to fix combat warping, clean up trade security, and fix mobile touchscreen shop screens.

## Teleport Changes

- **Teleport Warmup:** `/tpa` now has a 4-second warmup. If you move or take damage while waiting to teleport, the warp cancels. This stops people from warping away in the middle of a fight.
- **Confirmation Still Required:** The person you are warping to still has to type `/tpaccept` within 60 seconds.
- **Arrival Grace:** When you arrive after a teleport, you get 4 seconds of invulnerability so your chunks can load before mobs can hit you.

## Trading Fixes

- **Two-Step Trade Lock:** The `/trade <player>` screen now requires both players to click ready and then confirm. If someone changes or swaps an item at the last second, the countdown resets to give you time to look.
- **Mobile ChestShops:** Cleaned up chest shop text and quantity buttons on mobile Bedrock screens so they do not overlap your inventory.

## World Reminders

- Fixed a bug where beds placed on high mountain biomes sometimes lost their respawn point after a server restart.
- Remember: there is no spawn protection radius on FiestaSMP. Outside of claims, anyone can break blocks and take items. Always claim your base.

If you spot any other bugs, drop a message in `#bug-reports` on our [Discord](https://discord.gg/6wS2dpyX57).
