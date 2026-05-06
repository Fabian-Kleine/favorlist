# Favorlist

<video
src="https://github.com/Fabian-Kleine/project-showcases/raw/refs/heads/main/favorlist.mp4"
preload="metadata"
autoplay
muted
loop
/>

A wishlist sharing app. Create wishlists, add items with link previews and images, share them publicly, and let friends claim gifts.

## Stack

- **Next.js 16** (App Router) + React 19, TypeScript strict mode
- **Auth.js v5** with Google OAuth (database session strategy via DrizzleAdapter)
- **Drizzle ORM** + PostgreSQL
- **shadcn/ui** (Radix UI) + Tailwind CSS v4 + Framer Motion
- **next-intl v4** — English and German
- **Vercel Blob** for file uploads
- **open-graph-scraper** for link previews

## Getting started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env` file with:

```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=
```

## Scripts

```bash
pnpm dev          # dev server with Turbopack
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # tsc --noEmit

pnpm db:generate  # generate Drizzle migrations from schema changes
pnpm db:migrate   # apply pending migrations
pnpm db:studio    # open Drizzle Studio
```

## Project structure

- [app/(app)/](app/(app)/) — authenticated routes (dashboard, wishlist management)
- [app/(auth)/](app/(auth)/) — public auth routes (login)
- [app/wishlists/[slug]/](app/wishlists/) — publicly accessible wishlist views
- [app/actions/](app/actions/) — server actions for all mutations
- [app/api/](app/api/) — auth, upload, and OG scrape route handlers
- [db/schema.ts](db/schema.ts) — Drizzle schema
- [lib/auth.ts](lib/auth.ts) — Auth.js config
- [i18n/messages/](i18n/messages/) — translation files (`en.json`, `de.json`)
