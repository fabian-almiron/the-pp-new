# Stripe Webhook Setup Guide

## 🔧 Webhook Configuration

### 1. Webhook URL

**Production:**
```
https://your-domain.com/api/stripe-webhook
```

**Development (using Stripe CLI):**
```
http://localhost:3000/api/stripe-webhook
```

### 2. Required Webhook Events

Configure these events in your Stripe Dashboard (Settings > Webhooks):

#### ✅ Critical Events (REQUIRED):
- `checkout.session.completed` - Fires when checkout completes
- `customer.subscription.created` - When subscription is first created
- `customer.subscription.updated` - When subscription status changes (trial ends, renewal, etc.)
- `customer.subscription.deleted` - When subscription is canceled
- `invoice.payment_succeeded` - When recurring payment succeeds
- `invoice.payment_failed` - When recurring payment fails
- `invoice.created` - When invoice is generated

#### 📊 Recommended Events:
- `payment_intent.succeeded` - Payment confirmation
- `payment_intent.payment_failed` - Payment failure notification

### 3. Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk Keys
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Strapi
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-url.com
```

### 4. How to Get Your Webhook Secret

#### For Production:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/api/stripe-webhook`
4. Select all the events listed above
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to your production environment as `STRIPE_WEBHOOK_SECRET`

#### For Local Development:
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or download from [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
4. Copy the webhook signing secret from the output
5. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 🐛 Debugging Signup → Stripe Redirect Issue

### Check List:

1. **Verify Environment Variables:**
   - Open your `.env.local` file
   - Ensure `STRIPE_SECRET_KEY` is set (starts with `sk_test_` or `sk_live_`)
   - Ensure `NEXT_PUBLIC_STRAPI_URL` is correct

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try signing up again
   - Look for errors (especially 500 or 404 errors)

3. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Filter by "subscription-checkout"
   - Try signing up and selecting a plan
   - Click on the request and check:
     - Status code (should be 200)
     - Response body (should contain `url` field)

4. **Check Server Logs:**
   - Look at your terminal where Next.js is running
   - Should see logs like:
     ```
     🔍 Fetching subscription from Strapi: [subscription-id]
     ✅ Found subscription: [name]
     🛒 Creating Stripe checkout session...
     ✅ Created Stripe checkout session: [session-id]
     ```

5. **Common Issues:**

   **Issue: 500 Error - "Stripe configuration missing"**
   - Solution: Add `STRIPE_SECRET_KEY` to `.env.local`
   - Restart your dev server after adding

   **Issue: 404 Error - "Subscription not found"**
   - Solution: Check that your subscription has a `stripePriceId` in Strapi
   - Go to Strapi > Subscriptions > Edit > Add Stripe Price ID

   **Issue: Nothing happens when clicking plan**
   - Solution: Check browser console for JavaScript errors
   - Make sure user is signed in (check Clerk)

   **Issue: Error "User must be logged in to subscribe"**
   - Solution: User isn't authenticated yet
   - Check that Clerk sign-up completed successfully

## 🧪 Testing Webhook Locally

1. Install and configure Stripe CLI (see above)

2. Run webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

3. In another terminal, trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

4. Check your server logs for:
   ```
   🔔 Stripe webhook received: checkout.session.completed
   ```

## 🚀 Going to Production

1. Create webhook endpoint in Stripe Dashboard with your production URL
2. Add all required events
3. Copy webhook secret to production environment variables
4. Test with a real transaction (use Stripe test cards)
5. Monitor webhook logs in Stripe Dashboard

## 📝 Test Cards

Use these for testing:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Auth:** `4000 0025 0000 3155`

Any future expiry date, any CVC, any postal code.

## 🔍 Monitoring

Check webhook delivery in:
- [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
- Click on your endpoint
- View "Recent deliveries" to see success/failures

