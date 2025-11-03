import { NextRequest, NextResponse } from 'next/server';
import { fetchMenu } from '@/lib/strapi-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Menu slug is required' },
        { status: 400 }
      );
    }

    const { data, error } = await fetchMenu(slug);

    if (error || !data) {
      return NextResponse.json(
        { error: error || 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

