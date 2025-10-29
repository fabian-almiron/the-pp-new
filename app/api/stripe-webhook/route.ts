import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';

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
  console.log('🔍 Checkout session metadata:', session.metadata);
  
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Update Clerk user role to Subscriber
    const clerkUserId = session.metadata?.clerkUserId;
    console.log('👤 Clerk User ID from metadata:', clerkUserId);
    
    if (clerkUserId) {
      console.log('🔄 Updating user role to Subscriber in Clerk...');
      await updateClerkUserRole(clerkUserId, 'Subscriber');
      console.log('✅ Clerk user role update completed');
    } else {
      console.error('❌ No clerkUserId found in session metadata');
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription created:', subscription.id);
  // Update Clerk role if needed
  const clerkUserId = subscription.metadata?.clerkUserId;
  if (clerkUserId && ['active', 'trialing'].includes(subscription.status)) {
    await updateClerkUserRole(clerkUserId, 'Subscriber');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id, 'Status:', subscription.status);
  
  // Update Clerk user role based on subscription status
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (clerkUserId) {
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const role = isActive ? 'Subscriber' : 'Customer';
    await updateClerkUserRole(clerkUserId, role);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  // Downgrade Clerk user role to Customer
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (clerkUserId) {
    await updateClerkUserRole(clerkUserId, 'Customer');
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Invoice payment succeeded:', invoice.id);
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const clerkUserId = subscription.metadata?.clerkUserId;
    
    if (clerkUserId && ['active', 'trialing'].includes(subscription.status)) {
      await updateClerkUserRole(clerkUserId, 'Subscriber');
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Downgrade Clerk user role if payment failed
    const clerkUserId = subscription.metadata?.clerkUserId;
    if (clerkUserId && subscription.status === 'past_due') {
      await updateClerkUserRole(clerkUserId, 'Customer');
    }
  }
}


async function updateClerkUserRole(clerkUserId: string, role: 'Customer' | 'Subscriber') {
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
    // Only handle invoices from checkout sessions (not subscription invoices)
    if (invoice.billing_reason === 'manual') {
      console.log('📧 Finalizing and sending invoice:', invoice.id);
      
      // Finalize the invoice (makes it ready to send)
      if (invoice.status === 'draft') {
        await stripe.invoices.finalizeInvoice(invoice.id);
      }
      
      // Send the invoice email to the customer
      await stripe.invoices.sendInvoice(invoice.id);
      
      console.log('✅ Invoice sent successfully to:', invoice.customer_email);
    }
  } catch (error) {
    console.error('❌ Error sending invoice:', error);
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

    // Optional: Create order in Strapi
    // Uncomment this section when you create an Order content type in Strapi
    /*
    if (strapiToken) {
      const orderData = {
        data: {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          clerkUserId: session.metadata?.clerkUserId,
          strapiUserId: session.metadata?.strapiUserId ? parseInt(session.metadata.strapiUserId) : null,
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
    console.log('📧 TODO: Send order confirmation email to:', session.customer_email);
  } catch (error) {
    console.error('❌ Error processing product purchase:', error);
    throw error;
  }
}
