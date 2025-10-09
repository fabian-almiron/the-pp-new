# 🚀 Connecting Strapi Cloud to Vercel

This guide shows you how to connect your deployed Strapi Cloud backend to your Vercel-deployed frontend.

## 📋 Environment Variables You Need in Vercel

### Required Variables:

1. **NEXT_PUBLIC_STRAPI_URL** - Your Strapi Cloud URL
2. **STRAPI_API_TOKEN** - API token from Strapi
3. **CLERK_SECRET_KEY** - Clerk authentication
4. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - Clerk public key
5. **CLERK_WEBHOOK_SECRET** - For Clerk webhooks
6. **STRIPE_SECRET_KEY** - Stripe payments
7. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Stripe public key
8. **STRIPE_WEBHOOK_SECRET** - For Stripe webhooks

---

## 🔧 Step-by-Step Setup

### Step 1: Get Your Strapi Cloud URL

1. Go to your Strapi Cloud dashboard
2. Find your project
3. Copy the deployment URL (looks like: `https://your-project-name.strapiapp.com`)

### Step 2: Create Strapi API Token

1. Log into your Strapi Cloud admin panel at `https://your-project-name.strapiapp.com/admin`
2. Go to **Settings → API Tokens** (in the left sidebar)
3. Click **"Create new API Token"**
4. Fill in:
   - **Name**: `Vercel Frontend`
   - **Token duration**: `Unlimited`
   - **Token type**: `Full access` (or custom with read permissions)
5. Click **Save**
6. **Copy the token immediately** (you won't be able to see it again!)

### Step 3: Add Environment Variables to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (piped-peony-frontend)
3. Click **Settings** → **Environment Variables**
4. Add each variable:

```env
# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=https://your-project-name.strapiapp.com
STRAPI_API_TOKEN=your_strapi_api_token_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/video-library
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/video-library

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important:** 
- For `NEXT_PUBLIC_*` variables, check all three environments: Production, Preview, Development
- For secret variables (without `NEXT_PUBLIC_`), you can check Production only
- **NO trailing slash** on `NEXT_PUBLIC_STRAPI_URL`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_STRAPI_URL production
# Paste: https://your-project-name.strapiapp.com

vercel env add STRAPI_API_TOKEN production
# Paste: your_token_here

# Repeat for other variables...
```

### Step 4: Redeploy Your Vercel App

After adding environment variables, you need to redeploy:

#### Option A: Trigger Redeploy from Dashboard
1. Go to your Vercel project
2. Click **Deployments** tab
3. Click the three dots (**...**) next to latest deployment
4. Select **Redeploy**
5. Check **Use existing Build Cache** (optional)
6. Click **Redeploy**

#### Option B: Git Push
```bash
# Make any small change and push
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push
```

#### Option C: Using Vercel CLI
```bash
vercel --prod
```

---

## 🔒 Configure Strapi Cloud CORS

Your Strapi Cloud needs to allow requests from your Vercel domain:

### In Strapi Cloud Dashboard:

1. Go to **Settings → Security** (or check your `config/middlewares.ts` if you have access)
2. Add your Vercel domain to CORS settings
3. Add these URLs:
   - `https://your-vercel-app.vercel.app`
   - `https://your-custom-domain.com` (if you have one)
   - `http://localhost:3000` (for local development)

### If you have access to Strapi code, update `config/middlewares.ts`:

```typescript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://your-vercel-app.vercel.app'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'https://your-vercel-app.vercel.app',
        'https://your-custom-domain.com',
      ],
      credentials: true,
    },
  },
  // ... rest of middlewares
];
```

---

## 🧪 Testing the Connection

### 1. Check if variables are loaded:

Create a test page to verify (temporarily):

```typescript
// app/test-strapi/page.tsx
export default function TestStrapi() {
  return (
    <div className="p-8">
      <h1>Strapi Connection Test</h1>
      <p>Strapi URL: {process.env.NEXT_PUBLIC_STRAPI_URL || 'NOT SET'}</p>
      <p>Has API Token: {process.env.STRAPI_API_TOKEN ? 'Yes ✅' : 'No ❌'}</p>
    </div>
  );
}
```

### 2. Test API calls:

Visit your shop page or any page that fetches from Strapi:
- `https://your-vercel-app.vercel.app/shop`
- `https://your-vercel-app.vercel.app/courses`
- `https://your-vercel-app.vercel.app/recipes`

### 3. Check Vercel Logs:

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Deployments** → Click latest deployment
4. Click **Functions** tab
5. Check for any errors related to Strapi

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch from Strapi"

**Possible causes:**
1. ❌ Wrong Strapi URL (check for trailing slash)
2. ❌ CORS not configured in Strapi
3. ❌ API token not set or invalid
4. ❌ Variables not added to Production environment

**Solutions:**
- Double-check `NEXT_PUBLIC_STRAPI_URL` in Vercel (no trailing slash!)
- Verify API token is correct and has proper permissions
- Check Strapi CORS settings allow your Vercel domain
- Redeploy after adding environment variables

### Issue: "Unauthorized" or 401 errors

**Cause:** Missing or invalid `STRAPI_API_TOKEN`

**Solution:**
1. Generate a new API token in Strapi
2. Update the token in Vercel
3. Redeploy

### Issue: Images not loading from Strapi

**Cause:** CORS or image path issues

**Solution:**
- Check that Strapi's media URL is correct
- Verify CORS allows image requests
- Check that `NEXT_PUBLIC_STRAPI_URL` doesn't have trailing slash

### Issue: Changes not reflecting

**Cause:** Build cache or environment variables not updated

**Solution:**
```bash
# Force fresh deployment
vercel --prod --force
```

---

## 📝 Checklist

Before going live, verify:

- [ ] ✅ Strapi Cloud URL is correct in Vercel
- [ ] ✅ Strapi API token created and added to Vercel
- [ ] ✅ All Clerk keys are production keys (not test keys)
- [ ] ✅ All Stripe keys are live keys (not test keys)
- [ ] ✅ CORS configured in Strapi for your Vercel domain
- [ ] ✅ Webhook secrets configured for both Clerk and Stripe
- [ ] ✅ App redeployed after adding environment variables
- [ ] ✅ Test pages load data from Strapi correctly
- [ ] ✅ Images from Strapi display correctly
- [ ] ✅ Checkout flow works end-to-end

---

## 🔗 Webhook URLs for Production

When setting up webhooks in Clerk and Stripe, use these URLs:

### Clerk Webhook URL:
```
https://your-vercel-app.vercel.app/api/clerk-webhook
```

### Stripe Webhook URL:
```
https://your-vercel-app.vercel.app/api/stripe-webhook
```

**Remember:** Update these in your Clerk and Stripe dashboards!

---

## 🎉 Next Steps

Once everything is connected:

1. Test user registration flow
2. Test product checkout
3. Test subscription checkout
4. Verify webhooks are working (check Vercel logs)
5. Test content updates in Strapi reflect on frontend

---

## 🆘 Still Having Issues?

Check these logs:

1. **Vercel Function Logs**: Dashboard → Deployments → Latest → Functions
2. **Strapi Logs**: Strapi Cloud Dashboard → Logs
3. **Browser Console**: F12 → Console tab (for client-side errors)
4. **Network Tab**: F12 → Network tab (to see API calls)

Common command to check if URL is accessible:
```bash
curl https://your-project-name.strapiapp.com/api/products
```

If you see data, Strapi is working! If not, check Strapi settings.

