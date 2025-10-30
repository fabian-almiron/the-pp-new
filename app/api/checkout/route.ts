import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
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

    // Create or retrieve Stripe customer
    const userEmail = user.emailAddresses[0]?.emailAddress;
    let stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
    
    if (!stripeCustomerId && userEmail) {
      console.log('🔍 Looking for Stripe customer:', userEmail);
      
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        console.log('✅ Found existing Stripe customer:', stripeCustomerId);
        
        // Update metadata if clerkUserId is not set
        if (!customers.data[0].metadata?.clerkUserId) {
          await stripe.customers.update(stripeCustomerId, {
            metadata: { clerkUserId: user.id },
          });
        }
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          metadata: { clerkUserId: user.id },
        });
        stripeCustomerId = customer.id;
        console.log('✅ Created new Stripe customer:', stripeCustomerId);
      }
      
      // Save to Clerk metadata
      try {
        await clerkClient.users.updateUserMetadata(user.id, {
          privateMetadata: { stripeCustomerId },
        });
        console.log('✅ Saved Stripe customer ID to Clerk metadata');
      } catch (metadataError) {
        console.error('⚠️  Failed to save customer ID to Clerk:', metadataError);
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : userEmail, // Use email only if no customer ID
      client_reference_id: user.id,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ'], // Add more countries as needed
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Order from The Piped Peony`,
          footer: 'Thank you for your purchase!',
          metadata: {
            clerkUserId: user.id,
          },
        },
      },
      metadata: {
        clerkUserId: user.id,
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

