# 🚀 Quick Start: Clerk OAuth Authentication

## ✅ What's Been Implemented

Your shopping cart now has **modern OAuth authentication** powered by Clerk! Here's what's ready:

- ✅ **Email/Password Login** - Traditional authentication on your custom-designed login page
- ✅ **Google OAuth** - "Continue with Google" button
- ✅ **GitHub OAuth** - "Continue with GitHub" button  
- ✅ **Protected Checkout** - Users must sign in before checkout
- ✅ **Protected Routes** - Video library, academy, and courses require authentication
- ✅ **Beautiful UI** - OAuth buttons match your brand design
- ✅ **Session Management** - Secure, automatic session handling

## 🎯 5-Minute Setup

### Step 1: Create Clerk Account (2 minutes)

1. Go to [https://clerk.com](https://clerk.com)
2. Click **"Start building for free"**
3. Sign up with your email or GitHub
4. Create a new application
5. Choose application name: **"The Piped Peony"**

### Step 2: Enable Authentication Methods (1 minute)

In your Clerk Dashboard:

1. Go to **"Configure"** → **"Email, Phone, Username"**
   - ✅ Enable **Email address**
   - ✅ Enable **Password**
   - Toggle ON **"Require verification"** (optional, recommended for production)

2. Go to **"Configure"** → **"Social connections"**
   - ✅ Enable **Google**
   - ✅ Enable **GitHub** (optional)
   - You can add more providers later (Apple, Facebook, Microsoft, etc.)

### Step 3: Get Your API Keys (1 minute)

1. In Clerk Dashboard, click **"API Keys"** in the sidebar
2. You'll see:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Show" to reveal)

### Step 4: Add Environment Variables (1 minute)

Create or update `.env.local` in your project root:

```bash
# Strapi Backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Stripe (existing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET

# Clerk Authentication (NEW - paste your keys here)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_HERE

# Optional: Customize Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop
```

**⚠️ IMPORTANT**: Replace `YOUR_CLERK_KEY_HERE` with your actual keys from Step 3!

### Step 5: Restart Server

```bash
# Stop your dev server (Ctrl+C)
# Then restart:
pnpm dev
```

## 🧪 Test It Out!

### Test 1: Browse Without Login (Should Work ✅)
1. Go to `http://localhost:3000/shop`
2. Click on any product
3. Add to cart
4. Go to cart page `http://localhost:3000/cart`
5. ✅ Should see cart with items

### Test 2: Try Checkout Without Login (Should Redirect 🔒)
1. In cart, click **"Sign In to Checkout"**
2. ✅ Should redirect to `/login`

### Test 3: Sign Up with Email/Password
1. On login page, click **"Don't have an account? Sign up"**
2. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
3. Check "I agree to terms"
4. Click **"CREATE ACCOUNT"**
5. ✅ Should redirect to `/shop` and be logged in

### Test 4: Sign In with Google OAuth
1. Go to `/login`
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. ✅ Should redirect back to shop, logged in

### Test 5: Complete Checkout (After Login)
1. Add items to cart
2. Go to `/cart`
3. Click **"Proceed to Checkout"** (now visible when logged in)
4. ✅ Should redirect to Stripe checkout

## 🎨 What's Different in Your UI?

Your login page at `http://localhost:3000/login` now has:

```
┌─────────────────────────────────────┐
│      [Your Piped Peony Logo]        │
│                                     │
│  Email Address                      │
│  [________________]                 │
│                                     │
│  Password                           │
│  [________________] 👁              │
│                                     │
│  ☐ I'm not a robot                 │
│  ☐ Remember Me                      │
│                                     │
│  [        LOG IN        ]           │
│                                     │
│  ─────────── OR ───────────        │
│                                     │
│  [ 🔵 Continue with Google  ]      │  ← NEW!
│  [ 🐙 Continue with GitHub  ]      │  ← NEW!
│                                     │
│  Don't have an account? Sign up     │
│  ← Go to The Piped Peony           │
└─────────────────────────────────────┘
```

## 🔒 Protected Routes

These pages now require authentication:
- `/video-library` - Must sign in to view videos
- `/academy` - Must sign in to access academy
- `/courses` - Must sign in to view courses
- `/academy-details` - Must sign in
- **Checkout flow** - Must sign in before completing purchase

## 🎯 User Flow

### Guest User (Not Logged In)
1. Browse shop ✅
2. Add to cart ✅
3. View cart ✅
4. Click checkout → **Redirected to login** 🔒

### Authenticated User
1. Browse shop ✅
2. Add to cart ✅
3. View cart ✅
4. Click checkout → **Proceeds to Stripe** ✅
5. Access video library ✅
6. Access academy ✅

## 🔧 Customization

### Add More OAuth Providers

In Clerk Dashboard → **Social connections**, enable any of these:

- Apple (great for iOS users)
- Facebook
- Microsoft
- Discord
- Twitter/X
- LinkedIn
- TikTok
- Twitch
- And 40+ more!

After enabling in dashboard, the buttons will automatically appear on your login/signup pages.

### Customize Redirect URLs

Edit `.env.local`:

```bash
# Where to go after signing in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/video-library

# Where to go after signing up
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/academy
```

### Protect More Routes

Edit `middleware.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  '/video-library(.*)',
  '/academy(.*)',
  '/courses(.*)',
  '/my-account(.*)',  // Add this
  '/orders(.*)',       // Add this
])
```

## 📊 View Users & Analytics

In Clerk Dashboard:

- **Users** - See all registered users
- **Sessions** - View active sessions
- **Events** - Track login/signup events
- **Logs** - Debug authentication issues

## ⚠️ Troubleshooting

### "Clerk is not loading"
- Check that you added keys to `.env.local`
- Restart dev server after adding keys
- Make sure keys start with `pk_test_` and `sk_test_`

### "OAuth redirect error"
- In Clerk Dashboard → **Domains**, verify your domain
- Check that `http://localhost:3000` is listed
- For Google OAuth: Verify OAuth consent screen in Google Cloud Console

### "Sign in not working"
- Open browser console (F12) and check for errors
- Verify `.env.local` variables are set correctly
- Check Clerk Dashboard → **Logs** for error details

### "Can't access protected routes"
- Make sure you're signed in (check Clerk user button in header)
- Clear browser cookies and try again
- Check `middleware.ts` route patterns

## 🌐 Production Deployment

Before going live:

1. **Switch to Production Keys**
   - Clerk Dashboard → Switch to "Production" (top right)
   - Get new `pk_live_...` and `sk_live_...` keys
   - Update environment variables in hosting platform (Vercel, etc.)

2. **Configure Production Domain**
   - Clerk Dashboard → **Domains**
   - Add your production domain (e.g., `pipedpeony.com`)

3. **Set Up OAuth Apps for Production**
   - Google: Create production OAuth app in Google Cloud Console
   - GitHub: Create production OAuth app in GitHub settings
   - Add production redirect URLs

4. **Test Everything**
   - Sign up flow
   - Sign in flow  
   - OAuth providers
   - Checkout flow
   - Protected routes

## 📚 Learn More

- **Clerk Docs**: [https://clerk.com/docs](https://clerk.com/docs)
- **Next.js Guide**: [https://clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)
- **Customization**: [https://clerk.com/docs/components/customization/overview](https://clerk.com/docs/components/customization/overview)

## 🎉 You're All Set!

Your shopping cart now has **enterprise-grade authentication** with:
- ✅ Secure password authentication
- ✅ OAuth social login (Google, GitHub, etc.)
- ✅ Session management
- ✅ Protected checkout
- ✅ Beautiful UI that matches your brand

**Next Steps:**
1. Add your Clerk API keys to `.env.local`
2. Restart dev server
3. Test login, signup, and OAuth
4. Try the complete checkout flow
5. Customize as needed

**Questions?** Check the full guide in `CLERK_AUTH_SETUP.md` for advanced features like webhooks, user management, and more!

