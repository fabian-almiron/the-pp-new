# 🎯 Stripe Events Reference - Complete Guide

Based on official docs: https://docs.stripe.com/api/events

## ✅ Currently Implemented Events

### **1. checkout.session.completed**
**When:** Checkout session completes successfully  
**Use Case:** Initial subscription setup, upgrade user to subscriber role  
**Data Object:** `Stripe.Checkout.Session`

```typescript
{
  id: "cs_test_...",
  mode: "subscription",
  customer: "cus_...",
  subscription: "sub_...",
  metadata: { userId: "user_..." }
}
```

---

### **2. customer.subscription.updated**
**When:** Subscription status or details change  
**Use Case:** Handle status changes (active, past_due, cancelled)  
**Data Object:** `Stripe.Subscription`

**Common Status Changes:**
- `active` → Keep subscriber role
- `past_due` → Grace period, keep access
- `cancelled` → Downgrade to customer
- `trialing` → Keep subscriber role

```typescript
{
  id: "sub_...",
  customer: "cus_...",
  status: "active" | "past_due" | "cancelled" | "trialing",
  current_period_end: 1234567890
}
```

---

### **3. customer.subscription.deleted**
**When:** Subscription is permanently deleted/cancelled  
**Use Case:** Downgrade user to customer role  
**Data Object:** `Stripe.Subscription`

```typescript
{
  id: "sub_...",
  customer: "cus_...",
  status: "cancelled",
  ended_at: 1234567890
}
```

---

### **4. invoice.payment_succeeded**
**When:** Invoice payment is successful (includes renewals)  
**Use Case:** Track successful payments, send receipts  
**Data Object:** `Stripe.Invoice`

```typescript
{
  id: "in_...",
  customer: "cus_...",
  amount_paid: 2900,
  subscription: "sub_...",
  status: "paid"
}
```

---

### **5. invoice.payment_failed**
**When:** Invoice payment fails  
**Use Case:** Notify user, handle failed payments  
**Data Object:** `Stripe.Invoice`

```typescript
{
  id: "in_...",
  customer: "cus_...",
  amount_due: 2900,
  attempt_count: 1,
  next_payment_attempt: 1234567890
}
```

---

## 📋 Recommended Additional Events

### **6. customer.subscription.created** (Optional)
**When:** New subscription is created  
**Use Case:** Send welcome email, track new subscribers  
**Priority:** Medium

```typescript
case 'customer.subscription.created': {
  // Send welcome email
  // Set up onboarding
}
```

---

### **7. customer.subscription.trial_will_end** (If using trials)
**When:** 3 days before trial ends  
**Use Case:** Remind user to add payment method  
**Priority:** High (if using trials)

```typescript
case 'customer.subscription.trial_will_end': {
  // Send trial ending reminder
  // Encourage payment method setup
}
```

---

### **8. invoice.upcoming** (Optional)
**When:** 7 days before invoice is finalized  
**Use Case:** Preview upcoming charges  
**Priority:** Low

```typescript
case 'invoice.upcoming': {
  // Send upcoming charge notification
}
```

---

### **9. invoice.finalized** (Optional)
**When:** Invoice is ready but not yet paid  
**Use Case:** Send invoice to customer  
**Priority:** Low

```typescript
case 'invoice.finalized': {
  // Send invoice email
}
```

---

## 🚫 Events You DON'T Need

These are common but **not needed** for basic role management:

- ❌ `charge.succeeded` - Redundant with invoice.payment_succeeded
- ❌ `charge.failed` - Redundant with invoice.payment_failed
- ❌ `payment_intent.succeeded` - Lower level than invoice events
- ❌ `customer.created` - Not needed for role management
- ❌ `invoice.created` - Too early in payment process

---

## 🎯 Event Selection by Use Case

### **Minimum (What you have now):**
```
✅ checkout.session.completed
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

### **Recommended for Production:**
```
✅ All minimum events (above)
📋 customer.subscription.created
📋 customer.subscription.trial_will_end (if using trials)
```

### **Full Featured (Enterprise):**
```
✅ All recommended events (above)
📋 invoice.upcoming
📋 invoice.finalized
📋 invoice.payment_action_required
```

---

## 🔍 Event Type Verification Checklist

Use this to verify you're listening to the right events:

### **Role Management (Required):**
- ✅ `checkout.session.completed` - Initial subscription
- ✅ `customer.subscription.updated` - Status changes
- ✅ `customer.subscription.deleted` - Cancellation
- ✅ `invoice.payment_succeeded` - Successful renewal
- ✅ `invoice.payment_failed` - Failed payment

### **User Communication (Optional):**
- 📋 `customer.subscription.created` - Welcome email
- 📋 `customer.subscription.trial_will_end` - Trial reminder
- 📋 `invoice.payment_succeeded` - Receipt email
- 📋 `invoice.payment_failed` - Payment failure notice

### **Advanced Features (Optional):**
- 📋 `invoice.upcoming` - Charge preview
- 📋 `customer.subscription.paused` - Subscription pause
- 📋 `customer.subscription.resumed` - Subscription resume

---

## 📖 Complete Event Reference

For all available events, see: https://docs.stripe.com/api/events/types

**Common Event Categories:**
- **Checkout:** `checkout.session.*`
- **Subscriptions:** `customer.subscription.*`
- **Invoices:** `invoice.*`
- **Payments:** `payment_intent.*`, `charge.*`
- **Customers:** `customer.*`

---

## ✅ Your Current Setup is Correct!

According to the official Stripe documentation, you're using the **exact right events** for automatic role management:

1. ✅ `checkout.session.completed` - Perfect for initial subscription
2. ✅ `customer.subscription.updated` - Handles all status changes
3. ✅ `customer.subscription.deleted` - Handles cancellation
4. ✅ `invoice.payment_succeeded` - Tracks successful renewals
5. ✅ `invoice.payment_failed` - Catches payment issues

**No changes needed!** Your webhook is configured correctly. 🎉

---

## 🔗 Official Documentation

- Events API: https://docs.stripe.com/api/events
- Event Types: https://docs.stripe.com/api/events/types
- Webhooks Guide: https://docs.stripe.com/webhooks
- Testing Webhooks: https://docs.stripe.com/webhooks/test
