import { NextResponse } from 'next/server';
import { fetchRecipes } from '@/lib/strapi-api';

export async function GET() {
  try {
    const recipes = await fetchRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

