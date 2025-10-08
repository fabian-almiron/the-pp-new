# 🔔 Stripe Webhook Setup Guide

## 📍 Webhook Destination URL

Your webhook endpoint is:
```
https://your-domain.com/api/webhooks/stripe
```

**For local development:**
```
http://localhost:3000/api/webhooks/stripe
```

---

## 🚀 Setup Instructions

### **Step 1: Add Webhook Secret to Environment Variables**

1. Open your `.env.local` file
2. Add this line:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

---

### **Step 2: Configure Webhook in Stripe Dashboard**

#### **For Production:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **+ Add endpoint**
4. Enter your endpoint URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
5. Click **Select events** and choose these events:

   **Required (Currently Implemented):**
   - ✅ `checkout.session.completed` - When user completes subscription purchase
   - ✅ `customer.subscription.updated` - When subscription status/plan changes
   - ✅ `customer.subscription.deleted` - When subscription is cancelled
   - ✅ `invoice.payment_succeeded` - When recurring payment succeeds
   - ✅ `invoice.payment_failed` - When recurring payment fails

   **Optional (Recommended for Production):**
   - 📋 `customer.subscription.created` - When new subscription is created
   - 📋 `customer.subscription.trial_will_end` - 3 days before trial ends (if using trials)
   - 📋 `invoice.upcoming` - 7 days before invoice is finalized
   - 📋 `invoice.finalized` - When invoice is ready for payment

6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

#### **For Local Development (Using Stripe CLI):**

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from the output (starts with `whsec_`)
5. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

6. **Keep the terminal open** while testing!

---

### **Step 3: Update Checkout to Include User ID**

Update your checkout session creation to include the Clerk user ID:

```typescript
// In your checkout code (e.g., app/api/checkout/route.ts or upgrade page)
import { auth } from '@clerk/nextjs/server'

const session = await stripe.checkout.sessions.create({
  // ... other config
  metadata: {
    userId: (await auth()).userId, // 🔥 This is crucial!
  },
  // ...
})
```

---

## 🎯 How It Works

### **User Subscribes Flow:**

```
User clicks "Upgrade" 
    ↓
Redirects to Stripe Checkout
    ↓
Completes payment
    ↓
Stripe sends webhook → /api/webhooks/stripe
    ↓
Webhook receives checkout.session.completed
    ↓
Extracts userId from session.metadata
    ↓
Updates Clerk user metadata:
  { role: "subscriber" }
    ↓
User now has full access! 🎉
```

### **Subscription Updated:**

```
Subscription status changes
    ↓
Stripe sends customer.subscription.updated
    ↓
Webhook checks subscription status
    ↓
Updates user role accordingly
```

### **Subscription Cancelled:**

```
User cancels subscription
    ↓
Stripe sends customer.subscription.deleted
    ↓
Webhook downgrades user to "customer"
    ↓
User loses premium access
```

---

## 🧪 Testing Your Webhook

### **Method 1: Using Stripe CLI (Recommended for Local)**

1. Start your dev server:
   ```bash
   pnpm dev
   ```

2. In another terminal, forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

4. Check your terminal for webhook logs

### **Method 2: Using Stripe Dashboard (Production)**

1. Go to **Developers** → **Webhooks**
2. Click on your endpoint
3. Click **Send test webhook**
4. Select event type (e.g., `checkout.session.completed`)
5. Click **Send test webhook**
6. Check the response in the dashboard

---

## 📊 Webhook Events Explained

### **✅ checkout.session.completed**
- Fires when user completes payment
- Use to: Upgrade user to subscriber
- Contains: `customer`, `subscription`, `metadata.userId`

### **🔄 customer.subscription.updated**
- Fires when subscription status changes
- Use to: Update subscription status
- Contains: `status` (active, past_due, cancelled, etc.)

### **❌ customer.subscription.deleted**
- Fires when subscription is cancelled/expired
- Use to: Downgrade user to customer
- Contains: `customer`, `subscription`

### **💰 invoice.payment_succeeded**
- Fires when payment is successful
- Use to: Send receipt, track revenue
- Contains: `amount_paid`, `customer`

### **⚠️ invoice.payment_failed**
- Fires when payment fails
- Use to: Notify user, retry payment
- Contains: `customer`, `attempt_count`

---

## 🔒 Security Best Practices

✅ **Always verify webhook signatures** (already implemented)  
✅ **Use environment variables** for secrets  
✅ **Log webhook events** for debugging  
✅ **Handle idempotency** (Stripe may send duplicate events)  
✅ **Return 200 quickly** (process async if needed)  

---

## 🐛 Troubleshooting

### **Webhook not receiving events:**
- ✅ Check URL is correct (no trailing slash)
- ✅ Verify webhook secret in `.env.local`
- ✅ Ensure server is running
- ✅ Check firewall/network settings

### **Signature verification failing:**
- ✅ Webhook secret matches Stripe dashboard
- ✅ Raw request body is used (not parsed JSON)
- ✅ No middleware modifying the body

### **User role not updating:**
- ✅ `userId` is in checkout session metadata
- ✅ Clerk API keys are correct
- ✅ Check server logs for errors
- ✅ Verify user exists in Clerk

### **Testing locally not working:**
- ✅ Stripe CLI is installed and logged in
- ✅ `stripe listen` command is running
- ✅ Webhook secret from CLI output is in `.env.local`
- ✅ Dev server is running on port 3000

---

## 📝 Environment Variables Checklist

Make sure your `.env.local` has:

```bash
# Clerk (already set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (already set)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook (ADD THIS)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎉 You're All Set!

Once configured, your webhook will:
- ✅ Automatically upgrade users to subscriber after payment
- ✅ Handle subscription updates and cancellations
- ✅ Keep user roles in sync with Stripe
- ✅ Track payment success/failure

**Next Steps:**
1. Set up webhook in Stripe Dashboard
2. Add webhook secret to `.env.local`
3. Update checkout to include `userId` in metadata
4. Test with Stripe CLI or test mode
5. Deploy and enjoy automatic role management! 🚀
