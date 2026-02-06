# Fixing OAuth SSO in Production

## Problem

OAuth (Google/Apple/Facebook sign-in) works in development but fails in production with error:
```
Access blocked: Authorization Error
Error 400: invalid_request
Missing required parameter: client_id
```

## Root Cause

You're using **Clerk TEST keys** in production. Test keys are configured for `localhost:3000` only, not your production domain.

## Solution: Switch to Live Clerk Keys

### Step 1: Update Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `piped-peony-frontend`
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

```env
# REMOVE the test keys and use LIVE keys:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

CLERK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
```

**Important:** Make sure to:
- ✅ Select "Production" environment
- ✅ Click "Save"
- ✅ Redeploy your app after saving

### Step 2: Configure OAuth in Clerk Production Environment

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. **Switch to PRODUCTION instance** (toggle in top-left)
3. Navigate to: **User & Authentication** → **Social Connections**

#### Configure Google OAuth:

1. Click **Google**
2. Enable it
3. You have two options:

   **Option A: Use Clerk's Development Credentials (Quick & Easy)**
   - Just toggle it on
   - Clerk provides test credentials that work immediately
   - ⚠️ Limited to 100 users, shows warning to users

   **Option B: Use Your Own Google OAuth App (Professional)**
   - Create Google OAuth credentials (see instructions below)
   - Add your credentials to Clerk
   - Professional, no limitations

#### Configure Apple OAuth:

1. Click **Apple**
2. Enable it
3. Use Clerk's development credentials or configure your own

#### Configure Facebook OAuth:

1. Click **Facebook**
2. Enable it
3. Use Clerk's development credentials or configure your own

### Step 3: Configure Authorized Domains in Clerk

1. Still in Clerk Dashboard (Production)
2. Go to: **Paths** → **Settings**
3. Add your production domain:
   - `www.thepipedpeony.com`
   - `thepipedpeony.com`

### Step 4: Redeploy

After updating Vercel environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Update Clerk to production keys"
git push origin main
```

Or click "Redeploy" in Vercel dashboard.

---

## Option A: Quick Setup with Clerk's Credentials

This is the fastest way to get OAuth working:

1. Switch to Live Clerk keys (Step 1 above)
2. In Clerk Dashboard → Social Connections
3. For each provider (Google, Apple, Facebook):
   - Toggle it ON
   - Select "Use Clerk's development credentials"
   - Save

**Limitations:**
- Shows warning banner to users
- Limited to 100 users total
- Good for testing, not ideal for production

**Pros:**
- Works immediately (no setup)
- No need to create OAuth apps

---

## Option B: Professional Setup with Your Own OAuth Apps

For a professional setup without limitations:

### Google OAuth Setup:

1. **Create Google OAuth App:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable "Google+ API"
   - Go to "Credentials" → Create OAuth 2.0 Client ID
   - Application type: "Web application"

2. **Configure Authorized Redirect URIs:**
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   https://clerk.thepipedpeony.com/v1/oauth_callback
   ```

3. **Get Credentials:**
   - Copy Client ID
   - Copy Client Secret

4. **Add to Clerk:**
   - Clerk Dashboard → Social Connections → Google
   - Select "Use custom credentials"
   - Paste Client ID and Client Secret
   - Save

### Apple OAuth Setup:

1. **Apple Developer Account Required** ($99/year)
2. Create App ID and Service ID in Apple Developer Portal
3. Configure Sign in with Apple
4. Add credentials to Clerk

### Facebook OAuth Setup:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add "Facebook Login" product
4. Configure OAuth Redirect URIs:
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   ```
5. Add App ID and App Secret to Clerk

---

## Verification Checklist

After making changes, verify:

- [ ] Live Clerk keys active in Vercel (not test keys)
- [ ] OAuth providers enabled in Clerk PRODUCTION dashboard
- [ ] Production domain added to Clerk authorized domains
- [ ] App redeployed after environment variable changes
- [ ] Test Google sign-in on production site
- [ ] Test Apple sign-in on production site
- [ ] Test Facebook sign-in on production site

---

## Testing

### Before Fix:
```
❌ Click "Continue with Google" on production
❌ Error: "Access blocked: Authorization Error"
❌ Error: "Missing required parameter: client_id"
```

### After Fix:
```
✅ Click "Continue with Google" on production
✅ Google sign-in popup appears
✅ User can authorize
✅ Redirects back to site
✅ User is logged in
```

---

## Common Issues & Solutions

### Issue: Still getting "invalid_request" error

**Solution:**
- Double-check you're using **pk_live_** not **pk_test_** keys
- Make sure you redeployed after changing environment variables
- Clear browser cache and try again

### Issue: "Redirect URI mismatch" error

**Solution:**
- In your OAuth provider (Google/Apple/Facebook), add:
  - `https://accounts.clerk.dev/v1/oauth_callback`
- Make sure it's saved and active

### Issue: OAuth works but user isn't subscribed

**This is expected!** OAuth signup creates a free account. Your existing flow handles this:
1. User signs in with OAuth
2. Redirects to `/sso-callback`
3. Checks if user is subscriber
4. If not, redirects to `/signup-subscription` to complete payment

---

## Environment Variable Reference

### Your Current Setup (WRONG for production):
```env
# ❌ TEST KEYS - Only work on localhost
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dG91Y2hlZC12ZXJ2ZXQtMTUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_nftg6x4CTRirgDZAOu6HmYEB7HQOubY15q9K6cKtzM
```

### Should be (CORRECT for production):
```env
# ✅ LIVE KEYS - Work on production domain
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
```

---

## Development vs Production

### For Local Development (localhost:3000):
- Use TEST keys: `pk_test_...` and `sk_test_...`
- Keep in `.env.local` (not committed to git)
- OAuth configured for localhost

### For Production (www.thepipedpeony.com):
- Use LIVE keys: `pk_live_...` and `sk_live_...`
- Set in Vercel environment variables
- OAuth configured for production domain

### Best Practice:

Create two separate environment files:

**`.env.local`** (for development, not committed):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
CLERK_SECRET_KEY=sk_test_YOUR_TEST_KEY
```

**Vercel Environment Variables** (for production):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```

---

## Quick Fix (5 Minutes)

If you need OAuth working ASAP:

1. **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Change to your production Clerk publishable key (`pk_live_...`)
4. Find `CLERK_SECRET_KEY`
5. Change to your production Clerk secret key (`sk_live_...`)
6. Save and **Redeploy**
7. Go to Clerk Dashboard → **Switch to Production** → Social Connections
8. Enable Google/Apple/Facebook (use Clerk's dev credentials for now)
9. Test on production site

---

## Need Help?

If OAuth still doesn't work after following these steps:

1. Check Vercel deployment logs for errors
2. Check browser console for errors
3. Verify in Clerk Dashboard that you're in PRODUCTION mode (not development)
4. Make sure the correct keys are active in Vercel

**Last Updated:** February 6, 2026
