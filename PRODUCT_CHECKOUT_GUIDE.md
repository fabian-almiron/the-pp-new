# 🛒 Complete Stripe Product Checkout Guide

## ✅ What's Been Set Up

Your Stripe checkout system is now fully configured with:

1. **Enhanced Strapi Product Schema** - Stores Stripe Product/Price IDs
2. **Smart Checkout API** - Supports both Stripe Products and dynamic pricing
3. **Webhook Handler** - Tracks purchases and order completion
4. **Cart System** - Handles product variations (size, color, hand preference)

---

## 📋 Quick Setup Steps

### Step 1: Restart Strapi

The product schema has been updated, so restart Strapi to register the new fields:

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
# Stop with Ctrl+C, then:
npm run dev
```

### Step 2: Configure Stripe CLI for Local Development

**For local development, use Stripe CLI:**

1. Run this command (keep it running in a terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

2. Copy the webhook secret (starts with `whsec_...`) from the terminal output

3. Add to your frontend `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Restart your Next.js dev server

**For production:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Copy the production webhook secret to your production environment variables

---

## 🎨 Adding Products - Two Methods

### Method A: Simple Products (Recommended for Getting Started)

**Best for:** Products without variations, quick setup

1. **Create Product in Strapi Only**
   - Go to: http://localhost:1337/admin/content-manager/collection-types/api::product.product
   - Fill in:
     - Name: "Flower Piping Tip Set"
     - Price: 29.99
     - Description, images, etc.
   - Leave `stripeProductId` and `stripePriceId` empty
   - Publish

2. **How it works:**
   - The checkout API will create the product in Stripe automatically
   - Works great for simple products
   - Less control over Stripe dashboard

### Method B: Stripe Products (Recommended for Production)

**Best for:** Professional setup, better inventory/analytics, product variations

#### Step 1: Create in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - Name: "Premium Piping Nozzle Set"
   - Description
   - Upload images
   - Price: $34.99 (or create multiple prices for variations)
4. Click "Save product"
5. **Copy the Product ID** (starts with `prod_`)
6. **Copy the Price ID** (starts with `price_`)

#### Step 2: Create in Strapi

1. Go to: http://localhost:1337/admin/content-manager/collection-types/api::product.product/create
2. Fill in:
   - Name: "Premium Piping Nozzle Set"
   - Price: 34.99
   - **stripeProductId**: `prod_...` (from Stripe)
   - **stripePriceId**: `price_...` (from Stripe)
   - Description, images, etc.
3. Publish

---

## 🎨 Handling Product Variations

For products with variations (size, color, hand preference):

### Option 1: Single Product with Frontend Variations

**Best for:** Variations that don't affect price

```json
// In Strapi, leave hasVariations: false
// Frontend cart handles the variation selection
// Example: "Left-Handed" vs "Right-Handed" scissors (same price)
```

### Option 2: Stripe Products with Multiple Prices

**Best for:** Variations with different prices (Small $20, Large $30)

1. **In Stripe:**
   - Create one product
   - Add multiple prices:
     - Small: $20 (price_small123)
     - Medium: $25 (price_med456)
     - Large: $30 (price_large789)

2. **In Strapi:**
   ```json
   {
     "name": "Piping Bag Set",
     "price": 20.00,  // Base price
     "hasVariations": true,
     "stripePriceId": "price_small123",  // Default price
     "variations": {
       "type": "size",
       "options": [
         {
           "name": "Small",
           "stripePriceId": "price_small123",
           "price": 20.00
         },
         {
           "name": "Medium",
           "stripePriceId": "price_med456",
           "price": 25.00
         },
         {
           "name": "Large",
           "stripePriceId": "price_large789",
           "price": 30.00
         }
       ]
     }
   }
   ```

---

## 🧪 Testing the Checkout Flow

### 1. Add Products to Cart

1. Go to http://localhost:3000/shop
2. Click a product
3. Select options (if available)
4. Click "Add to Cart"

### 2. Review Cart

1. Go to http://localhost:3000/cart
2. Verify items, quantities, prices
3. Update quantities if needed

### 3. Checkout

1. Click "Proceed to Checkout"
2. You'll be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code

### 4. Success Page

1. After payment, redirected to `/checkout/success`
2. Cart is automatically cleared
3. Check your terminal for webhook logs

### 5. Verify in Stripe Dashboard

1. Go to https://dashboard.stripe.com/payments
2. You should see the test payment
3. Click on it to see line items and customer info

---

## 🔍 Debugging

### Check Terminal Logs

**Frontend logs** (when creating checkout):
```
🛒 Creating checkout session for user: user_...
📦 Items: 2
Processing item: Piping Nozzle Set { stripePriceId: 'price_...', price: 29.99, quantity: 1 }
✅ Checkout session created: cs_test_...
```

**Webhook logs** (after payment):
```
🔔 Product purchase webhook received
✅ Webhook signature verified
📨 Event type: checkout.session.completed
💳 Checkout session completed: cs_test_...
📦 Line items: 2
```

### Common Issues

**Issue:** "Authentication required" error
- **Fix:** Make sure user is logged in before checkout

**Issue:** Cart not clearing after checkout
- **Fix:** Check browser console for errors on success page

**Issue:** Webhook not receiving events
- **Fix:** 
  1. Check webhook secret in `.env.local`
  2. Verify webhook URL in Stripe dashboard
  3. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/product-purchase`

**Issue:** Price mismatch between cart and Stripe
- **Fix:** Make sure `stripePriceId` in Strapi matches the Price ID in Stripe

---

## 🚀 Production Checklist

Before going live:

### Stripe Configuration
- [ ] Replace test API keys with live keys in `.env.local`
- [ ] Update webhook endpoint to production URL
- [ ] Enable all payment methods you want to accept
- [ ] Set up tax collection (if needed)
- [ ] Configure shipping rates

### Strapi Configuration
- [ ] All products have proper images
- [ ] Stock levels are set correctly
- [ ] Products are published
- [ ] API permissions are configured

### Testing
- [ ] Test checkout with real card (refund immediately)
- [ ] Verify webhook is receiving events
- [ ] Test with different browsers
- [ ] Test on mobile devices
- [ ] Verify email confirmations (when implemented)

### Monitoring
- [ ] Set up Stripe email notifications
- [ ] Monitor webhook delivery in Stripe dashboard
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

---

## 📊 Example Product Structures

### Simple Product (No Variations)
```json
{
  "name": "Buttercream Spatula",
  "slug": "buttercream-spatula",
  "description": "Professional offset spatula for smooth buttercream application",
  "price": 15.99,
  "stripeProductId": "prod_ABC123",
  "stripePriceId": "price_XYZ789",
  "stock": 50,
  "featured": false,
  "sku": "SPATULA-001",
  "hasVariations": false
}
```

### Product with Size Variations
```json
{
  "name": "Piping Bag Set",
  "slug": "piping-bag-set",
  "description": "Reusable piping bags in various sizes",
  "price": 20.00,
  "stripeProductId": "prod_DEF456",
  "stripePriceId": "price_small123",
  "stock": 100,
  "featured": true,
  "sku": "BAGS-001",
  "hasVariations": true,
  "variations": {
    "type": "size",
    "options": [
      {
        "name": "Small (10 bags)",
        "stripePriceId": "price_small123",
        "price": 20.00,
        "sku": "BAGS-001-S"
      },
      {
        "name": "Medium (15 bags)",
        "stripePriceId": "price_med456",
        "price": 28.00,
        "sku": "BAGS-001-M"
      },
      {
        "name": "Large (20 bags)",
        "stripePriceId": "price_large789",
        "price": 35.00,
        "sku": "BAGS-001-L"
      }
    ]
  }
}
```

### Product with Multiple Variation Types
```json
{
  "name": "Professional Piping Tips",
  "slug": "professional-piping-tips",
  "description": "Premium stainless steel piping tips",
  "price": 45.00,
  "stripeProductId": "prod_GHI789",
  "stripePriceId": "price_default999",
  "stock": 75,
  "featured": true,
  "sku": "TIPS-PRO-001",
  "hasVariations": true,
  "variations": {
    "types": ["size", "material"],
    "options": {
      "size": [
        { "name": "Standard", "priceModifier": 0 },
        { "name": "Large", "priceModifier": 10 }
      ],
      "material": [
        { "name": "Stainless Steel", "priceModifier": 0 },
        { "name": "Brass Plated", "priceModifier": 15 }
      ]
    }
  }
}
```

---

## 🎓 Next Steps

1. **Add Products**: Start with Method A (simple products) to test the flow
2. **Test Checkout**: Make a test purchase end-to-end
3. **Customize Success Page**: Add order tracking, email confirmation
4. **Create Order Content Type** (Optional): Track orders in Strapi
5. **Set up Email Notifications**: SendGrid, Mailgun, or Resend

---

## 💡 Pro Tips

1. **Use Stripe Test Mode** until you're confident everything works
2. **Create Product Templates** in Strapi for consistency
3. **Use SKUs** to track inventory across systems
4. **Enable Stripe Customer Portal** for self-service refunds
5. **Set up Abandoned Cart Emails** to recover lost sales
6. **Use Stripe Radar** for fraud prevention
7. **Enable Apple Pay & Google Pay** for faster checkout

---

## 🆘 Need Help?

- **Stripe Docs**: https://stripe.com/docs/checkout
- **Strapi Docs**: https://docs.strapi.io
- **Test Cards**: https://stripe.com/docs/testing

Happy selling! 🎉
