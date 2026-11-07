---
title: "Patch 2.1: Teleport Confirmation & Economy Updates"
date: 2026-11-05T19:00:00+05:30
draft: false
slug: "patch-notes-2.1-tpa-confirmation-economy-system-tuning"
author: "cbladeOfficial"
coauthor: "debarkak"
summary: "Teleport warmup timers to stop combat escapes, safe two-step trade confirmation, and mobile touch fixes."
---

debarkak and I just pushed Patch 2.1 to the server! This update fixes teleport combat abuses, makes player-to-player trading safer, and cleans up chest shops on mobile.

## Combat & Teleports

- **Accept Required:** `/tpa` requests need to be accepted with `/tpaccept` within 60 seconds.
- **Combat Cancels:** Moving or getting hit during the 4-second warmup will cancel your teleport so people can't warp away in the middle of a fight.
- **Teleport Arrival Grace:** You get 4 seconds of invulnerability right after teleporting so your chunks can load before mobs or traps can hit you.

## Trading & Shops

- **Two-Step Trading:** The `/trade <player>` window now requires both players to lock in and confirm. If someone swaps an item last second, the countdown resets by 3 seconds.
- **Mobile Touch Fixes:** ChestShop text and item amounts now fit properly on mobile phone screens so buttons don't overlap your inventory.

## Bug Fixes & World Reminders

- Fixed a bug where beds placed on cold mountain peaks sometimes lost their respawn points after a server restart.
- Cleaned up background thread ticks during peak hours.
- Reminder: There is no spawn protection radius on FiestaSMP. Always claim your land to stay safe and protect your chests from raiders.

Spotted a bug? Drop a report in `#bug-reports` on our [Discord](https://discord.gg/6wS2dpyX57).
