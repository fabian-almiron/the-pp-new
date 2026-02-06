# Webhook Monitoring Quick Reference

## 🎯 What to Look For in Your Logs

### ✅ GOOD - Normal Operations

#### Successful signup with strong password:
```
✅ SUBSCRIPTION SIGNUP COMPLETE
   Password: Customer's original password
```
**Action:** None needed. Everything worked perfectly.

---

#### Successful signup with compromised password (recovered):
```
⚠️  Password rejected by Clerk (found in data breach database)
🔄 Automatically retrying with secure random password...
✅ Account created successfully with secure password
✅ SUBSCRIPTION SIGNUP COMPLETE
   Password: Secure random (customer will set their own)
```
**Action:** None needed. System handled it automatically. Customer will receive password reset email.

---

### ⚠️ ATTENTION - Needs Review

#### Payment failed:
```
❌ Payment intent failed: pi_xxx
🔄 Subscription updated: sub_xxx Status: past_due
```
**Action:** 
- Normal for failed credit card charges
- Customer will receive email from Stripe
- Monitor if it becomes a pattern for same customer

---

#### Owner notification skipped:
```
ℹ️  Skipping owner notification for subscription payment
```
**Action:** 
- This is intentional (prevents inbox flooding)
- Only product purchases send owner notifications
- Review `BUSINESS_OWNER_EMAIL` env var if you want notifications

---

### 🚨 CRITICAL - Immediate Action Required

#### Account creation completely failed:
```
❌❌❌ CRITICAL: Failed to create user even with secure password!
⚠️  USER NOT CREATED - MANUAL INTERVENTION REQUIRED
📋 Data for manual creation:
   {
     email: "customer@example.com",
     stripeCustomerId: "cus_xxx",
     subscriptionId: "sub_xxx",
     ...
   }
```
**Action:**
1. Create account manually in Clerk Dashboard
2. Link Stripe customer ID
3. Set role to "subscriber"
4. Send password reset email to customer
5. Investigate why it failed (check Clerk dashboard for issues)

---

## 📊 Health Metrics

### Expected Rates:

| Metric | Normal Range | Concern Level |
|--------|--------------|---------------|
| Pwned password rate | 5-25% | >30% (possible bots) |
| Successful recovery | 100% of pwned | <100% (critical failures) |
| Payment failures | 2-5% | >10% (investigate payment flow) |
| Account creation success | >99.9% | <99% (system issues) |

---

## 🔍 Vercel Log Search Queries

### See all successful signups:
```
SUBSCRIPTION SIGNUP COMPLETE
```

### See compromised password handling:
```
Password rejected by Clerk
```

### See critical failures only:
```
USER NOT CREATED - MANUAL INTERVENTION REQUIRED
```

### See payment failures:
```
Payment intent failed
```

### See all subscription events:
```
customer.subscription
```

---

## 🔔 Recommended Alerts

### Set up Vercel alerts for:

1. **Critical Failures**
   - Search: `USER NOT CREATED - MANUAL INTERVENTION REQUIRED`
   - Frequency: Immediate
   - Action: Create account manually

2. **High Pwned Password Rate**
   - Search: `Password rejected by Clerk`
   - Frequency: Daily summary
   - Threshold: >30% of signups
   - Action: Investigate for bot activity

3. **Payment Failures**
   - Search: `Payment intent failed`
   - Frequency: Daily summary
   - Action: Review patterns

---

## 📧 Email Monitoring

### Customer receives emails for:

| Event | Email Type | Content |
|-------|-----------|---------|
| Subscription signup (strong password) | Standard welcome | No password reset needed |
| Subscription signup (pwned password) | Welcome + password reset | Yellow warning box with instructions |
| Product purchase | Receipt + download links | For ebooks, shows download button |
| Payment failure | Stripe automatic | Sent by Stripe, not your system |

### Owner receives emails for:

| Event | Email Type | Sent? |
|-------|-----------|-------|
| Product purchase | Invoice copy | ✅ Yes |
| Subscription payment | Invoice copy | ❌ No (prevents inbox flooding) |

To enable owner notifications:
```env
BUSINESS_OWNER_EMAIL=your-email@example.com
```

---

## 🛠️ Troubleshooting

### Customer reports: "I can't log in"

**Possible causes:**
1. Used compromised password → Check email for password reset instructions
2. Account not created → Search logs for their email
3. Wrong email address → Check Stripe dashboard for actual email used
4. Browser autocomplete → Try "Forgot Password" flow

**Resolution:**
```bash
# Search Vercel logs for customer email
customer@example.com

# Look for:
- "SUBSCRIPTION SIGNUP COMPLETE" (account exists)
- "USER NOT CREATED" (account missing)
- "Password: Secure random" (needs password reset)
```

---

### Webhook shows error but subscription is active

**This is normal!** The webhook returns 200 to Stripe even if handlers fail partially. This prevents retry loops.

**Check if:**
- Account was created (search for "SUBSCRIPTION SIGNUP COMPLETE")
- Email was sent (search for "Welcome email sent successfully")
- If both succeeded, the "error" was handled

**If account wasn't created:**
- Look for "USER NOT CREATED" message
- Follow manual account creation steps

---

### Multiple webhook events for same subscription

**This is normal!** Stripe sends multiple events:
1. `checkout.session.completed` - Payment succeeded
2. `customer.subscription.created` - Subscription created
3. `invoice.payment_succeeded` - First invoice paid
4. `customer.subscription.updated` - Status updated

Your webhook handles each appropriately and uses idempotency checks to prevent duplicate processing.

---

### Password reset emails not being received

**Check:**
1. Spam/junk folder
2. Brevo SMTP credentials in Vercel env vars
3. Vercel logs for "Welcome email sent successfully"
4. Brevo dashboard for delivery status

**Environment variables:**
```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=your-smtp-key
BREVO_FROM_EMAIL=noreply@thepipedpeony.com
```

---

## 📈 Weekly Review Checklist

### Monday Morning Review:

- [ ] Check critical failure count (should be 0)
- [ ] Review pwned password rate (normal: 5-25%)
- [ ] Check payment failure rate (normal: 2-5%)
- [ ] Verify email delivery in Brevo dashboard
- [ ] Review any customer support inquiries related to login

### Monthly Review:

- [ ] Analyze pwned password trends
- [ ] Review failed payment patterns
- [ ] Check Clerk account count vs Stripe subscriber count
- [ ] Verify all webhook events are being processed
- [ ] Update documentation if needed

---

## 🔐 Security Checklist

### Environment Variables:

- [ ] `ENCRYPTION_KEY` - Set to secure random key (not Stripe key)
- [ ] `STRIPE_SECRET_KEY` - Starts with `sk_live_` in production
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `CLERK_SECRET_KEY` - Starts with `sk_live_` in production
- [ ] `BREVO_SMTP_KEY` - Valid SMTP API key

### Webhook Security:

- [ ] Signature verification enabled (line 28 in webhook)
- [ ] Always returns 200 (prevents retry loops)
- [ ] Idempotency check working (in-memory set)
- [ ] Passwords encrypted before Stripe storage
- [ ] Error details not exposed to client

---

## 📞 Support Response Templates

### Customer: "I can't log in after signing up"

```
Thank you for signing up! For security reasons, we detected that your 
original password had been compromised in a data breach, so we've secured 
your account with a temporary password.

Please check your email for instructions on setting your own secure password. 
It should have arrived within a few minutes of your signup.

If you don't see the email:
1. Check your spam/junk folder
2. Try using "Forgot Password" on the login page
3. Reply to this email and we'll help you access your account

Your subscription is active and ready - you just need to set a password to log in!
```

---

### Customer: "I didn't receive a welcome email"

```
Let me help you access your account! Your subscription is active.

Please go to: https://www.thepipedpeony.com/login
Click "Forgot Password"
Enter your email: [their-email]

You'll receive an email with a link to set your password. Once you set it, 
you'll have full access to all your subscription content.

If you don't receive the password reset email within 10 minutes, please 
check your spam folder or reply to this message.
```

---

## 🎓 Training Resources

### For your team:

1. **Understanding Pwned Passwords**
   - Read: PWNED_PASSWORD_FIX.md
   - Why Clerk rejects weak passwords
   - How automatic recovery works

2. **Encryption Overview**
   - Read: PASSWORD_SECURITY_FIX.md
   - Why passwords are encrypted
   - How decryption works in webhooks

3. **Full Webhook Flow**
   - Read: WEBHOOK_PASSWORD_HANDLING.md
   - Complete customer journey
   - Error handling scenarios

4. **Monitoring Best Practices**
   - Read: WEBHOOK_MONITORING_GUIDE.md (this file)
   - What to watch for
   - When to take action

---

## 📝 Change Log

| Date | Change | Impact |
|------|--------|--------|
| Feb 6, 2026 | Improved webhook logging | Clearer distinction between expected errors and critical failures |
| [Previous] | Added pwned password handling | Automatic recovery for compromised passwords |
| [Previous] | Added password encryption | Secure storage in Stripe metadata |

---

**Quick Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Brevo Dashboard](https://app.brevo.com/)

**Support Contacts:**
- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com/
- Clerk: https://clerk.com/support
- Brevo: https://help.brevo.com/
