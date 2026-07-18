# Status Nerd

A native **Raycast extension** that sets a funny work status on **Slack, GitLab and GitHub** at once — pick which services to update, roll a random status, or generate one from your own notes with Raycast AI.

> **v2** — this started as a Raycast *script command* (Python). It's now a proper Raycast extension. The old script still lives in [`legacy/`](./legacy) as a reference / fallback.

<video src="https://raw.githubusercontent.com/jnwrnr/status-nerd/main/assets/status-nerd-demo.mp4" controls width="880" poster="assets/screenshots/set-status.png"></video>

## Features

- Set the same status on **Slack, GitLab and GitHub** in one go
- **Choose services per run** (or set your defaults in preferences)
- **Notes → AI**: type a few keywords, get status suggestions from Raycast AI, shuffle through them, then set
- **Select Status**: pick from your recent, saved and default statuses; save your own
- **Random Status**: one command, one click, a random status on your default services
- **Clear Status**: remove your status everywhere at once
- Tokens stored **encrypted** by Raycast (no `.env`); any service left without a token is skipped
- Per-service failures are isolated — GitLab being down never blocks Slack

## Install locally

This is a private/personal extension (not published to the Raycast Store), so you install it from source:

```bash
git clone https://github.com/jnwrnr/status-nerd.git
cd status-nerd
npm install
npm run dev
```

`npm run dev` imports the extension into Raycast (the commands appear immediately, with hot-reload). Once you run:

```bash
npm run build
```

the extension stays installed permanently — no terminal or `npm run dev` needed to use it.

## Configure tokens

Open the extension's preferences in Raycast and add the tokens for the services you want (all optional):

- **Slack User Token** — `xoxp-` token with the `users.profile:write` scope. Create at [api.slack.com/apps](https://api.slack.com/apps) → OAuth & Permissions.
- **GitLab Token** — personal access token with the `api` scope. Create at [GitLab → Access Tokens](https://gitlab.com/-/user_settings/personal_access_tokens).
- **GitHub Token** — classic PAT with the `user` scope (needed for `changeUserStatus`). Create at [github.com/settings/tokens](https://github.com/settings/tokens). Fine-grained tokens don't reliably support status changes — use a classic token.

Then pick your **Default Services** in preferences — these are preselected in *Set Status* and used by *Random Status*.

## Usage

### Set Status
1. Run **Set Status**
2. Type a few keywords in **Notes** (e.g. "sprint planning, too many meetings, coffee")
3. Press **Enter** → Raycast AI turns them into several suggestions
4. **⌘R** to shuffle through them · **⌘G** to generate a fresh batch
5. **Enter** to set the status on the selected services

Emoji and text stay editable, so you can tweak any suggestion before setting it.

<img width="608" height="342" alt="status on gitlab" src="https://github.com/user-attachments/assets/688efc6b-f4c4-4946-8dd2-681d7b3bc31f" />

### Select Status
Run **Select Status** for a searchable list in three sections:
- **Recent** — the statuses you set most recently (tracked automatically)
- **Saved** — your own statuses
- **Defaults** — the built-in list

Enter sets the selected status on your default services. Other actions: **Save to Saved** (⌘S), **Remove** (⌘⌫ for saved/recent), and **Create New Status…** (⌘N) to add your own.

### Random Status
Run **Random Status** for a one-click random status on your default services (no form).

### Clear Status
Run **Clear Status** to remove your status on all configured services at once (one click, no form).

## Notes

- **AI generation requires Raycast Pro.** Without it, ⌘R falls back to a built-in list of 30+ statuses.
- Expiration: Slack & GitHub statuses clear at 17:30 (today or tomorrow), GitLab after 8 hours.
- Emoji format: Slack-style `:shortcode:`. GitLab drops the colons, GitHub keeps them — the extension handles the conversion, and only emoji valid on all three services are used.

## Customizing the statuses

The built-in list (used by **Random Status** and by the ⌘R shuffle fallback when AI isn't available) lives in [`src/lib/statuses.ts`](./src/lib/statuses.ts). Add or edit entries in the `STATUSES` array:

```ts
{ emoji: ":fire:", text: "Putting out fires since 9am", gitlab_emoji: "🔥" },
```

- `emoji` — Slack-style shortcode. Use a **standard** emoji that exists on Slack (e.g. `:rocket:`), otherwise Slack falls back to a generic icon.
- `text` — the status message.
- `gitlab_emoji` — the actual emoji character, shown in the Raycast confirmation.

The AI suggestions (⌘G) don't use this list — they're generated from your notes and restricted to a curated set of safe emoji in [`src/lib/ai.ts`](./src/lib/ai.ts) (`SAFE_EMOJIS`).

After editing, run `npm run dev` (hot-reload) or `npm run build` to pick up the change.

## Legacy script

The original Python script command (Slack + GitLab + GitHub via a `.sh` triggered from Raycast) is preserved in [`legacy/`](./legacy). See `legacy/update_status.py`. The extension supersedes it.

## License

MIT
