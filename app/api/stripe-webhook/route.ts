import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import { sendSubscriptionTrialEmail, sendPurchaseReceiptEmail, sendInvoiceCopyToOwner } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

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

  console.log('🔔 Stripe webhook received:', event.type);
  
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
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
    
    if (isPendingSignup && !clerkUserId) {
      console.log('🆕 Pending signup detected - creating Clerk account now...');
      console.log('📋 Session customer:', session.customer);
      console.log('📋 Customer type:', typeof session.customer);
      
      // Extract signup data from metadata
      const firstName = session.metadata?.firstName;
      const lastName = session.metadata?.lastName;
      const email = session.metadata?.email;
      const password = session.metadata?.password;
      
      if (firstName && lastName && email && password) {
        try {
          console.log('👤 Creating Clerk user:', email);
          
          // Customer was created by Stripe during checkout, so we have the customer ID
          const stripeCustomerId = session.customer as string;
          
          // Create the Clerk user NOW that payment succeeded
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
          
          // Update Stripe customer with Clerk user ID and proper name
          // (Customer was auto-created by Stripe, so now we add our metadata)
          await stripe.customers.update(stripeCustomerId, {
            name: `${firstName} ${lastName}`,
            metadata: {
              clerkUserId: clerkUserId,
              pendingSignup: 'false', // Mark as completed
            },
          });
          console.log('✅ Updated Stripe customer with name and Clerk user ID');
          
          // Update subscription with Clerk user ID
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              clerkUserId: clerkUserId,
              subscriptionName: session.metadata?.subscriptionName || 'Membership',
              pendingSignup: 'false', // Mark as completed
            },
          });
          
          console.log('✅ Updated Stripe subscription with Clerk user ID');
        } catch (error) {
          console.error('❌ Failed to create Clerk account:', error);
          // If account creation fails, we should notify the customer
          // The Stripe customer and subscription exist, but no Clerk account
          throw error;
        }
      } else {
        console.error('❌ Missing signup data in metadata:', {
          firstName: !!firstName,
          lastName: !!lastName,
          email: !!email,
          password: !!password,
        });
        throw new Error('Missing required signup data in session metadata');
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
        console.log('📧 Sending subscription trial email to:', customerEmail);
        
        // Determine trial days
        const trialDays = subscription.trial_end ? 
          Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        
        const subscriptionName = subscription.metadata?.subscriptionName || session.metadata?.subscriptionName || 'Membership';
        
        await sendSubscriptionTrialEmail(
          customerEmail,
          subscriptionName,
          trialDays
        );
      } else {
        console.log('⚠️ No customer email found, skipping email');
      }
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
