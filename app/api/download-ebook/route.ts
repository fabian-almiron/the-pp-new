import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const EBOOK_SLUG = 'the-ultimate-tip-guide'; // Product slug

// Ebook file ID in Strapi Media Library
// Can be overridden via STRAPI_EBOOK_FILE_ID environment variable
const EBOOK_FILE_ID = process.env.STRAPI_EBOOK_FILE_ID || '386';

// Fallback test PDF path (for testing when Strapi is not configured)
const TEST_EBOOK_PATH = join(process.cwd(), 'reference', 'test_ebook.pdf');

/**
 * Verify if the user has purchased the ebook
 */
async function verifyEbookPurchase(userId: string, userEmail?: string): Promise<boolean> {
  try {
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
        
        // Check by product name or metadata
        if (product) {
          const productName = product.name?.toLowerCase() || '';
          const productSlug = product.metadata?.slug || '';
          
          // Check if this is the ebook product
          if (
            productName.includes('the ultimate tip guide') ||
            productName.includes('ultimate tip guide') ||
            productSlug === EBOOK_SLUG ||
            product.metadata?.slug === EBOOK_SLUG
          ) {
            console.log('✅ User has purchased ebook (by product name/metadata):', product.id);
            return true;
          }
        }
        
        // Also check description as fallback
        if (description.includes('the ultimate tip guide') || description.includes('ultimate tip guide')) {
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
 * Get ebook file URL from Strapi Media Library
 * Option 1: Use file ID directly (recommended - simpler)
 * Option 2: Search by filename in Media Library (fallback)
 */
async function getEbookFileUrl(): Promise<string | null> {
  try {
    // Method 1: Use file ID if configured (fastest and most reliable)
    if (EBOOK_FILE_ID) {
      const fileUrl = `${STRAPI_URL}/api/upload/files/${EBOOK_FILE_ID}`;
      console.log('📥 Fetching ebook from Strapi Media Library by ID:', EBOOK_FILE_ID);
      
      // Verify file exists
      const checkResponse = await fetch(fileUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.STRAPI_API_TOKEN && {
            'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
          }),
        },
        cache: 'no-store',
      });

      if (checkResponse.ok) {
        const fileData = await checkResponse.json();
        // Construct the actual file URL (not the API endpoint)
        const actualFileUrl = fileData.url?.startsWith('http') 
          ? fileData.url 
          : `${STRAPI_URL}${fileData.url}`;
        console.log('✅ Found ebook file in Strapi Media Library');
        return actualFileUrl;
      }
    }

    // Method 2: Search Media Library by filename (fallback if no ID configured)
    console.log('🔍 Searching Strapi Media Library for ebook file...');
    
    // Try searching with "The Ultimate Tip Guide" first (actual product name)
    const searchUrl = `${STRAPI_URL}/api/upload/files?filters[name][$contains]=The Ultimate Tip Guide&filters[ext][$eq]=pdf`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      
      // Strapi returns array of files
      if (data && Array.isArray(data) && data.length > 0) {
        // Use the first matching file
        const file = data[0];
        const fileUrl = file.url?.startsWith('http') 
          ? file.url 
          : `${STRAPI_URL}${file.url}`;
        console.log('✅ Found ebook file in Strapi Media Library:', file.name);
        return fileUrl;
      }
    }

    // Also try searching with "ultimate tip guide" (case-insensitive variant)
    const searchUrl2 = `${STRAPI_URL}/api/upload/files?filters[name][$contains]=ultimate tip guide&filters[ext][$eq]=pdf`;
    const response2 = await fetch(searchUrl2, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      cache: 'no-store',
    });

    if (response2.ok) {
      const data2 = await response2.json();
      if (data2 && Array.isArray(data2) && data2.length > 0) {
        const file = data2[0];
        const fileUrl = file.url?.startsWith('http') 
          ? file.url 
          : `${STRAPI_URL}${file.url}`;
        console.log('✅ Found ebook file in Strapi Media Library (by "ultimate tip guide"):', file.name);
        return fileUrl;
      }
    }

    // Also try searching with "the-ultimate-tip-guide" (product slug)
    const searchUrl3 = `${STRAPI_URL}/api/upload/files?filters[name][$contains]=the-ultimate-tip-guide&filters[ext][$eq]=pdf`;
    const response3 = await fetch(searchUrl3, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      cache: 'no-store',
    });

    if (response3.ok) {
      const data3 = await response3.json();
      if (data3 && Array.isArray(data3) && data3.length > 0) {
        const file = data3[0];
        const fileUrl = file.url?.startsWith('http') 
          ? file.url 
          : `${STRAPI_URL}${file.url}`;
        console.log('✅ Found ebook file in Strapi Media Library (by "the-ultimate-tip-guide"):', file.name);
        return fileUrl;
      }
    }

    // Also try searching with "ebook" keyword as final fallback
    const searchUrl4 = `${STRAPI_URL}/api/upload/files?filters[name][$contains]=ebook&filters[ext][$eq]=pdf`;
    const response4 = await fetch(searchUrl4, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      cache: 'no-store',
    });

    if (response4.ok) {
      const data4 = await response4.json();
      if (data4 && Array.isArray(data4) && data4.length > 0) {
        const file = data4[0];
        const fileUrl = file.url?.startsWith('http') 
          ? file.url 
          : `${STRAPI_URL}${file.url}`;
        console.log('✅ Found ebook file in Strapi Media Library (by "ebook" keyword):', file.name);
        return fileUrl;
      }
    }

    console.log('ℹ️  Ebook file not found in Strapi Media Library, will use fallback');
    return null;
  } catch (error) {
    console.log('ℹ️  Error fetching ebook from Strapi Media Library (will use fallback):', error);
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

    console.log('📥 Ebook download request from user:', user.id);

    // Check for test mode (development only - bypasses purchase verification)
    const isTestMode = process.env.NODE_ENV === 'development' && 
                       request.nextUrl.searchParams.get('test') === 'true';
    
    if (!isTestMode) {
      // Verify user has purchased the ebook
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const hasPurchased = await verifyEbookPurchase(user.id, userEmail);

      if (!hasPurchased) {
        console.log('❌ User has not purchased ebook');
        return NextResponse.json(
          { error: 'You must purchase the ebook to download it' },
          { status: 403 }
        );
      }
    } else {
      console.log('🧪 TEST MODE: Bypassing purchase verification');
    }

    // Try to get ebook file URL from Strapi first
    const ebookUrl = await getEbookFileUrl();
    let fileBuffer: ArrayBuffer;
    let contentType = 'application/pdf';
    let contentDisposition = 'attachment; filename="the-ultimate-tip-guide.pdf"';

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

