# 🧪 Local Webhook Testing Guide

## 🎯 Option 1: Stripe CLI (Recommended - Official Method)

The **Stripe CLI** is the official way to test webhooks locally. No ngrok or public URLs needed!

### **Step 1: Install Stripe CLI**

```bash
# macOS (via Homebrew)
brew install stripe/stripe-cli/stripe

# macOS (via direct download)
curl -L "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_latest_darwin_arm64.tar.gz" | tar -xz
sudo mv stripe /usr/local/bin/

# Verify installation
stripe --version
```

### **Step 2: Login to Stripe**

```bash
stripe login
```

This opens your browser to authenticate with Stripe. Click **Allow access**.

### **Step 3: Start Your Dev Server**

```bash
# Terminal 1: Start Next.js
pnpm dev
```

Your app should be running at `http://localhost:3000`

### **Step 4: Forward Webhooks to Local Server**

```bash
# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_abc123...
> Forwarding webhooks to http://localhost:3000/api/webhooks/stripe
```

### **Step 5: Copy Webhook Secret**

Copy the webhook secret from the output (starts with `whsec_`) and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**Restart your dev server** after adding the secret!

### **Step 6: Test with Real Events**

```bash
# Terminal 3: Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

Watch Terminal 2 to see events being forwarded to your local server! ✨

---

## 🌐 Option 2: ngrok (Alternative Method)

If you prefer ngrok or need to share your local server publicly:

### **Step 1: Install ngrok**

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### **Step 2: Sign up for ngrok (Free)**

1. Go to https://ngrok.com/signup
2. Get your authtoken from the dashboard
3. Connect your account:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### **Step 3: Start Your Dev Server**

```bash
# Terminal 1: Start Next.js
pnpm dev
```

### **Step 4: Start ngrok Tunnel**

```bash
# Terminal 2: Create public tunnel
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### **Step 5: Add Webhook in Stripe Dashboard**

1. Go to https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Paste: `https://abc123.ngrok.io/api/webhooks/stripe`
4. Select your events
5. Copy the webhook signing secret
6. Add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **⚠️ ngrok Limitations:**

- Free tier has **temporary URLs** that change every restart
- Need to update Stripe webhook URL each time
- Requires ngrok account

---

## 📊 Comparison: Stripe CLI vs ngrok

| Feature | Stripe CLI | ngrok |
|---------|-----------|-------|
| **Setup** | Quick, one command | Requires account setup |
| **URL Changes** | Never (forwards locally) | Every restart (free tier) |
| **Stripe Dashboard** | Not needed | Must configure |
| **Event Testing** | Built-in triggers | Manual testing |
| **Speed** | Instant | Slight delay |
| **Best For** | Stripe webhooks | General tunneling |

**Winner: Stripe CLI** 🏆 - Designed specifically for Stripe webhooks!

---

## 🧪 Testing Your Webhook

### **Watch Webhook Events:**

Keep Terminal 2 (Stripe CLI) open to see events in real-time:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see:
```
2025-01-15 10:30:45  --> checkout.session.completed [evt_abc...]
2025-01-15 10:30:45  <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_abc...]
```

### **Trigger Specific Events:**

```bash
# Test subscription creation
stripe trigger checkout.session.completed --add checkout_session:mode=subscription

# Test subscription update
stripe trigger customer.subscription.updated

# Test cancellation
stripe trigger customer.subscription.deleted

# Test payment success
stripe trigger invoice.payment_succeeded

# Test payment failure
stripe trigger invoice.payment_failed
```

### **Check Your Console:**

Your Next.js server console should show:
```
📨 Processing event: checkout.session.completed (evt_...)
✅ User user_123 upgraded to subscriber
```

---

## 🎯 Recommended Workflow

### **Development (Local Testing):**
```bash
# Terminal 1
pnpm dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 (when needed)
stripe trigger checkout.session.completed
```

### **Staging/Production:**
- Use real Stripe webhook endpoints
- No Stripe CLI needed
- Events come from actual customer actions

---

## 🐛 Troubleshooting

### **"stripe: command not found"**
```bash
# Reinstall Stripe CLI
brew install stripe/stripe-cli/stripe

# Or add to PATH
export PATH=$PATH:/usr/local/bin
```

### **Webhook secret not working:**
```bash
# Make sure you copied the ENTIRE secret
stripe listen --print-secret

# Add to .env.local
STRIPE_WEBHOOK_SECRET=whsec_your_full_secret_here

# Restart dev server
pnpm dev
```

### **Events not being received:**
```bash
# Check if stripe listen is running
# Should see: "Ready! Forwarding webhooks..."

# Verify dev server is on port 3000
# Check http://localhost:3000

# Make sure webhook route exists
curl http://localhost:3000/api/webhooks/stripe
# Should return 405 Method Not Allowed (it only accepts POST)
```

### **Signature verification failing:**
```bash
# Make sure webhook secret is from the Stripe CLI output
# NOT from Stripe Dashboard (different secrets)

# Get the correct secret:
stripe listen --print-secret

# Copy it to .env.local
# Restart dev server
```

---

## 📝 Quick Start Checklist

For fastest setup:

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Start dev server (Terminal 1)
pnpm dev

# 4. Forward webhooks (Terminal 2)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 5. Copy webhook secret to .env.local and restart dev server

# 6. Test (Terminal 3)
stripe trigger checkout.session.completed

# 7. Check logs in Terminal 1 & 2 ✅
```

---

## 🎉 You're Ready!

**Recommended:** Use Stripe CLI for development, it's faster and easier!

- ✅ No public URLs needed
- ✅ No account required (uses your Stripe account)
- ✅ Built-in event triggers
- ✅ Real-time event viewing
- ✅ Perfect for testing webhooks locally

**For production:** Use real webhook endpoints in Stripe Dashboard pointing to your deployed domain.
