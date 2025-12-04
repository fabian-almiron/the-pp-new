import { NextResponse } from 'next/server';
import { fetchRecipes } from '@/lib/strapi-api';

export async function GET() {
  try {
    const recipes = await fetchRecipes();
    return NextResponse.json({ data: recipes, error: null });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

