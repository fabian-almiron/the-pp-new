import { MetadataRoute } from 'next';
import { fetchCourses, fetchProducts, fetchRecipes, fetchBlogs } from '@/lib/strapi-api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thepipedpeony.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/meet-dara`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/video-library`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic course pages
  let courseSitemaps: MetadataRoute.Sitemap = [];
  try {
    const { data: courses } = await fetchCourses({ pageSize: 1000 });
    if (courses) {
      courseSitemaps = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: new Date(course.updatedAt || course.publishedAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  // Dynamic product pages
  let productSitemaps: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await fetchProducts();
    if (products) {
      productSitemaps = products.map((product) => ({
        url: `${baseUrl}/shop/item/${product.slug}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Dynamic recipe pages
  let recipeSitemaps: MetadataRoute.Sitemap = [];
  try {
    const recipes = await fetchRecipes();
    if (recipes) {
      recipeSitemaps = recipes.map((recipe) => ({
        url: `${baseUrl}/recipes/${recipe.slug}`,
        lastModified: new Date(recipe.updatedAt || recipe.publishedAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching recipes for sitemap:', error);
  }

  // Dynamic blog pages
  let blogSitemaps: MetadataRoute.Sitemap = [];
  try {
    const blogs = await fetchBlogs();
    if (blogs) {
      blogSitemaps = blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.publishedAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  return [
    ...staticPages,
    ...courseSitemaps,
    ...productSitemaps,
    ...recipeSitemaps,
    ...blogSitemaps,
  ];
}

