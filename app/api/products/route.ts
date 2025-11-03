import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/strapi-api';

export async function GET() {
  try {
    const { data, error } = await fetchProducts();

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: error || 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

