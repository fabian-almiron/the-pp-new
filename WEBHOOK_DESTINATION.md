# 🎯 Stripe Webhook Destination - Quick Reference

## 📍 Your Webhook Endpoint URL

### **Production (Deploy to Vercel/etc):**
```
https://your-domain.com/api/webhooks/stripe
```

### **Local Development:**
```
http://localhost:3000/api/webhooks/stripe
```

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Add Webhook Secret to `.env.local`**

```bash
# Add this line to your .env.local file:
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### **Step 2: Configure in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Paste your URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Paste it in your `.env.local`

### **Step 3: Test Locally with Stripe CLI**

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret from output
# Paste it in .env.local

# Test with a sample event
stripe trigger checkout.session.completed
```

---

## ✨ What Happens Automatically

### **When User Subscribes:**
1. User completes payment on Stripe
2. Stripe sends `checkout.session.completed` webhook
3. Your webhook updates user role to "subscriber" in Clerk
4. User instantly has premium access! 🎉

### **When Subscription Updates:**
1. Subscription status changes (active, past_due, etc.)
2. Stripe sends `customer.subscription.updated` webhook
3. Your webhook updates user role accordingly

### **When Subscription Cancels:**
1. User cancels subscription
2. Stripe sends `customer.subscription.deleted` webhook
3. Your webhook downgrades user to "customer"
4. User loses premium access

---

## 🎯 2025 Best Practices Implemented

Based on: https://docs.stripe.com/webhooks

✅ **Signature Verification** - Confirms events are from Stripe  
✅ **Quick 200 Response** - Returns immediately to prevent timeouts  
✅ **Async Processing** - Handles events asynchronously  
✅ **Idempotency** - Handles duplicate events gracefully  
✅ **Error Logging** - Comprehensive logging for debugging  
✅ **Security** - Uses HTTPS and webhook secrets  

---

## 🐛 Troubleshooting

### **Webhook not receiving events?**
```bash
# Check if webhook secret is in .env.local
cat .env.local | grep STRIPE_WEBHOOK_SECRET

# Verify URL in Stripe dashboard
# Should be: https://your-domain.com/api/webhooks/stripe
```

### **Signature verification failing?**
```bash
# Make sure webhook secret matches Stripe dashboard
# Check for extra spaces or newlines in .env.local
```

### **Role not updating?**
- ✅ Check Clerk session token includes metadata
- ✅ Verify user ID is passed in checkout metadata
- ✅ Check server logs for errors
- ✅ Ensure Clerk API keys are correct

---

## 📋 Environment Variables Checklist

Your `.env.local` should have:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook (IMPORTANT!)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎉 You're All Set!

Your webhook is configured with 2025 best practices and will automatically:
- ✅ Upgrade users to subscriber after payment
- ✅ Handle subscription updates
- ✅ Downgrade users when subscriptions cancel
- ✅ Log all events for debugging

**Need more help?** Check `STRIPE_WEBHOOK_SETUP.md` for detailed guide!
