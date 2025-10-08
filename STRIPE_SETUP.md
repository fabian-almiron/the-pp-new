# Stripe Checkout Integration Setup

This guide explains how to set up Stripe checkout for The Piped Peony shop.

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- Stripe API keys (test mode for development)

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** in the left sidebar
3. Click on **API keys**
4. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)

## Step 2: Add Environment Variables

Add the following to your `.env.local` file in the project root:

```bash
# Strapi Backend URL
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**⚠️ IMPORTANT**: 
- Never commit `.env.local` to git
- Use test keys for development (`pk_test_...` and `sk_test_...`)
- For production, use live keys (`pk_live_...` and `sk_live_...`)

## Step 3: Restart the Development Server

After adding the environment variables:

```bash
# Stop the server (Ctrl+C)
# Then restart it
pnpm dev
```

## Step 4: Test the Checkout Flow

1. Go to `http://localhost:3000/shop`
2. Add a product to your cart
3. Click "ADD TO CART"
4. Navigate to `http://localhost:3000/cart`
5. Click "Proceed to Checkout"
6. You'll be redirected to Stripe Checkout

### Test Cards (Test Mode Only)

Use these test card numbers in Stripe Checkout (test mode):

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## How It Works

### 1. Cart Page (`/app/cart/page.tsx`)
- Displays cart items with quantity controls
- "Proceed to Checkout" button calls `/api/checkout`

### 2. Checkout API (`/app/api/checkout/route.ts`)
- Receives cart items
- Creates a Stripe Checkout Session
- Returns session ID to frontend

### 3. Stripe Checkout
- User is redirected to Stripe's hosted checkout page
- Handles payment collection securely
- Redirects back to your site after completion

### 4. Success Page (`/app/checkout/success/page.tsx`)
- Displays order confirmation
- Clears the cart
- Shows order reference number

## Customization Options

### Update Allowed Countries

In `/app/api/checkout/route.ts`, modify:

```typescript
shipping_address_collection: {
  allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries
},
```

### Add Tax Calculation

Stripe can automatically calculate taxes. Add to the session creation:

```typescript
automatic_tax: {
  enabled: true,
},
```

### Add Metadata

Store custom information with the order:

```typescript
metadata: {
  order_id: '12345',
  customer_note: 'Special instructions',
},
```

## Webhooks (Optional but Recommended)

For production, set up webhooks to handle post-payment events:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Create the webhook handler in your API

## Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (`pk_live_...` and `sk_live_...`)
- [ ] Set up webhook handling for order fulfillment
- [ ] Test with real payment methods
- [ ] Configure Stripe account settings (business info, branding)
- [ ] Enable required payment methods in Stripe Dashboard
- [ ] Set up email notifications in Stripe
- [ ] Review and adjust shipping countries
- [ ] Test refund/cancellation flow

## Troubleshooting

### "Stripe is not defined" Error
- Make sure you added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
- Restart the development server after adding env variables

### "Invalid API Key" Error
- Verify your Stripe secret key in `.env.local`
- Check that you're using the correct key for your environment (test vs live)
- Ensure the key starts with `sk_test_` or `sk_live_`

### Checkout Session Not Creating
- Check the browser console and terminal for errors
- Verify all cart items have valid price data
- Make sure the API route is accessible at `/api/checkout`

### Cart Not Clearing After Success
- Check the browser console on the success page
- Verify the `session_id` parameter is in the URL
- Clear browser localStorage and try again

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing

## Security Notes

- Never expose your `STRIPE_SECRET_KEY` in client-side code
- Only `NEXT_PUBLIC_*` variables are accessible in the browser
- Always validate payment amounts on the server side
- Use HTTPS in production
- Keep Stripe libraries up to date

