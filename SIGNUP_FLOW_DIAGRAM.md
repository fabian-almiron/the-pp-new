# Signup Flow - Visual Diagram

## ✅ NEW APPROACH: Nothing Created Until Payment Succeeds

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User fills out signup form                                   │
│    - First Name, Last Name, Email, Password                     │
│    - Clicks "START FREE TRIAL"                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. POST /api/guest-checkout                                     │
│    - Creates Stripe Checkout Session                            │
│    - customer_creation: 'always' (Stripe creates customer later)│
│    - Stores user info in session.metadata                       │
│    - Returns checkout URL                                       │
│                                                                  │
│    ⚠️  NO CLERK ACCOUNT CREATED                                 │
│    ⚠️  NO STRIPE CUSTOMER CREATED                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User redirected to Stripe Checkout                           │
│    - Email pre-filled                                           │
│    - User sees subscription details and trial info              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
            User abandons     User enters card
            (closes tab)      and clicks Subscribe
                    │               │
                    ↓               ↓
        ┌───────────────┐   ┌──────────────────┐
        │ NOTHING       │   │ Stripe creates:  │
        │ CREATED!      │   │ ✓ Customer       │
        │               │   │ ✓ Subscription   │
        │ ✅ No Clerk   │   │ ✓ Invoice        │
        │ ✅ No Stripe  │   └──────────────────┘
        └───────────────┘            ↓
                            ┌──────────────────┐
                            │ Webhook fires:   │
                            │ checkout.session │
                            │ .completed       │
                            └──────────────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Webhook handler: │
                            │ ✓ Creates Clerk  │
                            │   account        │
                            │ ✓ Assigns        │
                            │   "subscriber"   │
                            │   role           │
                            │ ✓ Links Stripe   │
                            │   customer ID    │
                            │ ✓ Sends welcome  │
                            │   email          │
                            └──────────────────┘
                                     ↓
                            ┌──────────────────┐
                            │ User redirected  │
                            │ to success page  │
                            │ Can now login!   │
                            └──────────────────┘
```

## 🔑 Key Points

### How Subscription Mode Customer Creation Works

For `mode: 'subscription'` in Stripe Checkout:
- The `customer_creation` parameter is **NOT supported** (only works in `payment` mode)
- Stripe **automatically creates the customer** when payment is submitted
- If you don't provide a `customer` parameter, customer creation is deferred until payment
- This means: **No customer created until payment succeeds** ✅

This is EXACTLY what we need!

### Timeline of Record Creation

| Action | Clerk Account | Stripe Customer | Stripe Subscription |
|--------|--------------|-----------------|---------------------|
| User fills form | ❌ None | ❌ None | ❌ None |
| Checkout session created | ❌ None | ❌ None | ❌ None |
| User views checkout page | ❌ None | ❌ None | ❌ None |
| **User abandons checkout** | ❌ None | ❌ None | ❌ None |
| **User submits payment** | ⏳ Pending | ✅ Created | ✅ Created |
| **Webhook fires** | ✅ Created | ✅ Updated | ✅ Updated |

### What Gets Stored Where?

**Before Payment (in Checkout Session metadata only)**:
```json
{
  "pendingSignup": "true",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "encrypted_password",
  "subscriptionName": "Monthly Membership"
}
```

**After Payment (Clerk Account)**:
- Email: john@example.com
- Name: John Doe
- Role: subscriber
- Stripe Customer ID: cus_xxxxx

**After Payment (Stripe Customer)**:
- Email: john@example.com
- Name: John Doe
- Metadata: { clerkUserId: "user_xxxxx" }

**After Payment (Stripe Subscription)**:
- Customer: cus_xxxxx
- Status: trialing or active
- Metadata: { clerkUserId: "user_xxxxx", subscriptionName: "Monthly Membership" }

## 🧪 Testing Scenarios

### Scenario A: User Abandons Before Entering Card
```
1. Fill signup form → Click "START FREE TRIAL"
2. See Stripe checkout page
3. Close tab or click back button
4. Result: NOTHING created anywhere ✅
```

### Scenario B: User Abandons After Entering Card (but before clicking Subscribe)
```
1. Fill signup form → Click "START FREE TRIAL"
2. See Stripe checkout page
3. Enter card number 4242 4242 4242 4242
4. Close tab before clicking "Subscribe"
5. Result: NOTHING created anywhere ✅
   (Stripe doesn't create anything until form is submitted)
```

### Scenario C: User Completes Signup
```
1. Fill signup form → Click "START FREE TRIAL"
2. See Stripe checkout page
3. Enter card: 4242 4242 4242 4242
4. Click "Subscribe"
5. Stripe creates customer + subscription
6. Webhook fires
7. Clerk account created with subscriber role
8. User redirected to success page
9. Result: Full account with access ✅
```

## 🆚 Comparison: Old vs New

### OLD APPROACH (BAD)
```javascript
// In signup page:
const user = await signUp.create({ ... }); // ❌ Account created immediately
const customer = await stripe.customers.create({ ... }); // ❌ Customer created immediately
const session = await stripe.checkout.sessions.create({
  customer: customer.id, // ❌ Customer already exists
  ...
});
// If user abandons → orphaned account + orphaned customer ❌
```

### NEW APPROACH (GOOD)
```javascript
// In signup page:
// No account creation! ✅
// No customer creation! ✅
const session = await stripe.checkout.sessions.create({
  // Don't specify 'customer' parameter
  // For subscription mode, Stripe auto-creates customer when payment submitted ✅
  customer_email: email, // Pre-fill email
  mode: 'subscription',
  metadata: { firstName, lastName, email, password }, // Store for later
  ...
});
// If user abandons → nothing created ✅
// If user completes → webhook creates everything ✅
```

## 📊 Database State Examples

### After Abandoned Checkout
**Clerk Database**: (empty - no records)
**Stripe Database**: (empty - no records)

### After Completed Checkout
**Clerk Database**:
```
User {
  id: "user_2abc123",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  publicMetadata: { role: "subscriber" },
  privateMetadata: { stripeCustomerId: "cus_xyz789" }
}
```

**Stripe Database**:
```
Customer {
  id: "cus_xyz789",
  email: "john@example.com",
  name: "John Doe",
  metadata: { clerkUserId: "user_2abc123" }
}

Subscription {
  id: "sub_abc456",
  customer: "cus_xyz789",
  status: "trialing",
  metadata: { 
    clerkUserId: "user_2abc123",
    subscriptionName: "Monthly Membership"
  }
}
```

## 🎯 Success Criteria

✅ User abandons checkout → Zero records in Clerk
✅ User abandons checkout → Zero records in Stripe
✅ User completes checkout → One Clerk account with "subscriber" role
✅ User completes checkout → One Stripe customer with subscription
✅ User completes checkout → Clerk and Stripe records are linked
✅ User completes checkout → Welcome email sent
✅ User can immediately login and access content
