import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Strapi by Clerk ID
    const userResponse = await fetch(`${strapiUrl}/api/users?filters[clerkId][$eq]=${userId}`);
    
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found in Strapi' }, { status: 404 });
    }

    const strapiUser = users[0];

    // Get user's active subscriptions
    const subscriptionsResponse = await fetch(
      `${strapiUrl}/api/usersubscriptions?filters[user][id][$eq]=${strapiUser.id}&filters[status][$in][0]=active&filters[status][$in][1]=trialing&populate=subscription`
    );

    if (!subscriptionsResponse.ok) {
      return NextResponse.json({ 
        hasActiveSubscription: false,
        subscriptions: [],
        userRole: strapiUser.role?.name || 'Customer'
      });
    }

    const { data: subscriptions } = await subscriptionsResponse.json();
    
    // Check if any subscription is currently active
    const hasActiveSubscription = subscriptions.some((sub: any) => {
      const now = new Date();
      const periodEnd = new Date(sub.currentPeriodEnd);
      return ['active', 'trialing'].includes(sub.status) && periodEnd > now;
    });

    return NextResponse.json({
      hasActiveSubscription,
      subscriptions: subscriptions.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        subscription: sub.subscription,
      })),
      userRole: strapiUser.role?.name || 'Customer',
    });
  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
