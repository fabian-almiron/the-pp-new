import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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

    // Get all checkout sessions for this user
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    });

    // Filter sessions by user email and payment mode
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userSessions = sessions.data.filter(session => 
      session.customer_email === userEmail && 
      session.mode === 'payment' && 
      session.payment_status === 'paid'
    );

    console.log(`✅ Found ${userSessions.length} orders`);

    // Get detailed info for each order
    const orders = await Promise.all(
      userSessions.map(async (session) => {
        try {
          // Get line items
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product'],
          });

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
          };
        } catch (error) {
          console.error('Error fetching order details:', error);
          return null;
        }
      })
    );

    // Filter out any failed orders
    const validOrders = orders.filter(order => order !== null);

    // Sort by date (newest first)
    validOrders.sort((a, b) => b!.date.getTime() - a!.date.getTime());

    return NextResponse.json({ orders: validOrders });
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
