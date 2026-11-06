---
title: "Account Protection & Network Optimization Guide"
date: 2026-10-25T14:00:00+05:30
draft: false
author: "cbladeOfficial"
summary: "An in-depth developer overview of AuthMe password hashing, session persistence, SkinsRestorer, and Bedrock connection routing."
tags: ["Server", "Security", "Updates"]
---

Maintaining an open and accessible Minecraft multiplayer environment requires robust security and authentication tooling behind the scenes. This guide covers how account security, session persistence, and network routing operate on FiestaSMP.

## Account Authentication Architecture

Because FiestaSMP supports both standard and offline-mode clients, player authentication is handled through an isolated **AuthMe Reloaded** pipeline:

```text
Incoming Connection -> UltimateAntiBot Filter -> AuthMe Handshake
  ├─ Registered User: /login <password> (PBKDF2 SHA-256 Hashing)
  └─ New Player: /register <password> <confirmPassword>
```

### Key Security Guidelines:
- **Strong Passwords:** Avoid using simple passwords or combinations you use on public servers.
- **Session Auto-Reconnection:** If your client experiences a brief network hiccup or disconnection, a 60-second session grace window allows instant reconnection without re-entering your credentials.
- **Password Updates:** You can change your existing password at any time in-game using `/changepassword <oldPassword> <newPassword>`.

## Cross-Version Skins & Restorer

Offline clients traditionally display default Steve or Alex skins. To provide full cosmetic customization for every player on our server:

1. **SkinsRestorer** is synchronized with Mojang skin caches.
2. Run `/skin <username>` to apply any publicly indexed skin to your character.
3. Custom URL skins are supported via `/skin <directImageUrl>` for unique outfits.
4. Changes take effect across both Java and Bedrock clients instantaneously.

## Bedrock Network Routing (Port 19132)

Bedrock edition clients connect over the UDP protocol on port `19132` via **Geyser-Spigot** and **Floodgate**:

- Java inventory translation handles Bedrock UI controls seamlessly.
- Form menus and barter interfaces are tailored for touchscreens and mobile controllers.
- Packet compression has been tuned to ensure consistent ping times under heavy load.

For technical assistance or lost password recovery, reach out through our official ticket system or email us at `fiestamg@murena.io`.

*&mdash; cbladeOfficial (FiestaSMP Developer)*
