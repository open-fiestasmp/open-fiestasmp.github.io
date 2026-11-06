---
title: "Account Security & Network Routing Architecture"
date: 2026-10-25T14:00:00+05:30
draft: false
slug: "account-protection-network-optimization-guide"
author: "cbladeOfficial"
summary: "Technical documentation of AuthMe PBKDF2 password hashing, 60-second session reconnects, SkinsRestorer texture fetching, and UDP port 19132 Geyser translation."
tags: ["Server", "Security", "Updates"]
---

FiestaSMP runs on a dual-login pipeline to allow both standard Mojang accounts and offline launcher profiles without account collisions.

## Authentication Pipeline

Inbound connections pass through an anti-bot handshake filter before reaching the AuthMe database:

```text
Inbound TCP/UDP -> AntiBot Verification -> AuthMe Handshake
  ├─ Registered Account: /login <password> (PBKDF2 SHA-256)
  └─ Unregistered Account: /register <password> <confirmPassword>
```

### Authentication Parameters
- **Password Storage:** Passwords are salted and hashed using PBKDF2 with SHA-256. Plaintext credentials are never written to disk or console logs.
- **Reconnection Window:** Disconnections trigger a 60-second session hold. If your client reconnects within that window from the same IP address, you re-enter the world without typing your password again.
- **Password Changes:** Run `/changepassword <oldPassword> <newPassword>` to update stored credentials.

## Skin Extraction & SkinsRestorer

Offline launcher accounts default to Steve or Alex models because they don't query Mojang's session server. SkinsRestorer bridges this by pulling skin textures from public skin databases:

1. Type `/skin <username>` to fetch and apply any registered Mojang or Ely.by skin texture.
2. Custom image files apply via `/skin <directPngUrl>`.
3. Avatar heads in our web gallery are extracted from these cached 64x64 PNG texture files.

## Bedrock Routing on UDP Port 19132

Bedrock players connect on UDP port `19132` via Geyser-Spigot & Floodgate:
- Packet translation converts Bedrock touch gestures into standard Java interaction events.
- Form windows replace chat commands for ChestShop purchases and team management.
- Network MTU is set to 1400 bytes to avoid packet fragmentation on mobile carrier networks.

Report locked accounts or lost passwords through our Discord support ticket system or email `fiestamg@murena.io`.

*cbladeOfficial, FiestaSMP Developer*
