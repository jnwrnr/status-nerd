# Status Nerd Changelog

## [Meeting Status] - 2026-07-19

- Added **Meeting Status** command: reads your current or next meeting from a Google Calendar secret ICS feed and generates a status from its title + agenda, in your tone
- Privacy-guarded prompt — statuses only hint at the *kind* of meeting, never names, companies, or confidential details
- Recurring events are expanded; all-day and cancelled events are skipped; prefers the running meeting, else the soonest within 24h
- New optional **Calendar ICS URL** preference (stored as a password); an empty value shows a setup hint

## [Tone & Duration] - 2026-07-18

- Added a one-time **tone onboarding** on first launch: describe how your AI statuses should sound; change it anytime with ⌘T in Set Status
- Added a **Default Status Duration** preference (until 17:30, 1h, 4h, 8h, end of day, don't expire) with a per-run override in Set Status
- Slack and GitHub honor the exact expiration time; GitLab snaps to its nearest supported bucket

## [Select, Clear & Emoji] - 2026-07-18

- Added **Select Status**: pick from Recent (tracked automatically), Saved (your own), and Defaults; save and remove entries; create your own via an emoji picker
- Added **Clear Status**: remove your status on all configured services at once
- Statuses show the real emoji as an icon, with the `:shortcode:` alongside
- AI-generated emoji are restricted to a curated, cross-service-valid set

## [v2 — Native Extension] - 2026-07-18

- Rebuilt the Raycast script command as a full native extension
- **Set Status**: pick services, turn notes into AI-generated suggestions, shuffle, then set
- **Random Status**: one-click random status on your default services
- Tokens moved to encrypted Raycast preferences; the original Python script is kept under `legacy/`

## [GitHub support] - 2026-07-17

- Added GitHub profile status alongside Slack and GitLab
- Fixed Slack rejecting emoji it doesn't recognize (retry with a safe fallback)
