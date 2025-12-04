import { NextRequest, NextResponse } from 'next/server';
import { searchCourses, fetchRecipes, fetchProducts, fetchBlogs } from '@/lib/strapi-api';

// Helper function to strip HTML tags and clean text
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Truncate to reasonable length for preview
  if (text.length > 150) {
    text = text.substring(0, 150) + '...';
  }
  
  return text;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [], error: null });
    }

    const trimmedQuery = query.trim();

    // Use Strapi's search for courses, then filter others
    const [coursesResult, recipesData, productsResult, blogsData] = await Promise.all([
      searchCourses(trimmedQuery),
      fetchRecipes(),
      fetchProducts(),
      fetchBlogs(),
    ]);

    const allResults: any[] = [];

    // Add courses from Strapi search
    if (coursesResult.data) {
      const courseResults = coursesResult.data.map((course: any) => {
        console.log('Course image data:', {
          title: course.title,
          featuredImage: course.featuredImage,
          imageUrl: course.featuredImage?.url
        });
        return {
          type: 'course',
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: stripHtml(course.excerpt || course.content),
          image: course.featuredImage?.url,
          series: course.series,
        };
      });
      allResults.push(...courseResults);
    }

    // Filter recipes
    if (recipesData && Array.isArray(recipesData)) {
      const recipeResults = recipesData
        .filter((recipe: any) =>
          recipe.title?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          recipe.excerpt?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          recipe.shortDescription?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          recipe.category?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          recipe.categories?.some((cat: string) => cat?.toLowerCase().includes(trimmedQuery.toLowerCase()))
        )
        .map((recipe: any) => ({
          type: 'recipe',
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          description: stripHtml(recipe.excerpt || recipe.shortDescription),
          image: recipe.coverImage?.url || recipe.featuredImage?.url,
        }));
      allResults.push(...recipeResults);
    }

    // Filter products
    if (productsResult.data) {
      const productResults = productsResult.data
        .filter((product: any) =>
          product.name?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          product.longDescription?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          product.shortDescription?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(trimmedQuery.toLowerCase())
        )
        .map((product: any) => ({
          type: 'product',
          id: product.id,
          title: product.name,
          slug: product.slug,
          description: stripHtml(product.shortDescription),
          image: product.images?.[0]?.src,
          price: product.price,
        }));
      allResults.push(...productResults);
    }

    // Filter blogs
    if (blogsData && Array.isArray(blogsData)) {
      const blogResults = blogsData
        .filter((blog: any) =>
          blog.title?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          blog.content?.toLowerCase().includes(trimmedQuery.toLowerCase())
        )
        .map((blog: any) => ({
          type: 'blog',
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          description: stripHtml(blog.excerpt),
          image: blog.coverImage?.url,
        }));
      allResults.push(...blogResults);
    }

    // Limit results
    const limitedResults = allResults.slice(0, 20);

    return NextResponse.json({ data: limitedResults, error: null });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { data: [], error: 'Search failed' },
      { status: 500 }
    );
  }
}
