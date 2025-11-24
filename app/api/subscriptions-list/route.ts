import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;
    const url = `${strapiUrl}/api/subscriptions?filters[active][$eq]=true&populate=*`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization if token exists
    if (strapiToken) {
      headers['Authorization'] = `Bearer ${strapiToken}`;
    }
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: data },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      subscriptions: data.data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

