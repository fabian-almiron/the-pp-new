import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import { sendSubscriptionTrialEmail, sendPurchaseReceiptEmail, sendInvoiceCopyToOwner } from '@/lib/email';
import { decrypt, isEncrypted } from '@/lib/crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Track processed events to prevent duplicate processing (in-memory for now)
// In production, use Redis or database
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('🔔 Stripe webhook received:', event.type, 'ID:', event.id);
  
  // Idempotency check: Have we already processed this event?
  if (processedEvents.has(event.id)) {
    console.log('⚠️  Event already processed, skipping:', event.id);
    return NextResponse.json({ received: true, note: 'already_processed' });
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle subscription checkouts
        if (session.mode === 'subscription') {
          await handleCheckoutSessionCompleted(session);
        } 
        // Handle product purchases
        else if (session.mode === 'payment') {
          await handleProductPurchase(session);
        }
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;
      
      case 'payment_intent.succeeded':
        console.log('💰 Payment intent succeeded:', (event.data.object as Stripe.PaymentIntent).id);
        break;
      
      case 'payment_intent.payment_failed':
        console.error('❌ Payment intent failed:', (event.data.object as Stripe.PaymentIntent).id);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    processedEvents.add(event.id);
    
    // IMPORTANT: Always return 200 to Stripe, even if handler had issues
    // This prevents retry loops for events that partially succeeded
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌❌❌ CRITICAL: Webhook handler error for event', event.id);
    console.error('Error:', error);
    console.error('Event type:', event.type);
    console.error('Event data:', JSON.stringify(event.data.object, null, 2));
    
    // STILL return 200 to prevent Stripe from retrying
    // Log the error so you can manually fix it later
    // TODO: Send to error tracking service (Sentry, etc.)
    return NextResponse.json({ 
      received: true, 
      error: 'Handler failed but accepted to prevent retries',
      eventId: event.id 
    });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔍 Checkout session completed:');
  console.log('  - Session ID:', session.id);
  console.log('  - Mode:', session.mode);
  console.log('  - Customer:', session.customer);
  console.log('  - Subscription:', session.subscription);
  console.log('  - Metadata:', JSON.stringify(session.metadata, null, 2));
  
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    console.log('📋 Subscription details:');
    console.log('  - Subscription ID:', subscription.id);
    console.log('  - Status:', subscription.status);
    console.log('  - Metadata:', JSON.stringify(subscription.metadata, null, 2));
    
    // NEW: Check if this is a pending signup (no Clerk account exists yet)
    const isPendingSignup = session.metadata?.pendingSignup === 'true';
    let clerkUserId = session.metadata?.clerkUserId;
    let usedRandomPassword = false; // Track if we had to use random password due to breach
    
    if (isPendingSignup && !clerkUserId) {
      console.log('🆕 Pending signup detected - creating Clerk account now...');
      console.log('📋 Session ID:', session.id);
      console.log('📋 Session customer:', session.customer);
      console.log('📋 Customer type:', typeof session.customer);
      
      // Extract signup data from metadata
      const firstName = session.metadata?.firstName;
      const lastName = session.metadata?.lastName;
      const email = session.metadata?.email;
      const encryptedPassword = session.metadata?.password;
      
      if (!firstName || !lastName || !email || !encryptedPassword) {
        console.error('❌❌❌ CRITICAL: Missing signup data in metadata!');
        console.error('Session ID:', session.id);
        console.error('Available metadata:', session.metadata);
        console.error('Missing fields:', {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !encryptedPassword,
        });
        // Don't throw - just log the error and let Stripe know the payment succeeded
        // We can manually create these accounts later
        return;
      }
      
      // 🔒 SECURITY: Decrypt password (it was encrypted before storing in Stripe)
      let password: string;
      try {
        if (isEncrypted(encryptedPassword)) {
          console.log('🔓 Decrypting password...');
          password = decrypt(encryptedPassword);
          console.log('✅ Password decrypted successfully');
        } else {
          // Backwards compatibility: if it's not encrypted (old data), use as-is
          console.warn('⚠️  Password not encrypted (legacy data)');
          password = encryptedPassword;
        }
      } catch (decryptError) {
        console.error('❌❌❌ CRITICAL: Failed to decrypt password!');
        console.error('Session ID:', session.id);
        console.error('Error:', decryptError);
        // Can't create account without password
        return;
      }
      
      const stripeCustomerId = session.customer as string;
      
      if (!stripeCustomerId) {
        console.error('❌❌❌ CRITICAL: No Stripe customer ID in session!');
        console.error('Session ID:', session.id);
        return;
      }
      
      try {
        console.log('👤 Creating Clerk user:', email);
        console.log('🔍 First checking if user already exists...');
        
        // Check if user already exists (in case of duplicate signups that slipped through)
        const existingUsers = await clerkClient.users.getUserList({
          emailAddress: [email],
        });
        
        if (existingUsers.data.length > 0) {
          // User already exists - link the Stripe customer to the existing account
          const existingUser = existingUsers.data[0];
          clerkUserId = existingUser.id;
          console.log('⚠️  User already exists, linking to existing account:', clerkUserId);
          
          // Update existing user with Stripe customer ID and subscriber role
          try {
            await clerkClient.users.updateUserMetadata(clerkUserId, {
              publicMetadata: {
                role: 'subscriber',
              },
              privateMetadata: {
                stripeCustomerId: stripeCustomerId,
              },
            });
            console.log('✅ Updated existing user with subscription');
          } catch (updateError) {
            console.error('❌ Failed to update existing user metadata:', updateError);
            // Don't throw - user exists, just couldn't update metadata
          }
        } else {
          // Create the Clerk user NOW that payment succeeded
          console.log('➕ Creating new Clerk user...');
          try {
            const newUser = await clerkClient.users.createUser({
              firstName: firstName,
              lastName: lastName,
              emailAddress: [email],
              password: password,
              publicMetadata: {
                role: 'subscriber', // Immediately assign subscriber role
              },
              privateMetadata: {
                stripeCustomerId: stripeCustomerId,
              },
            });
            
            clerkUserId = newUser.id;
            console.log('✅ Created Clerk user:', clerkUserId);
          } catch (createError: any) {
            // Check if it's a password breach error (form_password_pwned)
            const isPwnedPassword = createError.errors?.some((err: any) => 
              err.code === 'form_password_pwned'
            );
            
            if (isPwnedPassword) {
              // This is EXPECTED and will be handled automatically
              console.log('⚠️  Password rejected by Clerk (found in data breach database)');
              console.log('   Email:', email);
              console.log('   Reason: Password has been compromised in a known breach');
              console.log('🔄 Automatically retrying with secure random password...');
              
              // Generate a secure random password
              const { randomBytes } = await import('crypto');
              const randomPassword = randomBytes(32).toString('hex');
              
              try {
                const newUser = await clerkClient.users.createUser({
                  firstName: firstName,
                  lastName: lastName,
                  emailAddress: [email],
                  password: randomPassword, // Secure random password
                  publicMetadata: {
                    role: 'subscriber',
                  },
                  privateMetadata: {
                    stripeCustomerId: stripeCustomerId,
                  },
                });
                
                clerkUserId = newUser.id;
                usedRandomPassword = true; // Flag for email notification
                console.log('✅ Account created successfully with secure password:', clerkUserId);
                console.log('📧 Customer will receive welcome email with password reset instructions');
                console.log('💡 This is normal - customer will set their own secure password via email link');
              } catch (retryError: any) {
                console.error('❌❌❌ CRITICAL: Failed to create user even with secure password!');
                console.error('Email:', email);
                console.error('Session ID:', session.id);
                console.error('Retry error:', retryError.message);
                console.error('Retry error details:', retryError.errors);
                console.error('⚠️  USER NOT CREATED - MANUAL INTERVENTION REQUIRED');
                console.error('📋 Data for manual creation:', {
                  email,
                  firstName,
                  lastName,
                  stripeCustomerId,
                  sessionId: session.id,
                  subscriptionId: subscription.id,
                  reason: 'Clerk rejected user creation even with secure random password',
                });
                return;
              }
            } else {
              // Some other error - not a pwned password
              console.error('❌❌❌ CRITICAL: Failed to create Clerk user!');
              console.error('Error:', createError);
              console.error('Error message:', createError.message);
              console.error('Error details:', createError.errors);
              // Some other error - try to check if user was created anyway
              console.error('Session ID:', session.id);
              console.error('Email:', email);
              console.error('Stripe Customer ID:', stripeCustomerId);
              
              try {
                const retryUsers = await clerkClient.users.getUserList({
                  emailAddress: [email],
                });
                if (retryUsers.data.length > 0) {
                  clerkUserId = retryUsers.data[0].id;
                  console.log('✅ Found user on retry, they were created:', clerkUserId);
                } else {
                  // User truly doesn't exist - this needs manual intervention
                  console.error('❌❌❌ USER NOT CREATED - MANUAL FIX REQUIRED');
                  console.error('Customer has Stripe subscription but no Clerk account');
                  console.error('Data for manual creation:', {
                    email,
                    firstName,
                    lastName,
                    stripeCustomerId,
                    sessionId: session.id,
                  });
                  // Don't throw - we want Stripe to think the webhook succeeded
                  return;
                }
              } catch (retryError) {
                console.error('❌ Retry check also failed:', retryError);
                return;
              }
            }
          }
        }
        
        // Update Stripe customer with Clerk user ID and proper name
        if (clerkUserId) {
          try {
            await stripe.customers.update(stripeCustomerId, {
              name: `${firstName} ${lastName}`,
              metadata: {
                clerkUserId: clerkUserId,
                pendingSignup: 'false', // Mark as completed
              },
            });
            console.log('✅ Updated Stripe customer with name and Clerk user ID');
          } catch (customerUpdateError) {
            console.error('⚠️  Failed to update Stripe customer (non-critical):', customerUpdateError);
            // Don't throw - the important part (Clerk user) succeeded
          }
          
          // Update subscription with Clerk user ID
          try {
            await stripe.subscriptions.update(subscription.id, {
              metadata: {
                clerkUserId: clerkUserId,
                subscriptionName: session.metadata?.subscriptionName || 'Membership',
                pendingSignup: 'false', // Mark as completed
              },
            });
            console.log('✅ Updated Stripe subscription with Clerk user ID');
          } catch (subUpdateError) {
            console.error('⚠️  Failed to update Stripe subscription (non-critical):', subUpdateError);
            // Don't throw - the important part (Clerk user) succeeded
          }
        }
      } catch (error: any) {
        console.error('❌❌❌ CRITICAL: Unexpected error in user creation flow!');
        console.error('Error:', error);
        console.error('Session ID:', session.id);
        console.error('Email:', email);
        console.error('Stripe Customer ID:', stripeCustomerId);
        // Don't throw - we want the webhook to succeed so Stripe doesn't retry
      }
    }
    
    console.log('👤 Clerk User ID:', clerkUserId);
    
    if (clerkUserId) {
      // If the account already existed (not a pending signup), update role
      if (!isPendingSignup) {
        console.log('🔄 Updating existing user role to Subscriber in Clerk...');
        console.log('  - User ID:', clerkUserId);
        console.log('  - New Role: Subscriber');
        
        try {
          await updateClerkUserRole(clerkUserId, 'subscriber');
          console.log('✅ Clerk user role update completed successfully');
        } catch (error) {
          console.error('❌ Failed to update Clerk user role:', error);
          throw error;
        }
      }
      
      // Send welcome email for subscription signups
      // Use customer_details.email as fallback since customer_email can be null
      const customerEmail = session.customer_email || session.customer_details?.email || session.metadata?.email;
      
      if (customerEmail) {
        console.log('📧 Preparing subscription welcome email');
        console.log('   Recipient:', customerEmail);
        if (usedRandomPassword) {
          console.log('   Type: Welcome email WITH password reset instructions');
          console.log('   Reason: Original password was found in data breach database');
        } else {
          console.log('   Type: Standard welcome email');
        }
        
        // Determine trial days
        const trialDays = subscription.trial_end ? 
          Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        
        const subscriptionName = subscription.metadata?.subscriptionName || session.metadata?.subscriptionName || 'Membership';
        
        const emailSent = await sendSubscriptionTrialEmail(
          customerEmail,
          subscriptionName,
          trialDays,
          usedRandomPassword // Notify if they need to set password
        );
        
        if (emailSent) {
          console.log('✅ Welcome email sent successfully');
        } else {
          console.error('❌ Failed to send welcome email');
        }
      } else {
        console.log('⚠️ No customer email found, skipping email');
      }
      
      // Summary log
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUBSCRIPTION SIGNUP COMPLETE');
      console.log('   Customer:', customerEmail);
      console.log('   Clerk User ID:', clerkUserId);
      console.log('   Subscription:', subscription.id);
      console.log('   Status:', subscription.status);
      if (usedRandomPassword) {
        console.log('   Password: Secure random (customer will set their own)');
      } else {
        console.log('   Password: Customer\'s original password');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.error('❌ No clerkUserId available after processing');
      console.error('Available metadata keys:', Object.keys(session.metadata || {}));
    }
  } else {
    console.log('ℹ️  Skipping subscription update:');
    console.log('  - Mode:', session.mode);
    console.log('  - Has subscription:', !!session.subscription);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription created:', subscription.id);
  // Update Clerk role if needed
  const clerkUserId = subscription.metadata?.clerkUserId;
  if (clerkUserId && ['active', 'trialing'].includes(subscription.status)) {
    await updateClerkUserRole(clerkUserId, 'subscriber');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id, 'Status:', subscription.status);
  
  // Update Clerk user role based on subscription status
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (clerkUserId) {
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const role = isActive ? 'subscriber' : 'customer';
    await updateClerkUserRole(clerkUserId, role);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  // Downgrade Clerk user role to customer
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (clerkUserId) {
    await updateClerkUserRole(clerkUserId, 'customer');
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Invoice payment succeeded:', invoice.id);
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const clerkUserId = subscription.metadata?.clerkUserId;
    
    if (clerkUserId && ['active', 'trialing'].includes(subscription.status)) {
      await updateClerkUserRole(clerkUserId, 'subscriber');
    }
  }
  
  // Note: Invoice copy emails are only sent for product purchases, not subscriptions
  // This prevents inbox flooding from recurring subscription payments
  console.log('ℹ️  Skipping owner notification for subscription payment');
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Downgrade Clerk user role if payment failed
    const clerkUserId = subscription.metadata?.clerkUserId;
    if (clerkUserId && subscription.status === 'past_due') {
      await updateClerkUserRole(clerkUserId, 'customer');
    }
  }
}


async function updateClerkUserRole(clerkUserId: string, role: 'customer' | 'subscriber') {
  try {
    console.log(`🔍 Updating Clerk user ${clerkUserId} to role ${role}`);
    
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: role,
      },
    });
    
    console.log(`✅ Successfully updated Clerk user ${clerkUserId} to ${role}`);
  } catch (error) {
    console.error('❌ Error updating Clerk user role:', error);
  }
}

// ============================================
// PRODUCT PURCHASE HANDLERS
// ============================================

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  try {
    console.log('📧 Invoice created:', invoice.id);
    console.log('  - Billing reason:', invoice.billing_reason);
    console.log('  - Status:', invoice.status);
    console.log('  - Amount:', invoice.amount_due / 100);
    console.log('  - Customer email:', invoice.customer_email);
    
    // Note: For subscription invoices, Stripe automatically sends receipts
    // when you have "Customer emails" enabled in Dashboard → Settings → Emails
    // So we only need to manually send invoices for one-time payments (shop purchases)
    
    // Skip subscription invoices - Stripe sends these automatically
    if (invoice.billing_reason === 'subscription_create' ||
        invoice.billing_reason === 'subscription_cycle' ||
        invoice.billing_reason === 'subscription_update') {
      console.log('ℹ️  Skipping subscription invoice - Stripe sends these automatically when "Customer emails" are enabled in dashboard');
      console.log('💡 To verify: Dashboard → Settings → Emails → "Successful payments" should be enabled');
      return;
    }
    
    // Handle product purchase invoices (from shop checkout)
    console.log('💰 Processing shop purchase invoice...');
    
    // Finalize the invoice if it's still a draft
    if (invoice.status === 'draft') {
      console.log('📝 Finalizing draft invoice...');
      await stripe.invoices.finalizeInvoice(invoice.id);
    }
    
    // Send the invoice/receipt email to the customer
    console.log('📮 Sending receipt email to:', invoice.customer_email);
    await stripe.invoices.sendInvoice(invoice.id);
    
    console.log('✅ Receipt sent successfully!');
  } catch (error: any) {
    console.error('❌ Error sending invoice:', error);
    console.error('Error details:', error.message);
    // Don't throw - we don't want to fail the webhook if email sending fails
  }
}

async function handleProductPurchase(session: Stripe.Checkout.Session) {
  console.log('🛒 Processing product purchase');
  console.log('📋 Session metadata:', session.metadata);
  console.log('💰 Amount:', session.amount_total);
  console.log('📧 Customer email:', session.customer_email);

  try {
    // Get line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    console.log('📦 Line items:', lineItems.data.length);

    // Get customer email from multiple possible sources
    const customerEmail = session.customer_email || 
                         session.customer_details?.email || 
                         session.metadata?.userEmail;
    
    console.log('📧 Customer email:', customerEmail);

    // Send custom receipt email
    if (customerEmail && session.amount_total) {
      console.log('📧 Sending purchase receipt email to:', customerEmail);
      
      // Get customer name
      let customerName = '';
      if (session.metadata?.clerkUserId) {
        try {
          const user = await clerkClient.users.getUser(session.metadata.clerkUserId);
          customerName = user.firstName || '';
        } catch (e) {
          console.log('Could not fetch user name from Clerk');
        }
      }
      
      // Direct PDF URL (both ebooks use the same file)
      const EBOOK_PDF_URL = 'https://content.thepipedpeony.com/uploads/Ultimate_Tip_Guide_ce3a0f7f97.pdf';
      
      // Ebook product configurations
      const EBOOK_PRODUCTS = {
        'prod_SP1bz7J9np1Elf': {
          slug: 'the-ultimate-tip-guide',
          fileName: 'the-ultimate-tip-guide.pdf',
          pdfUrl: EBOOK_PDF_URL,
        },
        'prod_SGCInU8ZdnTmuW': {
          slug: 'the-caddy-book-set',
          fileName: 'the-caddy-book-set.pdf',
          pdfUrl: EBOOK_PDF_URL, // Same file as Ultimate Tip Guide
        },
      };
      
      // Note: We don't attach the PDF anymore because it's 18MB and exceeds email size limits
      // Customers can download from their My Account page instead
      const ebookAttachments = undefined; // No attachments
      
      // Check if order contains ebook products (for email content)
      let hasEbook = false;
      for (const item of lineItems.data) {
        const product = item.price?.product as Stripe.Product | undefined;
        if (product?.id && EBOOK_PRODUCTS[product.id as keyof typeof EBOOK_PRODUCTS]) {
          hasEbook = true;
          console.log('📚 Ebook detected in order:', product.id);
          break;
        }
      }
      
      if (hasEbook) {
        console.log('ℹ️  Ebook order - email will include download link (no attachment due to file size)');
      }
      
      // Format line items for email
      // Use product name from expanded product object if available, otherwise use description
      const items = lineItems.data.map(item => {
        const product = item.price?.product as Stripe.Product | undefined;
        const productName = product?.name || item.description || 'Product';
        
        // Log product details for debugging
        console.log('📦 Line item:', {
          description: item.description,
          productName: product?.name,
          productId: product?.id,
          productMetadata: product?.metadata,
        });
        
        return {
          name: productName,
          quantity: item.quantity || 1,
          price: item.amount_total ? item.amount_total / 100 : 0,
        };
      });
      
      const emailSent = await sendPurchaseReceiptEmail(
        customerEmail,
        customerName,
        {
          orderId: session.id.slice(-8).toUpperCase(),
          total: session.amount_total / 100,
          items,
        },
        ebookAttachments
      );
      
      if (emailSent) {
        console.log('✅ Purchase receipt email sent successfully');
      } else {
        console.error('❌ Failed to send purchase receipt email');
      }
    } else {
      console.log('⚠️ Skipping email - missing customer email or amount');
      console.log('   - Customer email:', customerEmail);
      console.log('   - Amount:', session.amount_total);
    }
    
    // Send invoice copy to business owner
    try {
      // Get the invoice from the session
      if (session.invoice && typeof session.invoice === 'string') {
        console.log('📧 Fetching invoice for business owner notification:', session.invoice);
        
        const invoice = await stripe.invoices.retrieve(session.invoice, {
          expand: ['lines.data', 'customer'],
        });
        
        const customer = invoice.customer as Stripe.Customer | null;
        const invCustomerName = customer && typeof customer === 'object' ? customer.name || customerName || '' : customerName || '';
        const invCustomerEmail = invoice.customer_email || customerEmail || '';
        
        // Format line items from invoice
        const invoiceItems = invoice.lines.data.map(line => ({
          description: line.description || 'Product',
          quantity: line.quantity || 1,
          amount: (line.amount / 100),
        }));
        
        // Get invoice PDF URL
        const invoicePdfUrl = invoice.invoice_pdf || '';
        const stripeDashboardUrl = `https://dashboard.stripe.com${invoice.livemode ? '' : '/test'}/invoices/${invoice.id}`;
        
        // Format payment date
        const paymentDate = invoice.status_transitions?.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
        
        await sendInvoiceCopyToOwner({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          invoicePdfUrl,
          stripeDashboardUrl,
          customerName: invCustomerName,
          customerEmail: invCustomerEmail,
          paymentDate,
          items: invoiceItems,
          subtotal: (invoice.subtotal || 0) / 100,
          tax: (invoice.tax || 0) / 100,
          total: (invoice.total || 0) / 100,
          currency: invoice.currency || 'usd',
          paymentType: 'product_purchase',
        });
      } else {
        console.log('⚠️ No invoice found on session - using session data for owner notification');
        
        // Fallback: create invoice data from session
        const stripeDashboardUrl = `https://dashboard.stripe.com${session.livemode ? '' : '/test'}/payments/${session.payment_intent}`;
        const paymentDate = new Date(session.created * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        await sendInvoiceCopyToOwner({
          invoiceId: session.id,
          invoiceNumber: null,
          invoicePdfUrl: '', // No PDF available for sessions without invoices
          stripeDashboardUrl,
          customerName: customerName || '',
          customerEmail: customerEmail || '',
          paymentDate,
          items,
          subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : session.amount_total! / 100,
          tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          total: session.amount_total! / 100,
          currency: session.currency || 'usd',
          paymentType: 'product_purchase',
        });
      }
    } catch (error: any) {
      console.error('❌ Error sending invoice copy to owner:', error);
      console.error('Error message:', error.message);
      // Don't throw - we don't want to fail the webhook if email sending fails
    }

    // Optional: Create order in Strapi
    // Uncomment this section when you create an Order content type in Strapi
    /*
    if (strapiToken) {
      const orderData = {
        data: {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          clerkUserId: session.metadata?.clerkUserId,
          customerEmail: session.customer_email,
          totalAmount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          paymentStatus: session.payment_status,
          shippingAddress: session.shipping_details?.address,
          items: lineItems.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            amount: item.amount_total ? item.amount_total / 100 : 0,
          })),
          status: 'pending',
        },
      };

      console.log('💾 Saving order to Strapi...');
      
      const response = await fetch(`${strapiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${strapiToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        console.log('✅ Order created in Strapi:', order.data.id);
      } else {
        console.error('❌ Failed to create order in Strapi:', await response.text());
      }
    }
    */

    console.log('✅ Product purchase processed successfully');
  } catch (error: any) {
    console.error('❌ Error processing product purchase:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    // Don't throw - we don't want to return 500 and have Stripe retry
    // Just log the error so we can debug
  }
}
