# Done — home services booking app

A working full-stack version of the "Done" prototype: real signup/login, a
real service catalog, a real booking flow, and a bookings list — all backed
by a live server, no more static mock screens.

## Run it locally

Requires only Node.js 18+ — there are **no npm dependencies to install**.

```bash
node server.js
```

Then open **http://localhost:3000** in your browser.

Data (users, bookings, feedback) is stored in `data/db.json`, created
automatically on first run. Delete that file any time to reset the app.

## What's real vs. what's a placeholder

**Real and working:**
- Account creation / login (passwords hashed with scrypt, never stored in plain text)
- The full service catalog (46 services across 9 categories), served from the API
- Booking a service (date, time, address, notes) — persisted per user
- Viewing your bookings (upcoming vs. past), and cancelling a pending one
- Editing your profile (name, phone)
- An AI concierge chat — currently a keyword-matching assistant (see below), not a live LLM
- Feedback submission

**Still placeholders (by design, since they need real accounts with a provider):**
- **Payment methods** — no card is actually charged. Bookings show pricing upfront but nothing is billed. Wiring this up needs a payment processor (e.g. Stripe) and its own API keys.
- **Done VIP subscription** — the upgrade button just shows a "coming soon" message.
- **AI concierge** — it matches your message against a keyword list to suggest services, rather than calling a language model. If you want a real LLM-powered concierge, the cleanest path is adding a call to the Claude API from `handleApi()` in `server.js` (needs an `ANTHROPIC_API_KEY`) — happy to wire that up if useful.

## Deploying it

Because it's a single Node process with a JSON file for storage, it deploys
almost anywhere that runs Node:
- **Render / Railway / Fly.io**: point them at this repo, start command `node server.js`.
- **A VPS**: `node server.js` behind nginx, or run it with `pm2` for restarts.
- One caveat: `data/db.json` needs to live on persistent disk — on platforms with ephemeral filesystems (e.g. some serverless targets), swap it for a real database (Postgres, SQLite with a persistent volume, etc.) before relying on it in production.

## Project structure

```
server.js          — HTTP server, all API routes, auth, booking logic
data/services.js    — the service catalog (seed data)
data/db.json        — created at runtime: users, bookings, sessions, feedback
public/index.html   — app shell
public/styles.css   — visual design (kept from the original prototype)
public/app.js       — all frontend logic (auth, browsing, booking, chat, profile)
```
