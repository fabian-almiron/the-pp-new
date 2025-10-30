# Stripe Customer Linking Guide

## Overview

This system automatically links Clerk users to Stripe customers using **on-demand linking**. When users log in or make purchases, the system creates or retrieves their Stripe customer ID and stores it in Clerk's `privateMetadata`.

---

## 🎯 How It Works

### **Three-Way Connection**

```
Clerk User ←→ Stripe Customer ←→ Order History
     ↓              ↓                    ↓
  User ID    Customer ID         Checkout Sessions
```

1. **Clerk** manages user authentication
2. **Stripe Customer ID** is stored in Clerk's `privateMetadata.stripeCustomerId`
3. **Stripe** tracks purchases via customer ID (more reliable than email)

---

## 🔄 Automatic Linking Flow

### **When does linking happen?**

The system automatically links users in these scenarios:

1. ✅ **User visits My Account page** (`/my-account`)
   - Hook: `useStripeCustomer()` automatically triggers
   - Looks up existing customer by email
   - Creates new customer if none exists
   - Saves customer ID to Clerk metadata

2. ✅ **User makes a subscription purchase** (`/api/subscription-checkout`)
   - Creates/retrieves customer during checkout
   - Saves customer ID immediately
   - Links bidirectionally (Stripe ← → Clerk)

3. ✅ **User makes a product purchase** (`/api/checkout`)
   - Creates/retrieves customer during checkout
   - Saves customer ID immediately
   - Ensures proper order tracking

4. ✅ **User views order history** (`/api/orders`)
   - Uses customer ID if available (fast!)
   - Falls back to email matching
   - Auto-saves customer ID for next time

---

## 📁 File Structure

### **API Routes**

- **`/app/api/link-stripe-customer/route.ts`**
  - Main linking endpoint
  - Handles customer lookup by email
  - Creates new customer if needed
  - Saves to Clerk metadata

- **`/app/api/orders/route.ts`**
  - Updated to use customer ID first
  - Falls back to email if no customer ID
  - Auto-links on first order fetch

- **`/app/api/checkout/route.ts`**
  - Product checkout with customer linking
  - Creates/retrieves customer before payment
  - Saves customer ID to Clerk

- **`/app/api/subscription-checkout/route.ts`**
  - Subscription checkout with customer linking
  - Same pattern as product checkout

### **Hooks**

- **`/hooks/use-stripe-customer.ts`**
  - React hook for automatic linking
  - Used in `my-account` page
  - Runs on component mount
  - Returns linking status

### **Pages**

- **`/app/my-account/page.tsx`**
  - Uses `useStripeCustomer()` hook
  - Automatically links on page load
  - No user interaction required

---

## 🔧 Implementation Details

### **Customer Lookup Priority**

```typescript
// 1. Check Clerk metadata first
const stripeCustomerId = user.privateMetadata?.stripeCustomerId

// 2. If not found, search Stripe by email
const customers = await stripe.customers.list({
  email: userEmail,
  limit: 1,
})

// 3. If still not found, create new customer
const customer = await stripe.customers.create({
  email: userEmail,
  metadata: { clerkUserId: user.id },
})

// 4. Save to Clerk for next time
await clerkClient.users.updateUserMetadata(user.id, {
  privateMetadata: { stripeCustomerId: customer.id },
})
```

### **Bidirectional Metadata**

Both systems store references to each other:

**Clerk → Stripe**
```typescript
user.privateMetadata = {
  stripeCustomerId: "cus_abc123"
}
```

**Stripe → Clerk**
```typescript
customer.metadata = {
  clerkUserId: "user_xyz789"
}
```

---

## 🚀 Usage

### **For Developers**

#### Using the Hook

```typescript
import { useStripeCustomer } from '@/hooks/use-stripe-customer'

function MyComponent() {
  const { customerId, isLinked, isLoading, error } = useStripeCustomer()
  
  if (isLoading) return <div>Linking Stripe account...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>Customer ID: {customerId}</div>
}
```

#### Manual API Call

```typescript
const response = await fetch('/api/link-stripe-customer', {
  method: 'POST',
})

const data = await response.json()
// { customerId: "cus_abc123", linked: true, wasCreated: false }
```

---

## 📊 Order History Behavior

### **Before Customer Linking**

```typescript
// Fetches ALL sessions (slow)
const sessions = await stripe.checkout.sessions.list({ limit: 100 })

// Filters by email (unreliable)
const userSessions = sessions.filter(s => s.customer_email === userEmail)
```

### **After Customer Linking**

```typescript
// Fetches only customer's sessions (fast!)
const sessions = await stripe.checkout.sessions.list({
  customer: stripeCustomerId,
  limit: 100,
})
```

**Benefits:**
- ✅ 10x faster queries
- ✅ Works even if user changes email
- ✅ More reliable data
- ✅ Better for scaling

---

## 🔐 Security

### **Why privateMetadata?**

Clerk has three metadata types:

1. **`publicMetadata`** - Visible to client-side code ❌
2. **`privateMetadata`** - Only visible server-side ✅ (We use this!)
3. **`unsafeMetadata`** - User-editable ❌

Stripe customer IDs are stored in `privateMetadata` because:
- Only your backend can access it
- Users can't tamper with it
- Prevents unauthorized access to other users' data

---

## 🧪 Testing

### **Test the Linking**

1. **Sign up a new user**
   ```
   https://your-domain.com/signup
   ```

2. **Visit My Account**
   ```
   https://your-domain.com/my-account
   ```

3. **Check Clerk Dashboard**
   - Go to: https://dashboard.clerk.com
   - Select your user
   - Check "Private Metadata"
   - Should see: `{ "stripeCustomerId": "cus_..." }`

4. **Check Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/customers
   - Find customer by email
   - Check "Metadata"
   - Should see: `{ "clerkUserId": "user_..." }`

### **Test Order History**

1. Make a test purchase
2. Visit `/my-account`
3. Check browser console logs:
   - Should see: `✅ Using Stripe Customer ID: cus_...`
   - (Not: `⚠️ No Stripe Customer ID found, using email fallback`)

---

## 🔄 Migration Strategy

If you have **existing users** before implementing this:

### **Option 1: Passive Migration (Recommended)**
- Users get linked automatically when they:
  - Visit `/my-account`
  - Make a purchase
  - View order history
- No manual work required
- Happens over time naturally

### **Option 2: Bulk Migration**

Run this script to migrate all users at once:

```typescript
// scripts/migrate-stripe-customers.ts
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function migrateAllUsers() {
  // Get all Clerk users
  const users = await clerkClient.users.getUserList({ limit: 100 });
  
  for (const user of users.data) {
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) continue;
    
    // Skip if already linked
    if (user.privateMetadata?.stripeCustomerId) continue;
    
    // Find Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      
      // Save to Clerk
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: { stripeCustomerId: customerId },
      });
      
      // Update Stripe metadata
      await stripe.customers.update(customerId, {
        metadata: { clerkUserId: user.id },
      });
      
      console.log(`✅ Linked ${email} → ${customerId}`);
    }
  }
}
```

---

## 📝 Troubleshooting

### **User has no customer ID in Clerk**

**Fix:** Visit `/my-account` page - it will auto-link

### **Orders not showing up**

**Possible causes:**
1. User changed their email → Check Stripe for old email
2. Orders made before Clerk migration → Use email fallback
3. Orders under different Stripe customer → Check Stripe dashboard

**Fix:** The system auto-saves customer ID when orders are fetched

### **Multiple Stripe customers for same email**

**What happens:**
- System picks the first customer found
- Saves that ID to Clerk
- Subsequent calls use the saved ID consistently

**To merge customers:**
1. Go to Stripe dashboard
2. Manually merge duplicate customers
3. Update Clerk metadata with correct customer ID

---

## 🎓 Best Practices

### ✅ DO

- Let the system auto-link (it's designed for it)
- Use `useStripeCustomer()` hook on account pages
- Check `privateMetadata.stripeCustomerId` before API calls
- Keep Stripe customer metadata in sync with Clerk

### ❌ DON'T

- Store customer ID in `publicMetadata` (security risk!)
- Bypass the linking system with custom logic
- Delete customer IDs from Clerk metadata
- Create multiple Stripe customers per user

---

## 🔗 Related Files

- `STRIPE_WEBHOOK_SETUP.md` - Webhook configuration
- `CLERK_METADATA_SETUP.md` - Metadata structure
- `PRODUCT_CHECKOUT_GUIDE.md` - Checkout flow
- `STRIPE_SETUP.md` - Initial Stripe setup

---

## 📞 Support

If you encounter issues:

1. Check browser console for linking logs
2. Check Clerk dashboard → User → Private Metadata
3. Check Stripe dashboard → Customer → Metadata
4. Review this guide's troubleshooting section
5. Contact your development team

---

**Last Updated:** October 30, 2025
**Version:** 1.0

