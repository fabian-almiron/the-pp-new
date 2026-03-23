import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

/** Comma-separated Stripe Price IDs ($15 / grandfathered plan). New signups use the new price and must not match. */
function parseLegacyPriceIds(): Set<string> {
  const raw = process.env.LEGACY_SUBSCRIPTION_STRIPE_PRICE_IDS ?? '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

/**
 * Returns whether the signed-in user should see the legacy price-increase banner:
 * they have an active or trialing subscription whose line item uses a legacy Price ID.
 */
export async function GET() {
  const legacyIds = parseLegacyPriceIds();
  if (legacyIds.size === 0) {
    return NextResponse.json({ eligible: false });
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      const userEmail = user.emailAddresses[0]?.emailAddress;
      if (!userEmail) {
        return NextResponse.json({ eligible: false });
      }

      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json({ eligible: false });
      }

      stripeCustomerId = customers.data[0].id;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 20,
    });

    for (const sub of subscriptions.data) {
      if (sub.status !== 'active' && sub.status !== 'trialing') {
        continue;
      }

      for (const item of sub.items.data) {
        const priceId =
          typeof item.price === 'string' ? item.price : item.price.id;
        if (legacyIds.has(priceId)) {
          return NextResponse.json({ eligible: true });
        }
      }
    }

    return NextResponse.json({ eligible: false });
  } catch (error) {
    console.error('subscriber-legacy-pricing-notice-eligible:', error);
    return NextResponse.json({ eligible: false });
  }
}
