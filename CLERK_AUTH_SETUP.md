# Modern OAuth Authentication with Clerk

## 🎯 Overview

This guide explains how to set up **Clerk** - a modern, secure OAuth authentication system for your shopping cart and user management.

### Why Clerk?

- ✅ **Modern & Secure**: OAuth 2.0 with automatic security updates
- ✅ **Multiple Providers**: Google, GitHub, Apple, Microsoft, Email/Password, Magic Links, Phone
- ✅ **Built for Next.js 15**: Native App Router support
- ✅ **Beautiful UI**: Pre-built, customizable components
- ✅ **E-commerce Ready**: Session management, user metadata, webhooks
- ✅ **Free Tier**: 10,000 monthly active users
- ✅ **No Backend Needed**: Clerk handles all infrastructure

## 🚀 Quick Setup (10 Minutes)

### Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account (no credit card required)
3. Create a new application
4. Choose your authentication methods (recommended: Google OAuth + Email/Password)

### Step 2: Get API Keys

In your Clerk Dashboard:

1. Go to **API Keys** in the sidebar
2. Copy your keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

### Step 3: Add Environment Variables

Create or update `.env.local` in your project root:

```bash
# Strapi Backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Stripe (existing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Clerk Authentication (NEW)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY_HERE

# Optional: Customize Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop
```

**⚠️ IMPORTANT**: Never commit `.env.local` to git!

### Step 4: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

## 📁 Implementation Files

The following files have been created/updated:

1. **`middleware.ts`** - Protects routes requiring authentication
2. **`app/layout.tsx`** - Wraps app with ClerkProvider
3. **`app/login/page.tsx`** - Custom login page with Clerk
4. **`app/signup/page.tsx`** - Custom signup page with Clerk
5. **`app/cart/page.tsx`** - Updated to require auth before checkout
6. **`contexts/user-context.tsx`** - Integrated with Clerk's user system

## 🔐 How Authentication Works

### For Guest Users (No Login Required)
- Browse shop ✅
- View products ✅
- Add items to cart ✅
- View cart ✅

### Login Required For:
- Checkout and payment ❌
- View order history ❌
- Access video library ❌
- Manage account settings ❌

### Authentication Flow

```
User adds item to cart
    ↓
User goes to cart page (no login needed)
    ↓
User clicks "Proceed to Checkout"
    ↓
System checks if user is logged in
    ↓
If NOT logged in → Redirect to /login
    ↓
User logs in with:
  • Email/Password
  • Google OAuth
  • GitHub OAuth
  • (or any enabled provider)
    ↓
Redirect back to cart
    ↓
User can now checkout with Stripe
```

## 🎨 Customization

### Enable/Disable Authentication Providers

In your Clerk Dashboard:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable/disable providers:
   - Email/Password
   - Phone (SMS)
   - Username

3. Go to **User & Authentication** → **Social Connections**
4. Enable OAuth providers:
   - Google ⭐ Recommended
   - GitHub
   - Apple
   - Microsoft
   - Discord
   - Facebook
   - And 50+ more

### Customize Login/Signup Pages

The current implementation uses Clerk's pre-built components styled to match your brand.

To customize further, edit:
- `/app/login/page.tsx`
- `/app/signup/page.tsx`

### Require Auth for Other Pages

Edit `middleware.ts` and add routes to the protected array:

```typescript
export const config = {
  matcher: [
    '/cart',           // Already protected
    '/video-library',  // Already protected
    '/academy',        // Add this
    '/courses/:path*', // Add this
    // Add more as needed
  ],
};
```

## 🧪 Testing Authentication

### Test with Email/Password

1. Go to `http://localhost:3000/signup`
2. Create a test account with any email (Clerk test mode doesn't send real emails)
3. You'll be automatically logged in
4. Try adding items to cart and checking out

### Test with Google OAuth

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You'll be redirected back to the shop

### Test Guest vs Authenticated Flow

**As Guest:**
1. Browse shop → ✅ Works
2. Add to cart → ✅ Works
3. View cart → ✅ Works
4. Click checkout → ❌ Redirected to login

**After Login:**
1. Click checkout → ✅ Redirected to Stripe
2. Complete payment → ✅ Success page

## 👤 User Management

### Access User Data in Your Code

```typescript
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Not signed in</div>;
  
  return (
    <div>
      <p>Welcome {user.firstName}!</p>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

### Server-Side User Access

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome {user.firstName}!</div>;
}
```

### Link Clerk Users to Stripe Customers

In `/app/api/checkout/route.ts`, you can link Clerk users to Stripe:

```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  // Create Stripe session with customer info
  const session = await stripe.checkout.sessions.create({
    // ... other config
    customer_email: user.primaryEmailAddress,
    metadata: {
      clerk_user_id: userId,
    },
  });
}
```

## 🔒 Security Features

### Built-in Security

- ✅ **Session Management**: Secure JWT tokens, automatic rotation
- ✅ **CSRF Protection**: Built-in cross-site request forgery protection
- ✅ **Rate Limiting**: Automatic brute-force protection
- ✅ **Password Requirements**: Configurable strength requirements
- ✅ **Email Verification**: Optional email verification flow
- ✅ **Multi-Factor Auth**: Optional 2FA/MFA support

### Security Best Practices

1. **Never expose secret keys**: Keep `CLERK_SECRET_KEY` in `.env.local` only
2. **Use middleware**: Protect sensitive routes (already configured)
3. **Verify users server-side**: Always verify auth on API routes
4. **Enable 2FA**: Recommended for production (optional for users)
5. **Monitor Dashboard**: Check Clerk dashboard for suspicious activity

## 🌐 Production Deployment

### Before Going Live

1. **Switch to Production Keys**:
   - In Clerk Dashboard, go to production instance
   - Update `.env.local` with production keys (`pk_live_...` and `sk_live_...`)

2. **Configure Domains**:
   - In Clerk Dashboard → **Domains**
   - Add your production domain (e.g., `pipedpeony.com`)

3. **Enable Production OAuth**:
   - For Google OAuth: Set up production OAuth app in Google Cloud Console
   - Add production redirect URLs in Clerk Dashboard

4. **Set Up Webhooks** (Recommended):
   - Listen for user events: `user.created`, `user.updated`
   - Sync user data to your database
   - Send welcome emails

5. **Test Everything**:
   - [ ] Sign up flow
   - [ ] Login flow
   - [ ] OAuth providers
   - [ ] Cart → Checkout flow
   - [ ] Session persistence
   - [ ] Logout

### Environment Variables for Production

In your hosting platform (Vercel, etc.), set:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_SECRET_KEY=sk_live_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop
```

## 📊 Analytics & Monitoring

### View User Activity

In Clerk Dashboard:
- **Users**: View all registered users
- **Sessions**: Active/inactive sessions
- **Events**: Login attempts, OAuth connections
- **Organizations**: If you enable multi-tenancy

### Integration with Analytics

Clerk provides webhooks for:
- User signup (track conversions)
- User login (track engagement)
- Session activity (monitor usage)

## 💰 Pricing

### Free Tier
- 10,000 monthly active users (MAU)
- Unlimited OAuth providers
- Basic user management
- Email support

### Paid Plans (if you scale)
- **Pro**: $25/month + $0.02/MAU over 10K
- **Enterprise**: Custom pricing

For most small-to-medium businesses, the free tier is sufficient.

## 🆚 Comparison with Alternatives

| Feature | Clerk | Auth.js | Firebase | Supabase |
|---------|-------|---------|----------|----------|
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Next.js 15 | ✅ Native | ✅ Native | ⚠️ Works | ✅ Native |
| OAuth Providers | 50+ | 50+ | Limited | 20+ |
| UI Components | ✅ Beautiful | ❌ DIY | ⚠️ Basic | ⚠️ Basic |
| Free Tier | 10K MAU | ✅ Unlimited | 50K MAU | 50K MAU |
| Hosting Required | ❌ No | ❌ No | ❌ No | ⚠️ Optional |
| Learning Curve | Easy | Medium | Medium | Medium |

## 🆘 Troubleshooting

### "Clerk is not defined" Error
- Make sure you added environment variables to `.env.local`
- Restart the development server after adding env vars

### OAuth Redirect Error
- Check that redirect URLs are configured in provider (Google, GitHub, etc.)
- Verify Clerk dashboard has correct URLs

### Session Not Persisting
- Check browser cookies are enabled
- Verify middleware is configured correctly

### User Not Redirected After Login
- Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` in `.env.local`
- Verify login page has correct redirect logic

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [OAuth Setup Guides](https://clerk.com/docs/authentication/social-connections/oauth)
- [Clerk Dashboard](https://dashboard.clerk.com)

## 🎉 What's Next?

After setting up authentication:

1. **Test the complete flow**: Browse → Add to cart → Login → Checkout
2. **Customize branding**: Update Clerk appearance in dashboard
3. **Enable more providers**: Add Google, GitHub, etc.
4. **Set up webhooks**: Sync user data with your backend
5. **Add user profiles**: Create profile pages for users
6. **Order history**: Show past orders to logged-in users

---

**Need Help?** 
- Clerk Support: [support@clerk.com](mailto:support@clerk.com)
- Documentation: [https://clerk.com/docs](https://clerk.com/docs)

