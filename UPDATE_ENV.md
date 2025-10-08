# 🔧 Update Your .env.local File

## Current Status:
✅ Clerk keys configured  
✅ Stripe keys configured  
⚠️ Need to add: CLERK_WEBHOOK_SECRET  
⚠️ Need to add: STRAPI_API_TOKEN  

## Quick Update Commands

Once you have both tokens, run these commands:

### 1. Add Strapi API Token:
```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend

# Replace YOUR_TOKEN_HERE with the actual token from Strapi
echo "STRAPI_API_TOKEN=YOUR_TOKEN_HERE" >> .env.local
```

### 2. Add Clerk Webhook Secret:
```bash
# Replace YOUR_WEBHOOK_SECRET with the secret from Clerk
echo "CLERK_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET" >> .env.local
```

## Or Edit Manually:

Open `.env.local` and add these two lines at the end:

```env
# Strapi API Token (from Strapi Admin → Settings → API Tokens)
STRAPI_API_TOKEN=paste_your_token_here

# Clerk Webhook Secret (from Clerk Dashboard → Webhooks)
CLERK_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

## Verify Your Complete .env.local:

Your file should have all these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/video-library
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/video-library

# Strapi
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_actual_token

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## After Adding Tokens:

Restart your Next.js dev server:
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

## Next Steps:

1. ✅ Get Strapi API Token (follow GET_STRAPI_TOKEN.md)
2. ✅ Add token to .env.local
3. ✅ Choose webhook option (follow CLERK_WEBHOOK_OPTIONS.md)
4. ✅ Add webhook secret to .env.local
5. ✅ Restart dev server
6. ✅ Test user signup!
