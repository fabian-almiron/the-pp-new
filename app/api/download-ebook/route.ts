import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Direct PDF URL (both ebooks use the same file)
const EBOOK_PDF_URL = 'https://content.thepipedpeony.com/uploads/Ultimate_Tip_Guide_ce3a0f7f97.pdf';

// Ebook product configurations
const EBOOKS = {
  'the-ultimate-tip-guide': {
    productId: 'prod_SP1bz7J9np1Elf',
    fileName: 'the-ultimate-tip-guide.pdf',
    pdfUrl: EBOOK_PDF_URL,
    searchTerms: ['the ultimate tip guide', 'ultimate tip guide'],
  },
  'the-caddy-book-set': {
    productId: 'prod_SGCInU8ZdnTmuW',
    fileName: 'the-caddy-book-set.pdf', 
    pdfUrl: EBOOK_PDF_URL, // Same file as Ultimate Tip Guide
    searchTerms: ['the caddy & book set', 'the caddy book set', 'caddy book set', 'caddy book', 'caddy'],
  },
};

// Fallback test PDF path (for testing when Strapi is not configured)
const TEST_EBOOK_PATH = join(process.cwd(), 'reference', 'test_ebook.pdf');

/**
 * Verify if the user has purchased a specific ebook
 */
async function verifyEbookPurchase(userId: string, ebookSlug: string, userEmail?: string): Promise<boolean> {
  try {
    const ebookConfig = EBOOKS[ebookSlug as keyof typeof EBOOKS];
    if (!ebookConfig) {
      console.error('❌ Unknown ebook slug:', ebookSlug);
      return false;
    }

    // Get Stripe customer ID from Clerk metadata
    const { createClerkClient } = await import('@clerk/nextjs/server');
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const user = await clerkClient.users.getUser(userId);
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

    let userSessions: Stripe.Checkout.Session[];

    // Method 1: Use Stripe Customer ID if available
    if (stripeCustomerId) {
      const sessions = await stripe.checkout.sessions.list({
        customer: stripeCustomerId,
        limit: 100,
      });
      
      userSessions = sessions.data.filter(session => 
        session.mode === 'payment' && session.payment_status === 'paid'
      );
    } 
    // Method 2: Fallback to email matching
    else if (userEmail) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });
      
      userSessions = sessions.data.filter(session => 
        session.customer_email === userEmail &&
        session.mode === 'payment' &&
        session.payment_status === 'paid'
      );
    } else {
      return false;
    }

    // Check if any order contains the ebook
    for (const session of userSessions) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product'],
      });

      for (const item of lineItems.data) {
        const product = item.price?.product as Stripe.Product | undefined;
        const description = item.description?.toLowerCase() || '';
        
        // Log for debugging
        console.log('🔍 Checking line item:', {
          description: item.description,
          productName: product?.name,
          productId: product?.id,
          productMetadata: product?.metadata,
        });
        
        // Check by product ID (most reliable)
        if (product?.id === ebookConfig.productId) {
          console.log('✅ User has purchased ebook by product ID:', product.id);
          return true;
        }
        
        // Check by product name or metadata
        if (product) {
          const productName = product.name?.toLowerCase() || '';
          const productSlug = product.metadata?.slug || '';
          
          // Check if this matches any of the search terms
          const matchesSearchTerm = ebookConfig.searchTerms.some(term => 
            productName.includes(term.toLowerCase())
          );
          
          if (matchesSearchTerm || productSlug === ebookSlug) {
            console.log('✅ User has purchased ebook (by product name/metadata):', product.id);
            return true;
          }
        }
        
        // Also check description as fallback
        const matchesDescription = ebookConfig.searchTerms.some(term => 
          description.includes(term.toLowerCase())
        );
        
        if (matchesDescription) {
          console.log('✅ User has purchased ebook (via description):', item.description);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error verifying ebook purchase:', error);
    return false;
  }
}

/**
 * Get ebook file URL - uses direct PDF URL from configuration
 */
async function getEbookFileUrl(ebookSlug: string): Promise<string | null> {
  try {
    const ebookConfig = EBOOKS[ebookSlug as keyof typeof EBOOKS];
    if (!ebookConfig) {
      console.error('❌ Unknown ebook slug:', ebookSlug);
      return null;
    }

    // Return the direct PDF URL configured for this ebook
    console.log('✅ Using direct PDF URL:', ebookConfig.pdfUrl);
    return ebookConfig.pdfUrl;
  } catch (error) {
    console.log('ℹ️  Error getting ebook URL:', error);
    return null;
  }
}

/**
 * Get local test PDF file as fallback
 */
async function getLocalTestFile(): Promise<ArrayBuffer> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const testFilePath = path.join(process.cwd(), 'reference', 'test_ebook.pdf');
    
    const fileBuffer = fs.readFileSync(testFilePath);
    console.log('✅ Using local test PDF file');
    return fileBuffer.buffer;
  } catch (error) {
    console.error('❌ Error reading local test file:', error);
    throw new Error('Ebook file not available');
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to download the ebook.' },
        { status: 401 }
      );
    }

    // Get ebook slug from query parameter (defaults to tip guide for backward compatibility)
    const ebookSlug = request.nextUrl.searchParams.get('ebook') || 'the-ultimate-tip-guide';
    
    // Validate ebook slug
    if (!(ebookSlug in EBOOKS)) {
      return NextResponse.json(
        { error: 'Invalid ebook specified' },
        { status: 400 }
      );
    }

    const ebookConfig = EBOOKS[ebookSlug as keyof typeof EBOOKS];
    console.log('📥 Ebook download request from user:', user.id, 'for:', ebookSlug);

    // Check for test mode (development only - bypasses purchase verification)
    const isTestMode = process.env.NODE_ENV === 'development' && 
                       request.nextUrl.searchParams.get('test') === 'true';
    
    if (!isTestMode) {
      // Verify user has purchased the ebook
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const hasPurchased = await verifyEbookPurchase(user.id, ebookSlug, userEmail);

      if (!hasPurchased) {
        console.log('❌ User has not purchased ebook:', ebookSlug);
        return NextResponse.json(
          { error: 'You must purchase this ebook to download it' },
          { status: 403 }
        );
      }
    } else {
      console.log('🧪 TEST MODE: Bypassing purchase verification');
    }

    // Try to get ebook file URL from Strapi first
    const ebookUrl = await getEbookFileUrl(ebookSlug);
    let fileBuffer: ArrayBuffer;
    let contentType = 'application/pdf';
    let contentDisposition = `attachment; filename="${ebookConfig.fileName}"`;

    if (ebookUrl) {
      // Fetch the file from Strapi
      console.log('📥 Fetching ebook from Strapi:', ebookUrl);
      const fileResponse = await fetch(ebookUrl);

      if (fileResponse.ok) {
        fileBuffer = await fileResponse.arrayBuffer();
        contentType = fileResponse.headers.get('content-type') || 'application/pdf';
        const strapiDisposition = fileResponse.headers.get('content-disposition');
        if (strapiDisposition) {
          contentDisposition = strapiDisposition;
        } else {
          // Ensure the filename is correct
          contentDisposition = `attachment; filename="${ebookConfig.fileName}"`;
        }
        console.log('✅ Serving ebook file from Strapi');
      } else {
        console.log('⚠️  Strapi file fetch failed, using fallback test PDF');
        // Fallback to local test file
        fileBuffer = await getLocalTestFile();
      }
    } else {
      // Fallback to local test file if Strapi is not configured
      console.log('⚠️  Strapi not configured, using fallback test PDF');
      fileBuffer = await getLocalTestFile();
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('❌ Error downloading ebook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download ebook' },
      { status: 500 }
    );
  }
}

