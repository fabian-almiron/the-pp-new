# CLAUDE.md — The Piped Peony Academy

> AI assistant guide for the `the-pp-new` codebase. Keep this file updated when making architectural changes.

---

## Project Overview

**The Piped Peony Academy** is a full-stack e-commerce and educational SaaS platform for buttercream cake decorating. It combines a subscription-gated course library, a physical product shop, recipes, a blog, and a video library.

**Tech Stack:**
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 3 + shadcn/ui (Radix UI primitives)
- **Auth:** Clerk v6 (OAuth, webhooks, user metadata for roles)
- **Payments:** Stripe v19 (subscriptions + one-time purchases)
- **CMS:** Strapi (cloud-hosted headless CMS)
- **Email:** Brevo (formerly Sendinblue) via Nodemailer
- **Package Manager:** pnpm
- **Deployment:** Vercel

---

## Directory Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers (28 endpoints)
│   ├── layout.tsx          # Root layout (Clerk, providers, analytics)
│   ├── page.tsx            # Home page (ISR: 5-min revalidation)
│   ├── globals.css         # Global styles (75KB, CSS variables)
│   ├── middleware.ts        # Auth middleware (route protection)
│   └── [routes]/           # Feature pages (academy, shop, blog, etc.)
├── components/             # Shared React components
│   └── ui/                 # shadcn/ui components (do not hand-edit)
├── contexts/               # React Context providers
│   └── cart-context.tsx    # Shopping cart state (reducer pattern)
├── hooks/                  # Custom React hooks
├── lib/                    # Business logic & API clients
│   ├── strapi-api.ts       # Strapi CMS client (33KB — main data layer)
│   ├── email.ts            # Brevo/Nodemailer email helpers
│   ├── roles.ts            # RBAC role & permission system
│   ├── crypto.ts           # AES-256 encryption utilities
│   ├── sanitize.ts         # HTML sanitization (DOMPurify)
│   ├── utils.ts            # General helpers
│   └── mock-api.ts         # Fallback mock data for dev
├── data/                   # Type definitions & static constants
│   ├── types.ts            # TypeScript interfaces
│   ├── products.ts         # Product metadata
│   └── users.ts            # User utilities
├── scripts/                # Admin/maintenance scripts (run with tsx)
├── public/                 # Static assets (fonts, images)
├── types/                  # Global TypeScript declarations
├── assets/                 # Media assets
└── reference/              # Architectural reference docs
```

---

## Development Commands

```bash
pnpm dev                    # Start dev server (localhost:3000)
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm lint                   # ESLint check

# Maintenance scripts (require .env vars)
pnpm check-subscriptions    # Audit subscription/role sync health
pnpm test-encryption        # Verify AES-256 encryption
pnpm fix-guest-roles        # Repair guest user role assignments
```

---

## Environment Variables

These must be set in `.env.local` for development:

```env
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe (Payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Strapi (CMS)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337  # or Strapi Cloud URL

# Brevo (Email via SMTP)
BREVO_SMTP_HOST=
BREVO_SMTP_PORT=
BREVO_SMTP_USER=
BREVO_SMTP_KEY=
BREVO_FROM_EMAIL=
```

---

## Authentication & Authorization

### Clerk Integration
- All auth is handled by Clerk. Do not build custom auth.
- User roles are stored in Clerk's `publicMetadata.role` field.
- Middleware (`middleware.ts`) protects routes server-side.
- Subscriber-only content is gated both in middleware and client-side.

### RBAC System (`lib/roles.ts`)
Two roles exist: `customer` and `subscriber`.

**Permissions (14 total):**
| Permission | customer | subscriber |
|---|---|---|
| PURCHASE_PRODUCTS, VIEW_CART | ✅ | ✅ |
| ACCESS_FREE_CONTENT | ✅ | ✅ |
| MANAGE_PROFILE, VIEW_ORDER_HISTORY | ✅ | ✅ |
| ACCESS_PREMIUM_CONTENT | ❌ | ✅ |
| ACCESS_VIDEO_LIBRARY, STREAM_VIDEOS | ❌ | ✅ |
| ACCESS_ACADEMY, ACCESS_COURSES | ❌ | ✅ |
| ACCESS_COLOR_LIBRARY, ACCESS_RECIPE_LIBRARY | ❌ | ✅ |

**Usage:**
```ts
import { getUserRole, hasPermission, PERMISSIONS } from "@/lib/roles";

const role = await getUserRole(userId);
const canAccessAcademy = hasPermission(role, PERMISSIONS.ACCESS_ACADEMY);
```

### Protected Routes (middleware.ts)
- `/my-account`, `/dashboard`, `/profile` → require login
- `/academy`, `/colors` → require login (role-checked client-side)
- Unauthenticated users are redirected to `/login?redirect_url=...`

---

## Payments & Subscriptions (Stripe)

### Checkout Flows
1. **One-time purchase** → `/api/checkout` → Stripe `payment` mode
2. **Subscription** → `/api/subscription-checkout` → Stripe `subscription` mode

### Webhook Processing (`/api/stripe-webhook`)
- Events are verified with `STRIPE_WEBHOOK_SECRET`
- Idempotency tracking prevents duplicate processing (in-memory; use Redis/DB for production scale)
- **Critical:** Always return `200` even on non-fatal errors — Stripe retries on non-2xx responses
- Events handled:
  - `checkout.session.completed`
  - `customer.subscription.created` / `updated`
  - `invoice.payment_succeeded`
  - `customer.deleted`

### Subscription Lifecycle
1. User signs up → Stripe checkout session created
2. `checkout.session.completed` webhook fires
3. User role updated to `subscriber` in Clerk `publicMetadata`
4. Welcome email sent via Brevo
5. Role synced to Clerk → content gates open client-side

---

## Content Management (Strapi)

All content is managed in Strapi CMS. The API client lives in `lib/strapi-api.ts`.

**Content types:** Products, Courses, Recipes, Blog Posts, Navigation Menus

**Strapi URL config:**
- Dev: `http://localhost:1337`
- Production: Strapi Cloud (`content.thepipedpeony.com` or `*.strapiapp.com`)

**Key functions in `lib/strapi-api.ts`:**
```ts
getProducts(params?)        // Product listing with filters
getCourseBySlug(slug)       // Single course with chapters
getRecipes(params?)         // Recipe catalog
getBlogPosts(params?)       // Blog with pagination
getMenu()                   // Navigation menu data
```

When fetching content, always check `lib/mock-api.ts` — it provides fallback data if Strapi is unavailable in dev.

---

## State Management

### Cart (`contexts/cart-context.tsx`)
- Redux-style reducer pattern using React Context
- Persisted to `localStorage`
- Cart items carry: `cartKey`, `stripePriceId`, `stripeProductId`, and variant info (hand, size, color, tuning)
- Actions: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`, `LOAD_CART`, `SYNC_FROM_STORAGE`

### Custom Hooks
| Hook | Purpose |
|---|---|
| `use-role.tsx` | Fetch current user's role from Clerk |
| `use-subscription.ts` | Subscription status with auto-sync |
| `use-stripe-customer.ts` | Link/fetch Stripe customer ID |
| `use-name-sync.ts` | Sync name from Stripe → Clerk |
| `use-mobile.tsx` | Mobile breakpoint detection |
| `use-toast.ts` | Toast notification helper |

---

## Email (`lib/email.ts`)

Email is sent via Brevo SMTP through Nodemailer.

**Available functions:**
- `sendSubscriptionTrialEmail(to, name)` — welcome/trial start
- `sendPurchaseReceiptEmail(to, order)` — order confirmation
- `sendInvoiceCopyToOwner(invoice)` — owner copy on payment

Do not use any other email library. All emails route through these helpers.

---

## Component Conventions

### shadcn/ui Components (`components/ui/`)
- These are generated files — **do not hand-edit them**
- Add new components with: `npx shadcn@latest add <component>`
- All Radix UI primitives are available

### Client vs. Server Components
- Default to **Server Components** unless the component needs interactivity, hooks, or browser APIs
- Add `"use client"` at the top only when necessary
- Interactive wrappers are common: a Server Component page fetches data and passes it to a `*-client.tsx` Client Component

### Naming Conventions
- Pages: `app/[route]/page.tsx`
- Client components: `[name]-client.tsx` (e.g., `course-page-client.tsx`)
- shadcn/ui: `components/ui/[name].tsx`
- Hooks: `hooks/use-[name].ts`
- API routes: `app/api/[name]/route.ts`

---

## API Routes

All routes live in `app/api/`. Use Next.js Route Handlers (`route.ts`).

**Key endpoints:**
| Endpoint | Purpose |
|---|---|
| `/api/products` | Product listing & search |
| `/api/courses` | Course catalog |
| `/api/checkout` | Create Stripe checkout (one-time) |
| `/api/subscription-checkout` | Create Stripe subscription checkout |
| `/api/stripe-webhook` | Handle Stripe events |
| `/api/clerk-webhook` | Handle Clerk auth events |
| `/api/orders` | Order management |
| `/api/cancel-subscription` | Cancel subscription |
| `/api/billing-portal` | Redirect to Stripe billing portal |
| `/api/link-stripe-customer` | Link Stripe customer to Clerk user |
| `/api/set-user-role` | Assign a role to a user |
| `/api/sync-name-from-stripe` | Sync name from Stripe → Clerk |
| `/api/fix-subscription-role` | Repair role for existing subscribers |
| `/api/download-ebook` | Serve e-book download |
| `/api/guest-checkout` | Handle guest user checkout |
| `/api/contact` | Contact form submission |
| `/api/search` | Search products/content |

---

## Styling Guidelines

- **Tailwind CSS** for all styling — no inline styles, no CSS modules
- **CSS variables** defined in `app/globals.css` power the color system — use them via Tailwind (`bg-background`, `text-foreground`, etc.)
- **Dark mode** is supported via the `class` strategy on `<html>`
- **Custom fonts** (via Google Fonts):
  - `Playfair Display` — headings
  - `Lato` — body text
  - `Dancing Script` — logo/brand
  - `Inter` — UI/body
  - `Alex Brush` — signature accent
- Mobile-first responsive design; use Tailwind breakpoints (`sm:`, `md:`, `lg:`)

---

## Security Practices

- **HTML sanitization:** Always use `lib/sanitize.ts` (DOMPurify) before rendering user-provided HTML
- **Encryption:** Use `lib/crypto.ts` (AES-256) for sensitive data at rest
- **Webhooks:** Always verify signatures before processing (Stripe uses `STRIPE_WEBHOOK_SECRET`, Clerk uses Svix)
- **Input validation:** Use Zod schemas for all API route inputs
- **TypeScript strict mode** is enabled — do not use `any` without justification
- **Security headers** are set in `vercel.json` (CSP, X-Frame-Options, etc.) — do not weaken these

---

## Performance Patterns

- **ISR (Incremental Static Regeneration):** Home page revalidates every 5 minutes (`revalidate = 300`)
- **Lazy loading:** Use `lazy-video-player.tsx` for video embeds
- **Image optimization:** Always use Next.js `<Image>` component (never `<img>`)
- **Package optimization:** `lucide-react` is tree-shaken via `optimizePackageImports` in `next.config.mjs`
- **Analytics:** Vercel Analytics + Speed Insights are already integrated in the root layout — do not add others without discussion

---

## Known Issues & TODOs

- `next.config.mjs` has `typescript.ignoreBuildErrors: true` due to pre-existing Stripe type incompatibilities. **Do not remove this flag** without first fixing those type errors.
- Webhook idempotency tracking is in-memory — acceptable for current scale, but should move to Redis or a DB for high-traffic production use.
- No automated test suite exists. Changes should be manually verified using the scripts in `/scripts` and through the Stripe dashboard/Svix webhook tester.

---

## Deployment

- Hosting: **Vercel** (auto-deploy from `master` branch)
- Config: `vercel.json` (security headers, 23+ URL redirects for legacy WordPress URLs, static asset caching)
- Build command: `pnpm build` (Next.js standard build)
- Image domains are whitelisted in `next.config.mjs` — add new domains there if needed

---

## Reference Documentation

Additional architectural guides in the repo root:
- `reference/SUBSCRIPTION_PRICING_CONTEXT.md` — Strapi/Stripe subscription flow, price changes (new vs existing), subscriber banner, $20 rollout checklist
- `WEBHOOK_RELIABILITY_GUIDE.md` — Stripe webhook patterns
- `WEBHOOK_PASSWORD_HANDLING.md` — Security for webhook data
- `SUBSCRIPTION_SYNC_FIX.md` — Subscription sync troubleshooting
- `SIGNUP_FLOW_DIAGRAM.md` — User signup flow diagram
- `CLERK_OAUTH_FIX.md` — OAuth configuration reference
- `SSO_REMOVAL_SUMMARY.md` — SSO removal context

---

## Quick Tips for AI Assistants

1. **Read before editing.** Understand context in `lib/strapi-api.ts` and `lib/roles.ts` before touching auth or content flows.
2. **Keep Stripe webhooks idempotent.** New event handlers must check for duplicate processing.
3. **Never write raw SQL or bypass Clerk.** All user data goes through Clerk's API.
4. **Check `mock-api.ts`** if Strapi data isn't available in dev — it provides fallback shapes.
5. **Shadcn components are generated.** Run `npx shadcn@latest add` to add new ones; don't manually edit `components/ui/`.
6. **TypeScript errors in Stripe types are pre-existing** — don't add workarounds for unrelated code.
7. **All emails through `lib/email.ts`.** Do not introduce new email libraries.
8. **Role changes must go through Clerk `publicMetadata`.** Direct DB role changes will not be reflected.
