# WordPress to Clerk User Migration Guide

## Overview

This document outlines the complete field mapping strategy for migrating WordPress users to Clerk authentication for The Piped Peony website.

---

## WordPress Role to Clerk Role Mapping

Current Clerk system uses 2 roles: **`customer`** (free tier) and **`subscriber`** (premium tier)

### Role Mapping Table

| WordPress Role | Clerk Role | Additional Metadata | Notes |
|---------------|-----------|-------------------|-------|
| `customer` | `customer` | None | Direct match - free tier user |
| `pending` | `customer` | `accountStatus: "pending"` | Incomplete registration/payment |
| `wpfs_no_access` | `customer` | `accountStatus: "blocked"` | Suspended/blocked user |
| `subscriber` | `subscriber` | `subscriptionTier: "basic"` | Basic subscription member |
| `wpfs_bronze` | `subscriber` | `subscriptionTier: "bronze"` | Bronze tier subscription |
| `wpfs_gold` | `subscriber` | `subscriptionTier: "gold"` | Gold/premium tier subscription |

### Migration Logic

1. All paying tiers (`subscriber`, `wpfs_bronze`, `wpfs_gold`) map to Clerk `subscriber` role
2. Original tier is preserved in `publicMetadata.subscriptionTier` for billing/display purposes
3. Original WordPress role stored in `publicMetadata.originalWordPressRole` for reference
4. Users with `pending` or `wpfs_no_access` roles get `customer` role with appropriate `accountStatus` flag

---

## Field Mapping Reference

### Core User Fields (Already Implemented)

| WordPress Field | Clerk Field | Type | Notes |
|----------------|------------|------|-------|
| `user_email` | `email` | Core | Primary email address |
| `first_name` | `firstName` | Core | User's first name |
| `last_name` | `lastName` | Core | User's last name |
| `user_login` | `username` | Core | Username for login |
| `user_registered` | `createdAt` | Core | Account creation date |
| `role` | `publicMetadata.role` | Metadata | Mapped per role table above |

### High Priority Fields (Recommended)

| WordPress Field | Clerk Field | Type | Purpose |
|----------------|------------|------|---------|
| `role` | `publicMetadata.originalWordPressRole` | publicMetadata | Preserve original WP role |
| `role` | `publicMetadata.subscriptionTier` | publicMetadata | Store tier for bronze/gold users |
| `role` | `publicMetadata.accountStatus` | publicMetadata | Store status for pending/blocked |
| `yuvqa__stripe_customer_id` | `privateMetadata.stripeCustomerId` | privateMetadata | Link to Stripe customer |
| `_active_stripe_subscription_id` | `privateMetadata.activeSubscriptionId` | privateMetadata | Active subscription tracking |
| `paying_customer` | `publicMetadata.isPayingCustomer` | publicMetadata | Quick payment status check |
| `user_id` | `publicMetadata.wpUserId` | publicMetadata | Original WordPress user ID |

### Billing Fields (Recommended for Checkout)

Store all billing fields in `privateMetadata.billingInfo` object:

```json
{
  "billingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Company Name",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US",
    "email": "john@example.com",
    "phone": "555-1234"
  }
}
```

### Shipping Fields (Recommended for E-commerce)

Store all shipping fields in `privateMetadata.shippingInfo` object:

```json
{
  "shippingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Company Name",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US",
    "phone": "555-1234"
  }
}
```

### Optional Fields

| WordPress Field | Clerk Field | Type | Purpose |
|----------------|------------|------|---------|
| `saved_courses` | `publicMetadata.savedCourses` | publicMetadata | Preserve user course progress |
| `wc_last_active` | `publicMetadata.lastActive` | publicMetadata | Track user activity |
| `display_name` | `publicMetadata.displayName` | publicMetadata | Custom display name |

### Fields to Skip

The following WordPress fields are not needed in Clerk:

- `_metorik_*` - Analytics data (not needed in auth system)
- `yuvqa_*` settings - WordPress admin settings
- `session_tokens` - Clerk handles sessions
- Plugin-specific metadata - Only migrate if actively used

---

## Migration Flag Lifecycle

### 1. User Import (Initial State)

When importing users from WordPress:

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "publicMetadata": {
    "role": "subscriber",
    "migratedFromWordPress": true,
    "originalWordPressRole": "wpfs_gold",
    "subscriptionTier": "gold",
    "isPayingCustomer": true,
    "wpUserId": "12345",
    "migrationDate": "2025-10-29"
  }
}
```

### 2. First Login Attempt

- Login page checks email via `/api/check-user-email`
- If `migratedFromWordPress === true`, password reset modal appears
- Modal explains password reset requirement due to security upgrade
- User can dismiss or reset password immediately

### 3. Password Reset

- User resets password via Clerk's password reset flow
- Clerk webhook detects `user.updated` event
- If `migratedFromWordPress === true` and password is enabled:
  - Webhook removes `migratedFromWordPress` flag
  - User record updated in Clerk

### 4. Future Logins

- `migratedFromWordPress` flag is gone
- No modal appears
- User logs in normally

---

## Example User Import Structure

### Example 1: Gold Tier Subscriber

```json
{
  "userId": "554872",
  "email": "goldmember@example.com",
  "username": "golduser",
  "password": "$P$BanotherHashExample123",
  "passwordHasher": "phpass",
  "firstName": "Gold",
  "lastName": "Member",
  "publicMetadata": {
    "role": "subscriber",
    "migratedFromWordPress": true,
    "originalWordPressRole": "wpfs_gold",
    "subscriptionTier": "gold",
    "isPayingCustomer": true,
    "wpUserId": "554872",
    "migrationDate": "2025-10-29"
  },
  "privateMetadata": {
    "stripeCustomerId": "cus_example123",
    "activeSubscriptionId": "sub_example456",
    "billingInfo": {
      "firstName": "Gold",
      "lastName": "Member",
      "address1": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "postcode": "90210",
      "country": "US",
      "email": "goldmember@example.com",
      "phone": "555-1234"
    }
  }
}
```

### Example 2: Pending Customer

```json
{
  "userId": "554873",
  "email": "pending@example.com",
  "username": "pendinguser",
  "password": "$P$BpendingUserHash789",
  "passwordHasher": "phpass",
  "firstName": "Pending",
  "lastName": "User",
  "publicMetadata": {
    "role": "customer",
    "migratedFromWordPress": true,
    "originalWordPressRole": "pending",
    "accountStatus": "pending",
    "wpUserId": "554873",
    "migrationDate": "2025-10-29"
  },
  "privateMetadata": {}
}
```

### Example 3: Blocked User

```json
{
  "userId": "554874",
  "email": "blocked@example.com",
  "username": "blockeduser",
  "password": "$P$BblockedUserHash321",
  "passwordHasher": "phpass",
  "firstName": "Blocked",
  "lastName": "Access",
  "publicMetadata": {
    "role": "customer",
    "migratedFromWordPress": true,
    "originalWordPressRole": "wpfs_no_access",
    "accountStatus": "blocked",
    "wpUserId": "554874",
    "migrationDate": "2025-10-29"
  },
  "privateMetadata": {}
}
```

---

## Implementation Files

### API Endpoints

- **`/api/check-user-email`** - Checks if user exists and returns migration status
- **`/api/clerk-webhook`** - Handles Clerk webhooks including password reset detection

### Components

- **`components/password-reset-notification.tsx`** - Modal component for migration notification
- **`app/login/page.tsx`** - Login page with migration check integration

### Webhook Functions

- **`handlePasswordReset()`** - Removes `migratedFromWordPress` flag after password reset
- **`mapWordPressRole()`** - Maps WordPress roles to Clerk roles with metadata

---

## Migration Best Practices

### 1. Test with Sample Users First

Use `users.json` to test with sample users representing each role type before bulk import.

### 2. Preserve Original Data

Always store:
- Original WordPress user ID (`wpUserId`)
- Original WordPress role (`originalWordPressRole`)
- Migration date (`migrationDate`)

This allows you to trace issues back to WordPress if needed.

### 3. Handle Stripe Customers Carefully

- Match Stripe customer IDs from WordPress to Clerk `privateMetadata`
- Verify subscription status before setting `isPayingCustomer`
- Update Stripe customer metadata to include Clerk user ID

### 4. Communicate with Users

Before migration:
- Email users about the upcoming change
- Explain the password reset requirement
- Provide support contact information

### 5. Monitor the Migration

- Check Clerk webhook logs for errors
- Monitor password reset completion rates
- Track login success/failure rates
- Be ready to assist users who need help

---

## Troubleshooting

### User Can't Login After Migration

1. Verify user exists in Clerk dashboard
2. Check `migratedFromWordPress` flag in publicMetadata
3. Trigger manual password reset email from Clerk dashboard
4. Verify webhook is processing `user.updated` events

### Password Reset Not Removing Flag

1. Check Clerk webhook is configured and receiving events
2. Verify `CLERK_SECRET_KEY` is set in environment variables
3. Check webhook logs for errors
4. Manually remove flag via Clerk dashboard if needed

### Subscription Tier Not Showing

1. Verify `subscriptionTier` in publicMetadata
2. Check role mapping logic in webhook
3. Update user metadata manually if needed

---

## Support Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk User Management**: https://clerk.com/docs/users/overview
- **Clerk Metadata Guide**: https://clerk.com/docs/users/metadata
- **Clerk Webhooks**: https://clerk.com/docs/integrations/webhooks/overview

---

## Migration Checklist

- [ ] Export WordPress users with all required fields
- [ ] Test migration with sample users (use `users.json`)
- [ ] Configure Clerk webhook endpoint
- [ ] Set up password reset notification modal
- [ ] Test password reset flow
- [ ] Verify metadata mapping
- [ ] Test role-based access control
- [ ] Import users in batches (recommended: 100 at a time)
- [ ] Monitor webhook logs during import
- [ ] Send email to users about password reset requirement
- [ ] Monitor login success rates
- [ ] Provide user support for migration issues

