# SquadUp — Telegram Mini App

Mobile-first gaming social & community Mini App: feed, teammate/clan finder, create flows, notifications, and Telegram-synced profiles.

Ukrainian is the default language. English is available in Profile → Settings.

## Stack

- Client: React 19, Vite, Tailwind CSS, `@telegram-apps/sdk`, i18next
- Server: Express, HMAC `initData` validation, 20MB media uploads

## Run locally

Needs Node 20+. From this folder:

```bash
cp .env.example server/.env
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

Without a bot token, `DEV_AUTH=true` signs you in as the seeded user (`@wms`) so the UI works in a normal browser.

## Telegram Bot setup

1. Create a bot with [@BotFather](https://t.me/BotFather).
2. Put the token in `server/.env` as `BOT_TOKEN=...` and set `DEV_AUTH=false` in production.
3. Create a Mini App (`/newapp`) and point it at your **HTTPS** URL (use ngrok or similar for local testing).
4. Open the Mini App inside Telegram. The client sends raw `initData`; the server validates the hash with the bot token before creating/updating the user.

## Validation

Telegram `initData` is checked with:

`HMAC_SHA256(HMAC_SHA256("WebAppData", bot_token), data_check_string)`

User fields stored on first launch: Telegram ID, username, first/last name, avatar URL.

## Media

Client and server both reject files over **20MB**. Allowed types: `image/*` and `video/*`.

## Git

This machine does not currently have Xcode Command Line Tools, so `git init` could not run. After installing them:

```bash
xcode-select --install
cd ~/tma-gaming-social
git init
```
