# Subscription Sync Fix - Quick Start Guide

## What Was Fixed

Your app had an issue where customers would sometimes sign up in Stripe but not get created in Clerk. This caused:
- ✅ Customer has Stripe subscription and is charged
- ❌ Customer can't log in (no Clerk account exists)
- 😢 Unhappy customers

## Root Cause

The Stripe webhook that creates Clerk accounts was:
1. Timing out on slow API calls
2. Not tracking which events it already processed (no idempotency)
3. Returning errors that caused retry loops

## What Changed

### 1. Updated Webhook (`/api/stripe-webhook/route.ts`)
- ✅ Always returns 200 to Stripe (prevents retry loops)
- ✅ Tracks processed events to prevent duplicates
- ✅ Better error handling and logging
- ✅ Won't throw errors that break the webhook

### 2. New Admin Endpoint (`/api/admin/fix-missing-clerk-accounts`)
- Finds customers with Stripe subscriptions but no Clerk accounts
- Can be run anytime to audit your system
- Reports issues for manual intervention

### 3. Health Check Script (`scripts/check-subscription-health.ts`)
- Quick command-line tool to check for issues
- Faster than the API endpoint for quick checks

## Immediate Next Steps

### Step 1: Install Dependencies

```bash
pnpm install
# or
npm install
```

This installs `tsx` (needed for the health check script).

### Step 2: Test Password Encryption

Verify the encryption is working correctly:

```bash
pnpm run test-encryption
```

You should see all tests passing. This confirms passwords will be encrypted securely.

### Step 3: Check for Existing Issues

Run the health check to find customers who already have this problem:

```bash
pnpm run check-subscriptions
```

This will show you which customers have Stripe subscriptions but are missing Clerk accounts.

### Step 4: Deploy Updated Webhook

Deploy your app to production so the fixed webhook code is live:

```bash
# If using Vercel
vercel --prod

# Or your normal deployment process
```

### Step 5: Set Up Admin API Key

Add this to your environment variables (`.env.local` for dev, production dashboard for prod):

```bash
ADMIN_API_KEY=your-random-secret-key-here
```

Generate a secure random key:
```bash
openssl rand -base64 32
```

### Step 6: Test the Admin Endpoint

Test the admin endpoint to find existing issues:

```bash
curl -X POST https://your-domain.com/api/admin/fix-missing-clerk-accounts?dryRun=true \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-key"}'
```

## Fixing Affected Customers

If you find customers who have Stripe subscriptions but no Clerk accounts, here's how to fix them:

### Option 1: Password Reset Flow (Recommended)

1. Send them to your password reset page
2. They enter their email
3. Clerk will create the account when they set a password
4. Their Clerk account will be automatically linked to their Stripe subscription

### Option 2: Manual Account Creation

1. Go to your Clerk Dashboard
2. Create a user with their email
3. Run the admin endpoint to link their accounts:
   ```bash
   curl -X POST https://your-domain.com/api/admin/fix-missing-clerk-accounts \
     -H "Content-Type: application/json" \
     -d '{"adminKey": "your-admin-key"}'
   ```

## Preventing Future Issues

### Recommended: Add Redis for Idempotency

The current fix uses in-memory tracking, which works but isn't perfect. For production, use Redis:

#### Option A: Upstash (Easiest)

1. Sign up at [upstash.com](https://upstash.com/)
2. Create a Redis database
3. Add to your environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```
4. Install the client:
   ```bash
   pnpm add @upstash/redis
   ```
5. Update the webhook to use Redis (see WEBHOOK_RELIABILITY_GUIDE.md)

#### Option B: Vercel KV (If using Vercel)

1. Go to your project in Vercel dashboard
2. Add Storage → KV
3. It will automatically add environment variables
4. Same code as Upstash (it's built on Upstash)

### Optional: Add Error Tracking

Set up Sentry or similar to catch webhook errors:

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Then webhook errors will be automatically reported.

### Optional: Set Up Monitoring

Run the health check regularly:

1. Add a cron job (if using Vercel, use Vercel Cron)
2. Or manually run weekly:
   ```bash
   pnpm run check-subscriptions
   ```

## Understanding the Logs

After deploying, watch your webhook logs. You'll see these markers:

### Good Signs ✅
```
🔔 Stripe webhook received: checkout.session.completed
🆕 Pending signup detected - creating Clerk account now...
✅ Created Clerk user: user_xxx
✅ Updated Stripe customer with name and Clerk user ID
✅ Updated Stripe subscription with Clerk user ID
```

### Issues to Watch For ⚠️
```
❌❌❌ CRITICAL: Failed to create Clerk user!
❌❌❌ USER NOT CREATED - MANUAL FIX REQUIRED
```

If you see these, run the admin endpoint or health check to find affected customers.

## Quick Reference

### Check for Issues
```bash
pnpm run check-subscriptions
```

### Find Stuck Customers (API)
```bash
curl -X POST https://your-domain.com/api/admin/fix-missing-clerk-accounts?dryRun=true \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-key"}'
```

### Test Webhook Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger a test
stripe trigger checkout.session.completed
```

## Questions?

**Q: Do I need Redis?**
A: Not immediately, but highly recommended for production. The in-memory solution will work for now.

**Q: Is this a Postgres issue?**
A: No, Clerk and Stripe manage their own databases. Your Postgres isn't involved in this issue.

**Q: Will this fix existing customers?**
A: No, you need to manually fix them using the steps in "Fixing Affected Customers" above.

**Q: How do I know if it's working?**
A: Watch your webhook logs for ✅ success messages. No "CRITICAL" errors = it's working.

**Q: What if I still see the issue?**
A: Check these:
1. Are your webhook secrets correct in environment variables?
2. Is the webhook endpoint configured in Stripe dashboard?
3. Are there any errors in your logs?
4. Run the health check to see the current state

## Files Changed

- ✅ `app/api/stripe-webhook/route.ts` - Main fix (webhook reliability)
- ✅ `app/api/guest-checkout/route.ts` - Added password encryption
- ✅ `app/api/admin/fix-missing-clerk-accounts/route.ts` - New admin endpoint
- ✅ `lib/crypto.ts` - New encryption utilities (AES-256-GCM)
- ✅ `scripts/check-subscription-health.ts` - New health check script
- ✅ `scripts/test-encryption.ts` - Test encryption/decryption
- ✅ `package.json` - Added `tsx` and utility commands
- 📚 `WEBHOOK_RELIABILITY_GUIDE.md` - Detailed explanation
- 📚 `SUBSCRIPTION_SYNC_FIX.md` - This file

## Security Improvements

### Password Encryption
Passwords are now **encrypted** (AES-256-GCM) before being stored in Stripe metadata:
- ✅ Not readable in Stripe dashboard
- ✅ Can only be decrypted by your webhook
- ✅ Uses authenticated encryption (prevents tampering)
- ✅ Random initialization vector (different output each time)

Test it with: `pnpm run test-encryption`

## Support

If you're still having issues after following this guide:

1. Run the health check and save the output
2. Check your webhook logs for errors
3. Verify environment variables are set correctly
4. Read WEBHOOK_RELIABILITY_GUIDE.md for deeper explanation
