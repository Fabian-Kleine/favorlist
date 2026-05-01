# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server with Turbopack
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # tsc --noEmit

pnpm db:generate  # generate Drizzle migrations from schema changes
pnpm db:migrate   # apply pending migrations
pnpm db:studio    # open Drizzle Studio (visual DB browser)
```

## Stack

- **Next.js 16** (App Router) + React 19, TypeScript strict mode, ES modules
- **Auth:** Auth.js v5 (NextAuth beta) with Google OAuth and DrizzleAdapter (database session strategy)
- **DB:** Drizzle ORM + PostgreSQL (`DATABASE_URL`)
- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS v4 + Framer Motion
- **Forms:** React Hook Form with native validation rules (not zodResolver — see Gotchas)
- **i18n:** next-intl v4, English and German, messages in `i18n/messages/{locale}.json`
- **File uploads:** Vercel Blob via `app/api/upload/`
- **Link previews:** open-graph-scraper via `app/api/og-scrape/`

## Architecture

### Routing

Route groups under `app/`:
- `(app)/` — authenticated routes (dashboard, wishlist management). Server-side session check in group layout.
- `(auth)/` — public auth routes (login page).
- `wishlists/[slug]/` — publicly accessible wishlist views (no auth required).
- `api/auth/` — NextAuth route handler; `api/upload/`; `api/og-scrape/`.

### Auth flow

Config in `lib/auth.ts`. Exports `{ auth, handlers, signIn, signOut }`. The `auth()` function is used as a **proxy** (not middleware — see Gotchas). Protected routes call `auth()` server-side in their layouts or pages and redirect to `/login` if unauthenticated.

### Data layer

All mutations go through **Server Actions** in `app/actions/`:
- `wishlist.ts` — wishlist CRUD
- `items.ts` — item management (add, claim, delete, reorder)

Server actions do Zod validation server-side. No tRPC or dedicated API routes for data — only server actions and the three API routes listed above.

### Database schema (`db/schema.ts`)

NextAuth tables (`user`, `account`, `session`, `verificationToken`) plus two app tables:

```
wishlist        id, userId, title, description, slug, isPublic, deadline, createdAt, updatedAt
wishlist_item   id, wishlistId, url, title, description, imageUrl, price,
                claimedByUserId, claimedAt, sortOrder, createdAt
```

Relations: `user` → many `wishlist`; `wishlist` → many `wishlist_item`; `wishlist_item.claimedByUserId` → `user`.

### i18n

Locale detected from `NEXT_LOCALE` cookie or `Accept-Language`, falling back to `en`. Use `useTranslations()` (client) or `getTranslations()` (server) from next-intl. Add keys to both `en.json` and `de.json`.

## Gotchas

### Do not use `zodResolver` with React Hook Form

`@hookform/resolvers` v5.2.2 was built against Zod 4.0.x; the project uses Zod 4.4+. The minor-version mismatch causes TypeScript errors. Use RHF's native `register("field", { required: "…", maxLength: { value: N, message: "…" } })` rules instead. Zod is still used for server-side validation in server actions.

### Use `proxy.ts`, not `middleware.ts`

Next.js 16 renamed the file convention from `middleware.ts` to `proxy.ts`. Having a `middleware.ts` file alongside `proxy.ts` causes an `unhandledRejection` crash. Always create `proxy.ts` for route interception; `auth()` from Auth.js works as a proxy handler with the same API.

### Framer Motion `ease` typing

Framer Motion v12 `Variants` type requires `ease` to be a typed `Easing` value. A plain string like `"easeOut"` gets widened to `string` and causes a TS error. Use cubic bezier tuples (`ease: [0.25, 0.1, 0.25, 1] as const`) or define variants `as const`.

## Environment Variables

```
DATABASE_URL
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
BLOB_READ_WRITE_TOKEN
NEXT_PUBLIC_APP_URL
```
