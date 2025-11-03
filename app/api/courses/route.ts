import { NextRequest, NextResponse } from 'next/server';
import { fetchCourses } from '@/lib/strapi-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const sort = searchParams.get('sort') || 'title:asc';

    const { data, error } = await fetchCourses({ page, pageSize, sort });

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: error || 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

