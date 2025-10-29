# Migration Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# ========================================
# Clerk Authentication (REQUIRED)
# ========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk URLs (customize these)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/video-library
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/video-library

# ========================================
# Migration Control (OPTIONAL)
# ========================================

# Show/hide the migration notice banner on login page
# Set to 'true' to show, 'false' to hide
NEXT_PUBLIC_SHOW_MIGRATION_NOTICE=true

# ========================================
# Existing Variables (keep these)
# ========================================

# Strapi Backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## How to Get Your Keys

### Clerk Keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Click "API Keys" in the sidebar
4. Copy the keys and paste into `.env.local`

### Where to Find What

| Variable | Where to Find It |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| Stripe keys | Your existing setup |
| Strapi URL | Your existing setup |

## Quick Setup Script

Run this to check if your environment is configured correctly:

```bash
# Create this as scripts/check-env.js
node -e "
const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

console.log('🔍 Checking environment variables...\n');

let allGood = true;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log('✅', varName);
  } else {
    console.log('❌', varName, '(MISSING)');
    allGood = false;
  }
});

console.log('\n' + (allGood ? '✨ All required variables set!' : '⚠️  Some variables missing. Check your .env.local'));
"
```

## After Adding Variables

**IMPORTANT:** Restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
pnpm dev
```

## Production Setup

For deployment (Vercel, etc.):

1. Go to your hosting platform's dashboard
2. Find "Environment Variables" section
3. Add the same variables (but use `pk_live_` and `sk_live_` keys for production)
4. Redeploy your application

---

**Need help?** Check the main `WORDPRESS_MIGRATION_GUIDE.md` for more details!

