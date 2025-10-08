# Quick Start: Add to Cart & Stripe Checkout

## ✅ What's Already Working

Your shopping cart system is **fully functional**:
- ✅ Add to cart functionality on product pages
- ✅ Cart page at `/cart` with quantity controls
- ✅ Remove items from cart
- ✅ Cart persists in localStorage
- ✅ Stripe checkout integration
- ✅ Success page after payment

## 🚀 Quick Setup (5 Minutes)

### 1. Get Stripe Test Keys

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a free account (no credit card needed for test mode)
3. Once logged in, click **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`) - click "Reveal test key"

### 2. Add Keys to .env.local

Open or create `/piped-peony-frontend/.env.local` and add:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

Replace `YOUR_KEY_HERE` with your actual keys from Step 1.

### 3. Restart the Server

```bash
# In the piped-peony-frontend directory
# Press Ctrl+C to stop the server
# Then restart it:
pnpm dev
```

## 🧪 Test the Checkout

### Step 1: Add Items to Cart
1. Go to `http://localhost:3000/shop`
2. Click on any product
3. Choose quantity (and hand preference if applicable)
4. Click **"ADD TO CART"** button
5. You'll see "Item added to cart!" alert

### Step 2: View Cart
1. Go to `http://localhost:3000/cart` (or click cart icon in header)
2. You'll see your items with:
   - Product image and name
   - Price per item
   - Quantity controls (+/- buttons)
   - Remove button (red X)
   - Total price

### Step 3: Checkout with Stripe
1. Click **"Proceed to Checkout"** button
2. You'll be redirected to Stripe's secure checkout page
3. Use this test card:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: `12/34` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
4. Fill in name and email
5. Click **"Pay"**

### Step 4: Order Confirmation
1. After successful payment, you'll be redirected to `/checkout/success`
2. See your order confirmation with reference number
3. Your cart will be automatically cleared

## 🧪 Test Cards

**Successful Payment:**
```
4242 4242 4242 4242
```

**Declined Card:**
```
4000 0000 0000 0002
```

**Requires 3D Secure Authentication:**
```
4000 0025 0000 3155
```

All test cards work with:
- Any future expiry date
- Any 3-digit CVC
- Any 5-digit ZIP code

## 📱 How to Access Your Shop

1. **Shop Page**: `http://localhost:3000/shop` - Browse all products
2. **Product Page**: `http://localhost:3000/shop/item/[slug]` - View product details & add to cart
3. **Cart Page**: `http://localhost:3000/cart` - Manage cart & checkout
4. **Success Page**: `http://localhost:3000/checkout/success` - Order confirmation (after payment)

## 🎨 Features

### Product Page Features:
- Image gallery with thumbnails
- Product name and price
- Quantity selector
- Hand preference selector (if applicable)
- "Add to Cart" button with loading state
- Product description and specifications
- Disclaimer section

### Cart Page Features:
- Product images and names
- Price per item
- Quantity controls with +/- buttons
- Direct quantity input
- Remove items individually
- Cart total calculation
- Continue shopping link
- Proceed to checkout button

### Checkout Features:
- Secure Stripe payment processing
- Credit/debit card payments
- Address collection
- Email confirmation
- Order reference number
- Automatic cart clearing after success

## 💡 Tips

1. **Cart Badge**: The cart icon in the header shows the number of items
2. **Variants**: Products with hand preference create separate cart items
3. **Persistence**: Your cart is saved even if you close the browser
4. **Live Updates**: Cart totals update automatically when you change quantities
5. **Mobile Friendly**: The entire shop works great on mobile devices

## 🔧 Troubleshooting

**"Stripe is not defined" Error:**
- Make sure you added the keys to `.env.local`
- Restart the server after adding environment variables

**"Invalid API Key" Error:**
- Check that your Stripe keys are correct
- Make sure you copied the full key (they're long!)
- Verify you're using test keys (starting with `pk_test_` and `sk_test_`)

**Cart Not Clearing After Checkout:**
- Clear your browser's localStorage
- Make sure the success page URL has `?session_id=` parameter

**Can't Access Strapi Products:**
- Make sure Strapi is running on `http://localhost:1337`
- Check that products are published in Strapi admin
- Verify blog permissions are set in Strapi (Settings → Users & Permissions → Public)

## 🎯 What Happens When You Click "Add to Cart"?

1. **Product page** (`/shop/item/[slug]`):
   - Reads product data from Strapi
   - Captures selected options (quantity, hand preference)
   - Calls `addItem()` from cart context
   - Shows success message

2. **Cart context** (`/contexts/cart-context.tsx`):
   - Adds item to cart state
   - Saves to localStorage
   - Updates cart total

3. **Cart page** (`/cart`):
   - Displays all cart items
   - Allows quantity/item management
   - Calculates totals

4. **Checkout** (`/api/checkout`):
   - Creates Stripe checkout session
   - Redirects to Stripe payment page

5. **Success** (`/checkout/success`):
   - Confirms payment
   - Clears cart
   - Shows order details

## 🚀 Ready for Production?

See `STRIPE_SETUP.md` for:
- Switching to live Stripe keys
- Setting up webhooks
- Email notifications
- Refund handling
- And more!

---

**Need Help?** Check `STRIPE_SETUP.md` for detailed documentation or `CART-README.md` for cart system details.

