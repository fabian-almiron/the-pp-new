import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Get the logged-in user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🛒 Creating checkout session for user:', user.id);
    console.log('📦 Items:', items.length);

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create line items for Stripe
    const lineItems = items.map((item: any) => {
      console.log('Processing item:', item.name, {
        stripePriceId: item.stripePriceId,
        price: item.price,
        quantity: item.quantity,
      });

      // If product has a Stripe Price ID, use it (preferred)
      if (item.stripePriceId) {
        return {
          price: item.stripePriceId,
          quantity: item.quantity,
        };
      }

      // Otherwise, create price dynamically
      const description = [
        item.selectedHand && `Hand: ${item.selectedHand}`,
        item.selectedSize && `Size: ${item.selectedSize}`,
        item.selectedColor && `Color: ${item.selectedColor}`
      ].filter(Boolean).join(', ');

      // Validate and format image URL
      let imageUrl = '';
      if (item.image) {
        try {
          // If it's already a full URL, use it
          if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
            imageUrl = item.image;
          } 
          // If it's a Strapi URL path, construct full URL
          else if (item.image.startsWith('/uploads/')) {
            imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}${item.image}`;
          }
          // If it's a relative path, construct full URL from origin
          else if (item.image.startsWith('/')) {
            imageUrl = `${origin}${item.image}`;
          }
          
          // Validate it's a proper URL
          new URL(imageUrl);
        } catch (e) {
          console.warn('Invalid image URL, skipping:', item.image);
          imageUrl = '';
        }
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: description || undefined,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              product_id: item.id?.toString() || '',
              sku: item.sku || '',
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Fetch user from Strapi using Clerk ID
    const strapiUser = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    }).then(res => res.json());

    const strapiUserId = strapiUser[0]?.id;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: user.emailAddresses[0]?.emailAddress,
      client_reference_id: user.id,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ'], // Add more countries as needed
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        clerkUserId: user.id,
        strapiUserId: strapiUserId?.toString() || '',
        userEmail: user.emailAddresses[0]?.emailAddress || '',
      },
    });

    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

