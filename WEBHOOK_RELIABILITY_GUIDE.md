# Webhook Reliability Guide

## The Problem

You've been experiencing an issue where some customers sign up in Stripe, get a customer ID and subscription, but **don't get created in Clerk**.

## Root Causes

### 1. **Webhook Timeouts** (Primary Issue)

Your Stripe webhook (`/api/stripe-webhook`) tries to do everything synchronously:

```
Webhook receives event
  ↓
Create Clerk user (external API call - can be slow)
  ↓
Update Stripe customer (external API call)
  ↓
Update Stripe subscription (external API call)
  ↓
Send welcome email (external API call)
```

If **any** of these steps timeout or fail:
- ✅ Stripe customer and subscription already exist
- ❌ Clerk user creation fails or gets skipped
- Stripe retries the webhook, hitting the same timeout issue

### 2. **No Idempotency Protection**

Without idempotency tracking, when Stripe retries a webhook:
- It might try to create a duplicate Clerk user → fails
- Or skip user creation entirely due to errors
- Creates inconsistent state

### 3. **Returning 500 Causes Retry Loops**

When the webhook returns a 500 error, Stripe keeps retrying. But the retries hit the same issues, creating a loop where customers exist in Stripe but not in Clerk.

### 4. **Race Conditions**

Multiple webhooks can fire for the same customer:
- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.payment_succeeded`

If these aren't properly synchronized, you can get duplicate attempts or skipped processing.

## Solutions Implemented

### ✅ 1. Idempotency Tracking

Added in-memory tracking to prevent processing the same webhook event twice:

```typescript
const processedEvents = new Set<string>();

// Check if already processed
if (processedEvents.has(event.id)) {
  return NextResponse.json({ received: true, note: 'already_processed' });
}
```

**Production Recommendation**: Replace the in-memory `Set` with Redis:
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Check and set with expiry (webhooks can be retried for up to 3 days)
const processed = await redis.get(`webhook:${event.id}`);
if (processed) {
  return NextResponse.json({ received: true, note: 'already_processed' });
}
await redis.set(`webhook:${event.id}`, 'processed', { ex: 259200 }); // 3 days
```

### ✅ 2. Always Return 200 to Stripe

Changed the webhook to **always** return 200, even if processing fails:

```typescript
} catch (error) {
  console.error('❌ CRITICAL: Webhook handler error');
  // STILL return 200 to prevent Stripe from retrying
  return NextResponse.json({ 
    received: true, 
    error: 'Handler failed but accepted to prevent retries',
    eventId: event.id 
  });
}
```

This prevents retry loops while still logging errors for manual intervention.

### ✅ 3. Better Error Handling & Logging

The webhook now:
- Logs detailed error information for debugging
- Doesn't throw errors that would cause 500 responses
- Handles partial failures gracefully
- Continues processing even if one step fails

### ✅ 4. Manual Recovery Endpoint

Created `/api/admin/fix-missing-clerk-accounts` to find and report customers who have Stripe subscriptions but no Clerk accounts.

**Usage:**
```bash
# Dry run - just check for issues
curl -X POST https://your-domain.com/api/admin/fix-missing-clerk-accounts?dryRun=true \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-secret-key"}'

# Check only first 10 customers
curl -X POST https://your-domain.com/api/admin/fix-missing-clerk-accounts?dryRun=true&limit=10 \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-secret-key"}'
```

## Do You Need Redis?

### **YES** - For Production

Redis is **highly recommended** for:

1. **Idempotency Tracking**: In-memory `Set` doesn't persist across deployments or serverless function instances
2. **Rate Limiting**: Prevent abuse of webhook endpoints
3. **Distributed Locks**: Ensure only one instance processes an event
4. **Job Queues**: Offload slow tasks (email sending) to background workers

**Recommended Service**: [Upstash Redis](https://upstash.com/) (serverless, pay-per-request, works great with Vercel/Netlify)

### **NO** - For Development/Low Volume

If you're just getting started or have low volume, the in-memory solution will work fine.

## Do You Need to Worry About Postgres?

### **NO** - This Isn't a Postgres Issue

Your Postgres database is **not** the problem because:

1. **Clerk manages its own database** - You don't store Clerk users in your Postgres
2. **Stripe manages its own database** - You don't store Stripe data in your Postgres
3. The issue is about API calls between services (Stripe → Your webhook → Clerk), not database performance

Your Postgres database is only relevant if you're storing additional data like orders, products, or custom user data.

## Recommended Architecture for High Reliability

### Current (Acceptable for Small Scale)
```
Stripe Webhook → Next.js API Route → Process Everything Synchronously
```

**Pros**: Simple
**Cons**: Timeouts, no retry logic, single point of failure

### Recommended (Production Scale)
```
Stripe Webhook → Next.js API Route → Return 200 Immediately
                                   ↓
                          Queue Job in Redis/Database
                                   ↓
                          Background Worker Processes Job
                                   ↓
                          Retry on Failure
```

**Pros**: Fast webhook responses, automatic retries, no timeouts
**Cons**: More complex setup

**Tools to Consider**:
- [Inngest](https://www.inngest.com/) - Serverless queues and workflows
- [Trigger.dev](https://trigger.dev/) - Background jobs for Next.js
- [BullMQ](https://docs.bullmq.io/) - Redis-based job queue (requires server)
- [Upstash QStash](https://upstash.com/docs/qstash) - HTTP-based job queue

## Monitoring & Alerting

To catch these issues faster, set up:

1. **Error Tracking**: Sentry, LogRocket, or similar
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   
   // In webhook error handler
   Sentry.captureException(error, {
     tags: { webhookEvent: event.type },
     extra: { eventId: event.id, customerId: customer.id }
   });
   ```

2. **Log Aggregation**: Datadog, Logtail, or similar
   - Search for "CRITICAL:" logs
   - Set up alerts for "USER NOT CREATED" errors

3. **Health Checks**: Regularly run the admin endpoint to check for issues
   ```typescript
   // Add to a cron job (using Vercel Cron or similar)
   // Every day at 9am, check for issues and email report
   ```

## Testing Webhooks Locally

Use Stripe CLI to test webhook reliability:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created

# Simulate failures
stripe trigger checkout.session.completed --add checkout.session.metadata.firstName:''
```

## Checklist for Production

- [ ] Replace in-memory `processedEvents` with Redis
- [ ] Add webhook signing secret validation (already done ✅)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure log aggregation
- [ ] Run admin endpoint weekly to check for stuck customers
- [ ] Add monitoring dashboard showing:
  - Webhook success rate
  - Average processing time
  - Failed Clerk user creations
- [ ] Consider background job queue for high-volume scenarios
- [ ] Document manual recovery process for support team

## Recovery Process for Stuck Customers

If a customer has a Stripe subscription but no Clerk account:

1. **They can't log in** - Clerk account doesn't exist
2. **They paid successfully** - Stripe has their subscription
3. **Fix it by**:
   - Send them to your password reset page
   - They enter their email
   - Clerk will create the account when they set a password
   - Or: Manually create their Clerk account via Clerk dashboard
   - Then: Run `/api/admin/fix-missing-clerk-accounts` to link accounts

## Environment Variables Needed

```bash
# Already configured
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLERK_SECRET_KEY=sk_xxx

# New (optional but recommended)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
ADMIN_API_KEY=your-secret-admin-key-here

# For error tracking (optional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Summary

**The Issue**: Webhook timeouts + lack of idempotency = some customers created in Stripe but not Clerk

**The Fix**: 
1. ✅ Always return 200 to Stripe (prevent retry loops)
2. ✅ Add idempotency tracking (prevent duplicate processing)
3. ✅ Better error handling & logging (catch issues)
4. ✅ Manual recovery endpoint (fix stuck customers)

**Do You Need Redis?**: Yes for production, no for development

**Do You Need Postgres?**: No, this isn't a database issue

**Next Steps**:
1. Deploy the updated webhook code
2. Set up Redis for idempotency (Upstash is easiest)
3. Run the admin endpoint to find existing stuck customers
4. Set up monitoring to catch future issues
5. Consider a background job queue for high volume
