import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(request: NextRequest) {
  try {
    // Get the logged-in user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('📦 Fetching orders for user:', user.id);

    // Get Stripe customer ID from Clerk metadata
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      console.log('⚠️  No email address found for user');
      return NextResponse.json({ orders: [] });
    }

    let userSessions: Stripe.Checkout.Session[] = [];

    // Method 1: Use Stripe Customer ID if available (most reliable)
    if (stripeCustomerId) {
      console.log('✅ Using Stripe Customer ID:', stripeCustomerId);
      
      try {
        // First verify the customer exists
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        
        if (customer.deleted) {
          console.log('⚠️  Stripe customer was deleted, clearing from metadata');
          // Customer was deleted, clear from metadata and fall back to email
          const { createClerkClient } = await import('@clerk/nextjs/server');
          const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
          });
          
          await clerkClient.users.updateUserMetadata(user.id, {
            privateMetadata: {
              stripeCustomerId: null,
            },
          });
          
          // Fall through to email method
        } else {
          const sessions = await stripe.checkout.sessions.list({
            customer: stripeCustomerId,
            limit: 100,
          });
          
          console.log(`📊 Found ${sessions.data.length} total sessions for customer`);
          
          // Filter for both payment and subscription modes
          userSessions = sessions.data.filter(session => {
            const isPayment = session.mode === 'payment' && session.payment_status === 'paid';
            const isSubscription = session.mode === 'subscription' && session.payment_status === 'paid';
            return isPayment || isSubscription;
          });
          
          console.log(`💳 Payment sessions: ${sessions.data.filter(s => s.mode === 'payment').length}`);
          console.log(`📅 Subscription sessions: ${sessions.data.filter(s => s.mode === 'subscription').length}`);
          console.log(`✅ Paid sessions: ${userSessions.length}`);
        }
      } catch (error: any) {
        console.error('⚠️  Error fetching customer sessions:', error.message);
        // If customer not found or other error, fall back to email method
        if (error.code === 'resource_missing') {
          console.log('⚠️  Customer not found in Stripe, clearing from metadata');
          const { createClerkClient } = await import('@clerk/nextjs/server');
          const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
          });
          
          await clerkClient.users.updateUserMetadata(user.id, {
            privateMetadata: {
              stripeCustomerId: null,
            },
          });
        }
        // Fall through to email method
      }
    }
    
    // Method 2: Fallback to email matching (for users not yet migrated or if customer lookup failed)
    if (userSessions.length === 0) {
      console.log('⚠️  No sessions found via customer ID, trying email fallback:', userEmail);
      
      try {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
        });
        
        userSessions = sessions.data.filter(session => {
          const emailMatches = session.customer_email === userEmail;
          const isPayment = session.mode === 'payment' && session.payment_status === 'paid';
          const isSubscription = session.mode === 'subscription' && session.payment_status === 'paid';
          return emailMatches && (isPayment || isSubscription);
        });
        
        console.log(`📧 Found ${userSessions.length} sessions via email matching`);
        
        // If we found sessions and a customer, save the customer ID for next time
        if (userSessions.length > 0 && userSessions[0].customer) {
          try {
            const { createClerkClient } = await import('@clerk/nextjs/server');
            const clerkClient = createClerkClient({
              secretKey: process.env.CLERK_SECRET_KEY!,
            });
            
            await clerkClient.users.updateUserMetadata(user.id, {
              privateMetadata: {
                stripeCustomerId: userSessions[0].customer as string,
              },
            });
            console.log('✅ Auto-saved Stripe Customer ID:', userSessions[0].customer);
          } catch (error) {
            console.error('⚠️  Could not save customer ID:', error);
          }
        }
      } catch (error: any) {
        console.error('⚠️  Error fetching sessions via email:', error.message);
        // Continue with empty sessions array
      }
    }

    console.log(`✅ Found ${userSessions.length} orders`);

    // If no sessions found, return empty array
    if (userSessions.length === 0) {
      console.log('ℹ️  No orders found for this user');
      return NextResponse.json({ orders: [] });
    }

    // Get detailed info for each order
    const orders = await Promise.all(
      userSessions.map(async (session) => {
        try {
          // Get line items
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product'],
          });

          // Get payment method details
          let paymentMethod = null;
          if (session.payment_intent) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                session.payment_intent as string
              );
              
              if (paymentIntent.payment_method) {
                const pm = await stripe.paymentMethods.retrieve(
                  paymentIntent.payment_method as string
                );
                
                if (pm.card) {
                  paymentMethod = {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                  };
                }
              }
            } catch (pmError) {
              console.error('⚠️  Error fetching payment method:', pmError);
              // Continue without payment method details
            }
          }

          return {
            id: session.id,
            date: new Date(session.created * 1000),
            total: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            status: session.payment_status,
            items: lineItems.data.map(item => ({
              name: item.description,
              quantity: item.quantity,
              amount: item.amount_total ? item.amount_total / 100 : 0,
            })),
            shipping: session.shipping_details?.address,
            paymentMethod,
          };
        } catch (error: any) {
          console.error('⚠️  Error fetching order details for session:', session.id, error.message);
          // Return a basic order object without details
          return {
            id: session.id,
            date: new Date(session.created * 1000),
            total: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            status: session.payment_status,
            items: [{ name: 'Order details unavailable', quantity: 1, amount: 0 }],
            shipping: session.shipping_details?.address || null,
            paymentMethod: null,
          };
        }
      })
    );

    // Filter out any null orders (shouldn't happen now, but keep as safeguard)
    const validOrders = orders.filter(order => order !== null);

    // Sort by date (newest first)
    validOrders.sort((a, b) => b!.date.getTime() - a!.date.getTime());

    console.log(`✅ Returning ${validOrders.length} orders to client`);
    
    return NextResponse.json({ orders: validOrders });
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
