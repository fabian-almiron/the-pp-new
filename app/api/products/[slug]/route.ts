import { NextRequest, NextResponse } from 'next/server';
import { fetchProductBySlug } from '@/lib/strapi-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { data: null, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    const { data, error } = await fetchProductBySlug(slug);

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: error || 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

