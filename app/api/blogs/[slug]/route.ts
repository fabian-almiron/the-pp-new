import { NextRequest, NextResponse } from 'next/server';
import { fetchBlogBySlug } from '@/lib/strapi-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { data: null, error: 'Blog slug is required' },
        { status: 400 }
      );
    }

    const data = await fetchBlogBySlug(slug);

    if (!data) {
      return NextResponse.json(
        { data: null, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

