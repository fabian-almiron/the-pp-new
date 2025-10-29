import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const strapiToken = process.env.STRAPI_API_TOKEN; // You'll need to add this to your .env.local

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
    await createOrUpdateUserSubscription(subscription, 'active');
    
    // Update user role to Subscriber
    const strapiUserId = session.metadata?.strapiUserId;
    const clerkUserId = session.metadata?.clerkUserId;
    console.log('👤 Strapi User ID from metadata:', strapiUserId);
    console.log('👤 Clerk User ID from metadata:', clerkUserId);
    
    if (strapiUserId) {
      console.log('🔄 Updating user role to Subscriber in Strapi...');
      await updateUserRole(strapiUserId, 'Subscriber');
      console.log('✅ Strapi user role update completed');
    } else {
      console.error('❌ No strapiUserId found in session metadata');
    }

    if (clerkUserId) {
      console.log('🔄 Updating user role to subscriber in Clerk...');
      await updateClerkUserRole(clerkUserId, 'subscriber');
      console.log('✅ Clerk user role update completed');
    } else {
      console.error('❌ No clerkUserId found in session metadata');
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  await createOrUpdateUserSubscription(subscription, subscription.status);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await createOrUpdateUserSubscription(subscription, subscription.status);
  
  // Update user role based on subscription status
  const strapiUserId = subscription.metadata?.strapiUserId;
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (strapiUserId || clerkUserId) {
    const isActive = ['active', 'trialing'].includes(subscription.status);
    const strapiRole = isActive ? 'Subscriber' : 'Customer';
    const clerkRole = isActive ? 'subscriber' : 'customer';
    
    if (strapiUserId) {
      await updateUserRole(strapiUserId, strapiRole);
    }
    
    if (clerkUserId) {
      await updateClerkUserRole(clerkUserId, clerkRole);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await createOrUpdateUserSubscription(subscription, 'canceled');
  
  // Downgrade user role to Customer
  const strapiUserId = subscription.metadata?.strapiUserId;
  const clerkUserId = subscription.metadata?.clerkUserId;
  
  if (strapiUserId) {
    await updateUserRole(strapiUserId, 'Customer');
  }
  
  if (clerkUserId) {
    await updateClerkUserRole(clerkUserId, 'customer');
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await createOrUpdateUserSubscription(subscription, subscription.status);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await createOrUpdateUserSubscription(subscription, subscription.status);
    
    // Downgrade user role if payment failed
    const strapiUserId = subscription.metadata?.strapiUserId;
    if (strapiUserId && subscription.status === 'past_due') {
      await updateUserRole(strapiUserId, 'Customer');
    }
  }
}

async function createOrUpdateUserSubscription(stripeSubscription: Stripe.Subscription, status: string) {
  const strapiUserId = stripeSubscription.metadata?.strapiUserId;
  const strapiSubscriptionId = stripeSubscription.metadata?.strapiSubscriptionId;
  
  if (!strapiUserId || !strapiSubscriptionId) {
    console.error('Missing metadata in subscription:', stripeSubscription.id);
    return;
  }

  // Check if user subscription already exists
  const existingResponse = await fetch(
    `${strapiUrl}/api/usersubscriptions?filters[stripeSubscriptionId][$eq]=${stripeSubscription.id}`,
    {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const subscriptionData = {
    user: strapiUserId,
    subscription: strapiSubscriptionId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: stripeSubscription.customer as string,
    status: status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
    trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
    canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
    endedAt: stripeSubscription.ended_at ? new Date(stripeSubscription.ended_at * 1000).toISOString() : null,
  };

  if (existingResponse.ok) {
    const { data: existingSubscriptions } = await existingResponse.json();
    
    if (existingSubscriptions.length > 0) {
      // Update existing subscription
      const existingId = existingSubscriptions[0].id;
      await fetch(`${strapiUrl}/api/usersubscriptions/${existingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: subscriptionData }),
      });
    } else {
      // Create new subscription
      await fetch(`${strapiUrl}/api/usersubscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: subscriptionData }),
      });
    }
  }
}

async function updateUserRole(strapiUserId: string, roleName: string) {
  try {
    console.log(`🔍 Updating user ${strapiUserId} to role ${roleName}`);
    
    // Get the role ID by name
    const rolesResponse = await fetch(`${strapiUrl}/api/users-permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
      },
    });
    
    if (!rolesResponse.ok) {
      console.error('❌ Failed to fetch roles:', rolesResponse.status);
      return;
    }
    
    const { roles } = await rolesResponse.json();
    const role = roles.find((r: any) => r.name === roleName);
    
    if (!role) {
      console.error(`❌ Role ${roleName} not found. Available roles:`, roles.map((r: any) => r.name));
      return;
    }

    console.log(`✅ Found role ${roleName} with ID:`, role.id);

    // Update user role
    const updateResponse = await fetch(`${strapiUrl}/api/users/${strapiUserId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: role.id,
      }),
    });

    if (updateResponse.ok) {
      console.log(`✅ Successfully updated user ${strapiUserId} to ${roleName}`);
    } else {
      console.error(`❌ Failed to update user role:`, updateResponse.status, await updateResponse.text());
    }
  } catch (error) {
    console.error('❌ Error updating user role:', error);
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
