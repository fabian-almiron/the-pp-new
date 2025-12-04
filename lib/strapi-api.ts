import { Product, MockDatabaseResponse, GalleryImage, StrapiCourse, VideoChapter, ProductTab, AccordionItem } from '@/data/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Blog Types
export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: {
    url: string;
    alternativeText?: string;
  };
  author: string;
  featured: boolean;
  tags?: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiBlog {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: StrapiImage;
  author: string;
  featured: boolean;
  tags?: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiBlogResponse {
  data: StrapiBlog[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Strapi Product Interface (matches your Strapi schema)
interface StrapiImage {
  id: number;
  url: string;
  alternativeText?: string;
  width: number;
  height: number;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  description?: string;
  price: number;
  slug: string;
  stock: number;
  featured: boolean;
  sku?: string;
  image?: StrapiImage;
  gallery?: StrapiImage[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  // New Stripe fields
  stripeProductId?: string;
  stripePriceId?: string;
  hasVariations?: boolean;
  variations?: {
    type: string;
    options: Array<{
      name: string;
      stripePriceId: string;
      stripeProductId: string;
      price: number;
      hand?: string;
      tuning?: string;
      size?: string;
      color?: string;
    }>;
  };
  // Product tabs (nested structure)
  productTabs?: Array<{
    id: number;
    title: string;
    content?: string;
    isActive: boolean;
    order: number;
    displayType: 'content_only' | 'accordion_only' | 'content_and_accordion';
    accordionItems: Array<{
      id: number;
      title: string;
      content: string;
      isExpanded: boolean;
      order: number;
    }>;
  }>;
}

interface StrapiResponse {
  data: StrapiProduct[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Convert Strapi product to frontend Product format
function convertStrapiProduct(strapiProduct: StrapiProduct): Product {
  // Convert gallery images
  const images: GalleryImage[] = [];
  
  if (strapiProduct.image) {
    // Check if URL is already absolute (Strapi Cloud) or relative (local Strapi)
    const imageUrl = strapiProduct.image.url.startsWith('http') 
      ? strapiProduct.image.url 
      : `${STRAPI_URL}${strapiProduct.image.url}`;
    
    images.push({
      src: imageUrl,
      alt: strapiProduct.image.alternativeText || strapiProduct.name
    });
  }
  
  if (strapiProduct.gallery && strapiProduct.gallery.length > 0) {
    strapiProduct.gallery.forEach(img => {
      // Check if URL is already absolute (Strapi Cloud) or relative (local Strapi)
      const imageUrl = img.url.startsWith('http') 
        ? img.url 
        : `${STRAPI_URL}${img.url}`;
      
      images.push({
        src: imageUrl,
        alt: img.alternativeText || strapiProduct.name
      });
    });
  }
  
  // If no images, use placeholder
  if (images.length === 0) {
    images.push({
      src: '/placeholder.svg',
      alt: strapiProduct.name
    });
  }

  return {
    id: strapiProduct.id,
    slug: strapiProduct.slug || `product-${strapiProduct.documentId}`,
    name: strapiProduct.name,
    price: strapiProduct.price,
    images,
    shortDescription: strapiProduct.description?.substring(0, 150) + '...' || '',
    longDescription: strapiProduct.description || '',
    category: strapiProduct.category?.slug || 'piping-tips',
    inStock: strapiProduct.stock > 0,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [],
      tipCategories: []
    },
    // New Stripe fields
    hasVariations: strapiProduct.hasVariations || false,
    variations: strapiProduct.variations || undefined,
    stripeProductId: strapiProduct.stripeProductId || undefined,
    stripePriceId: strapiProduct.stripePriceId || undefined,
    // Product tabs (nested structure)
    productTabs: strapiProduct.productTabs ? 
      strapiProduct.productTabs
        .sort((a, b) => a.order - b.order)
        .map(tab => ({
          id: tab.id,
          title: tab.title,
          content: tab.content || undefined,
          isActive: tab.isActive,
          order: tab.order,
          displayType: tab.displayType,
          accordionItems: tab.accordionItems ? 
            tab.accordionItems
              .sort((a, b) => a.order - b.order)
              .map(item => ({
                id: item.id,
                title: item.title,
                content: item.content,
                isExpanded: item.isExpanded,
                order: item.order
              })) : []
        })) : undefined,
  };
}

// Fetch products from Strapi
async function fetchFromStrapi(endpoint: string, cacheOptions?: { revalidate?: number | false }): Promise<any> {
  try {
    const url = `${STRAPI_URL}/api${endpoint}`;
    console.log('🔍 Fetching from Strapi:', url);
    
    // Default to 5 minute cache for better performance
    const fetchOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      next: { revalidate: 300 }, // Default: 5 minutes cache
    };

    // If revalidate is specified, override the default
    if (cacheOptions?.revalidate !== undefined) {
      fetchOptions.next = { revalidate: cacheOptions.revalidate };
    }
    
    // If explicitly set to false, use no-store
    if (cacheOptions?.revalidate === false) {
      delete fetchOptions.next;
      fetchOptions.cache = 'no-store';
    }
    
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Strapi API error:', response.status, errorText);
      throw new Error(`Strapi API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Strapi fetch error:', error);
    throw error;
  }
}

// Get all products
export async function fetchProducts(): Promise<MockDatabaseResponse<Product[]>> {
  try {
    // Strapi 5 uses dot notation for nested population
    // Sort by rank field (for drag-drop plugin) if available, otherwise by name
    const response: StrapiResponse = await fetchFromStrapi(
      '/products?populate[0]=image&populate[1]=gallery&populate[2]=category&populate[3]=productTabs.accordionItems&pagination[limit]=100&sort[0]=rank:asc&sort[1]=name:asc'
    );
    
    const products = response.data.map(convertStrapiProduct);
    
    return {
      data: products,
      error: null
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      data: null,
      error: 'Failed to fetch products from Strapi. Please make sure the Strapi server is running.'
    };
  }
}

// Get single product by slug
export async function fetchProductBySlug(slug: string): Promise<MockDatabaseResponse<Product>> {
  try {
    // Strapi 5 uses dot notation for nested population
    const response: StrapiResponse = await fetchFromStrapi(
      `/products?filters[slug][$eq]=${slug}&populate[0]=image&populate[1]=gallery&populate[2]=category&populate[3]=productTabs.accordionItems`
    );
    
    if (!response.data || response.data.length === 0) {
      return {
        data: null,
        error: 'Product not found'
      };
    }

    const product = convertStrapiProduct(response.data[0]);
    
    return {
      data: product,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch product'
    };
  }
}

// Get products by category
export async function fetchProductsByCategory(categorySlug: string): Promise<MockDatabaseResponse<Product[]>> {
  try {
    const response: StrapiResponse = await fetchFromStrapi(
      `/products?filters[category][slug][$eq]=${categorySlug}&populate=*&sort[0]=rank:asc&sort[1]=name:asc`
    );
    
    const products = response.data.map(convertStrapiProduct);
    
    return {
      data: products,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch products by category'
    };
  }
}

// Get featured products
export async function fetchFeaturedProducts(): Promise<MockDatabaseResponse<Product[]>> {
  try {
    const response: StrapiResponse = await fetchFromStrapi('/products?filters[featured][$eq]=true&populate=*&sort[0]=rank:asc&sort[1]=name:asc');
    
    const products = response.data.map(convertStrapiProduct);
    
    return {
      data: products,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch featured products'
    };
  }
}

// Get product by ID
export async function fetchProductById(id: number): Promise<MockDatabaseResponse<Product>> {
  try {
    const response: StrapiResponse = await fetchFromStrapi(`/products/${id}?populate=*`);
    
    if (!response.data || response.data.length === 0) {
      return {
        data: null,
        error: 'Product not found'
      };
    }

    const product = convertStrapiProduct(response.data[0]);
    
    return {
      data: product,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch product'
    };
  }
}

// Convert Strapi blog to frontend BlogPost format
function convertStrapiBlog(strapiBlog: StrapiBlog): BlogPost {
  return {
    id: strapiBlog.id,
    documentId: strapiBlog.documentId,
    title: strapiBlog.title,
    slug: strapiBlog.slug,
    excerpt: strapiBlog.excerpt,
    content: strapiBlog.content,
    coverImage: strapiBlog.coverImage ? {
      url: strapiBlog.coverImage.url.startsWith('http') 
        ? strapiBlog.coverImage.url 
        : `${STRAPI_URL}${strapiBlog.coverImage.url}`,
      alternativeText: strapiBlog.coverImage.alternativeText
    } : undefined,
    author: strapiBlog.author,
    featured: strapiBlog.featured,
    tags: strapiBlog.tags,
    readTime: strapiBlog.readTime,
    createdAt: strapiBlog.createdAt,
    updatedAt: strapiBlog.updatedAt,
    publishedAt: strapiBlog.publishedAt
  };
}

// Get all blogs
export async function fetchBlogs(): Promise<BlogPost[]> {
  try {
    // Strapi 5 explicit populate
    const response: StrapiBlogResponse = await fetchFromStrapi('/blogs?populate[0]=coverImage&sort[0]=publishedAt:desc');
    return response.data.map(convertStrapiBlog);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

// Get single blog by slug
export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Strapi 5 explicit populate
    const response: StrapiBlogResponse = await fetchFromStrapi(`/blogs?filters[slug][$eq]=${slug}&populate[0]=coverImage`);
    
    if (!response.data || response.data.length === 0) {
      return null;
    }

    return convertStrapiBlog(response.data[0]);
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
}

// Get featured blogs
export async function fetchFeaturedBlogs(): Promise<BlogPost[]> {
  try {
    // Strapi 5 explicit populate
    const response: StrapiBlogResponse = await fetchFromStrapi('/blogs?filters[featured][$eq]=true&populate[0]=coverImage&sort[0]=publishedAt:desc');
    return response.data.map(convertStrapiBlog);
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    return [];
  }
}

// ============================================
// RECIPE API FUNCTIONS
// ============================================

export interface Recipe {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string; // Optional, may not exist for all recipes
  coverImage?: {
    url: string;
    alternativeText?: string;
  };
  headerImage?: {
    url: string;
    alternativeText?: string;
  };
  category?: string; // Deprecated, kept for backward compatibility
  categories?: string[]; // Array of category names
  headerTitle?: string;
  methodLabel?: string;
  shortDescription?: string;
  prepTime?: string;
  cookTime?: string;
  time?: string;
  servings?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'Intermediate';
  featured: boolean;
  featuredImage?: {
    url: string;
    alternativeText?: string;
  };
  ingredients?: string | any[];
  equipment?: any[];
  important?: any[];
  notes?: any[];
  instructions?: string;
  longDescription?: string;
  notice?: string;
  videoId?: string;
  recipeVideoId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiRecipe {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: StrapiImage;
  featuredImage?: StrapiImage;
  headerImage?: StrapiImage;
  category?: string;
  categories?: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
  }>;
  headerTitle?: string;
  methodLabel?: string;
  shortDescription?: string;
  prepTime?: string;
  cookTime?: string;
  time?: string;
  servings?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'Intermediate';
  featured?: boolean;
  ingredients?: string | any[];
  equipment?: any[];
  important?: any[];
  notes?: any[];
  instructions?: string;
  longDescription?: string;
  notice?: string;
  videoId?: string;
  recipeVideoId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiRecipeResponse {
  data: StrapiRecipe[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Convert Strapi recipe to frontend Recipe format
function convertStrapiRecipe(strapiRecipe: StrapiRecipe): Recipe {
  // Extract category names from the relation
  const categories = strapiRecipe.categories?.map(cat => cat.name) || [];
  const category = categories.length > 0 ? categories[0] : strapiRecipe.category;

  return {
    id: strapiRecipe.id,
    documentId: strapiRecipe.documentId,
    title: strapiRecipe.title,
    slug: strapiRecipe.slug,
    excerpt: strapiRecipe.excerpt,
    content: strapiRecipe.content,
    coverImage: strapiRecipe.coverImage ? {
      url: strapiRecipe.coverImage.url.startsWith('http') 
        ? strapiRecipe.coverImage.url 
        : `${STRAPI_URL}${strapiRecipe.coverImage.url}`,
      alternativeText: strapiRecipe.coverImage.alternativeText
    } : strapiRecipe.featuredImage ? {
      url: strapiRecipe.featuredImage.url.startsWith('http') 
        ? strapiRecipe.featuredImage.url 
        : `${STRAPI_URL}${strapiRecipe.featuredImage.url}`,
      alternativeText: strapiRecipe.featuredImage.alternativeText
    } : undefined,
    featuredImage: strapiRecipe.featuredImage ? {
      url: strapiRecipe.featuredImage.url.startsWith('http') 
        ? strapiRecipe.featuredImage.url 
        : `${STRAPI_URL}${strapiRecipe.featuredImage.url}`,
      alternativeText: strapiRecipe.featuredImage.alternativeText
    } : undefined,
    headerImage: strapiRecipe.headerImage ? {
      url: strapiRecipe.headerImage.url.startsWith('http') 
        ? strapiRecipe.headerImage.url 
        : `${STRAPI_URL}${strapiRecipe.headerImage.url}`,
      alternativeText: strapiRecipe.headerImage.alternativeText
    } : undefined,
    category: category, // First category for backward compatibility
    categories: categories, // All categories
    headerTitle: strapiRecipe.headerTitle,
    methodLabel: strapiRecipe.methodLabel,
    shortDescription: strapiRecipe.shortDescription,
    prepTime: strapiRecipe.prepTime,
    cookTime: strapiRecipe.cookTime,
    time: strapiRecipe.time,
    servings: strapiRecipe.servings,
    difficulty: strapiRecipe.difficulty,
    featured: strapiRecipe.featured || false,
    ingredients: strapiRecipe.ingredients,
    equipment: strapiRecipe.equipment,
    important: strapiRecipe.important,
    notes: strapiRecipe.notes,
    instructions: strapiRecipe.instructions,
    longDescription: strapiRecipe.longDescription,
    notice: strapiRecipe.notice,
    videoId: strapiRecipe.videoId || strapiRecipe.recipeVideoId,
    recipeVideoId: strapiRecipe.recipeVideoId,
    createdAt: strapiRecipe.createdAt,
    updatedAt: strapiRecipe.updatedAt,
    publishedAt: strapiRecipe.publishedAt
  };
}

// Get all recipes
export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    // Strapi 5 - populate all fields
    const response: StrapiRecipeResponse = await fetchFromStrapi('/recipes?populate=*&sort[0]=publishedAt:desc');
    return response.data.map(convertStrapiRecipe);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

// Get single recipe by slug
export async function fetchRecipeBySlug(slug: string): Promise<Recipe | null> {
  try {
    // Strapi 5 - populate all fields
    const response: StrapiRecipeResponse = await fetchFromStrapi(`/recipes?filters[slug][$eq]=${slug}&populate=*`);
    
    if (!response.data || response.data.length === 0) {
      return null;
    }

    return convertStrapiRecipe(response.data[0]);
  } catch (error) {
    console.error('Error fetching recipe by slug:', error);
    return null;
  }
}

// Get featured recipes
export async function fetchFeaturedRecipes(): Promise<Recipe[]> {
  try {
    // Strapi 5 - populate all fields
    const response: StrapiRecipeResponse = await fetchFromStrapi('/recipes?filters[featured][$eq]=true&populate=*&sort[0]=publishedAt:desc');
    return response.data.map(convertStrapiRecipe);
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    return [];
  }
}

// Get recipes by category
export async function fetchRecipesByCategory(category: string): Promise<Recipe[]> {
  try {
    const response: StrapiRecipeResponse = await fetchFromStrapi(`/recipes?filters[category][$eq]=${encodeURIComponent(category)}&populate=*&sort[0]=publishedAt:desc`);
    return response.data.map(convertStrapiRecipe);
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    return [];
  }
}

// ============================================
// COURSE API FUNCTIONS
// ============================================

interface StrapiCourseResponse {
  data: StrapiCourse[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Convert Strapi course to frontend format (if needed, or use directly)
function convertStrapiCourse(strapiCourse: StrapiCourse): StrapiCourse {
  return {
    ...strapiCourse,
    featuredImage: strapiCourse.featuredImage ? {
      ...strapiCourse.featuredImage,
      url: strapiCourse.featuredImage.url.startsWith('http') 
        ? strapiCourse.featuredImage.url 
        : `${STRAPI_URL}${strapiCourse.featuredImage.url}`
    } : undefined,
    gallery: strapiCourse.gallery?.map(img => ({
      ...img,
      url: img.url.startsWith('http') 
        ? img.url 
        : `${STRAPI_URL}${img.url}`
    }))
  };
}

// Get all courses
export async function fetchCourses(options?: {
  page?: number;
  pageSize?: number;
  sort?: string;
}): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    // Use drag-drop rank by default, then title as fallback
    const { page = 1, pageSize = 25, sort = 'rank:asc' } = options || {};
    const response: StrapiCourseResponse = await fetchFromStrapi(
      `/courses?populate=*&sort[0]=${sort}&sort[1]=title:asc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
    );
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      data: null,
      error: 'Failed to fetch courses from Strapi. Please make sure the Strapi server is running.'
    };
  }
}

// Get single course by slug
export async function fetchCourseBySlug(slug: string): Promise<MockDatabaseResponse<StrapiCourse>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi(`/courses?filters[slug][$eq]=${slug}&populate=*`);
    
    if (!response.data || response.data.length === 0) {
      return {
        data: null,
        error: 'Course not found'
      };
    }

    const course = convertStrapiCourse(response.data[0]);
    
    return {
      data: course,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch course'
    };
  }
}

// Get single course by ID
export async function fetchCourseById(id: number): Promise<MockDatabaseResponse<StrapiCourse>> {
  try {
    const response = await fetchFromStrapi(`/courses/${id}?populate=*`);
    
    if (!response.data) {
      return {
        data: null,
        error: 'Course not found'
      };
    }

    const course = convertStrapiCourse(response.data);
    
    return {
      data: course,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch course'
    };
  }
}

// Get courses by series
export async function fetchCoursesBySeries(series: string): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi(
      `/courses?filters[series][$eq]=${encodeURIComponent(series)}&populate=*&sort[0]=rank:asc&sort[1]=title:asc&pagination[pageSize]=100`
    );
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch courses by series'
    };
  }
}

// Get courses by category
export async function fetchCoursesByCategory(category: string): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    // Strapi 5 - filter by relation using category name
    const response: StrapiCourseResponse = await fetchFromStrapi(
      `/courses?filters[category][name][$eq]=${encodeURIComponent(category)}&populate[0]=featuredImage&populate[1]=gallery&populate[2]=category&sort[0]=rank:asc&sort[1]=title:asc`
    );
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch courses by category'
    };
  }
}

// Get courses by level
export async function fetchCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi(
      `/courses?filters[courseLevel][$eq]=${level}&populate=*&sort[0]=rank:asc&sort[1]=title:asc`
    );
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch courses by level'
    };
  }
}

// Get featured courses
export async function fetchFeaturedCourses(): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi('/courses?filters[featured][$eq]=true&populate=*&sort[0]=rank:asc&sort[1]=title:asc');
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch featured courses'
    };
  }
}

// Search courses by title, content, series, author
export async function searchCourses(query: string): Promise<MockDatabaseResponse<StrapiCourse[]>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi(
      `/courses?filters[$or][0][title][$containsi]=${encodeURIComponent(query)}&filters[$or][1][excerpt][$containsi]=${encodeURIComponent(query)}&filters[$or][2][content][$containsi]=${encodeURIComponent(query)}&filters[$or][3][series][$containsi]=${encodeURIComponent(query)}&filters[$or][4][author][$containsi]=${encodeURIComponent(query)}&populate=*&sort=title:asc`
    );
    
    const courses = response.data.map(convertStrapiCourse);
    
    return {
      data: courses,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to search courses'
    };
  }
}

// Get all unique series names
export async function fetchCourseSeries(): Promise<MockDatabaseResponse<string[]>> {
  try {
    const response: StrapiCourseResponse = await fetchFromStrapi('/courses?fields=series');
    
    const seriesSet = new Set<string>();
    response.data.forEach(course => {
      if (course.series) {
        seriesSet.add(course.series);
      }
    });
    
    const series = Array.from(seriesSet).sort();
    
    return {
      data: series,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch course series'
    };
  }
}

// Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
}

// Get all unique categories
export async function fetchCourseCategories(): Promise<MockDatabaseResponse<string[]>> {
  try {
    // Fetch from the Category collection instead of course field
    const response = await fetchFromStrapi('/categories?fields[0]=name&sort=name:asc');
    
    const categories = response.data.map((cat: any) => cat.name);
    
    return {
      data: categories,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch course categories'
    };
  }
}

// Get all categories with full details
export async function fetchAllCategories(): Promise<MockDatabaseResponse<Category[]>> {
  try {
    const response = await fetchFromStrapi('/categories?populate=*&sort[0]=rank:asc&sort[1]=name:asc');
    
    const categories = response.data.map((cat: any) => {
      // Try to get featuredImage first, then fall back to image
      const imageData = cat.featuredImage || cat.image;
      
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: imageData ? {
          url: imageData.url.startsWith('http') 
            ? imageData.url 
            : `${STRAPI_URL}${imageData.url}`,
          alternativeText: imageData.alternativeText
        } : undefined
      };
    });
    
    return {
      data: categories,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'Failed to fetch categories'
    };
  }
}

// Menu API Functions
export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  order: number;
  isExternal: boolean;
  description?: string;
  icon?: string;
  cssClass?: string;
  relationType?: 'View All' | 'Logged In' | 'Logged Out'; // Control menu item visibility based on login status
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  title: string;
  slug: string;
  description?: string;
  menuItems: MenuItem[];
}

export async function fetchMenu(slug: string): Promise<MockDatabaseResponse<Menu>> {
  try {
    // Populate nested children (3 levels deep)
    // Cache menus for 1 hour since they rarely change
    // Strapi 5: Explicit populate for menuItems and nested children
    const response = await fetchFromStrapi(
      `/menus?filters[slug][$eq]=${slug}&populate[menuItems][populate][0]=children&populate[menuItems][populate][1]=children.children&populate[menuItems][populate][2]=parent&sort[menuItems][order]=asc`,
      { revalidate: 10 } // Cache for 10 seconds during development
    );
    
    if (response.data && response.data.length > 0) {
      const strapiMenu = response.data[0];
      
      // Filter to only get top-level items (those without a parent)
      const topLevelItems = strapiMenu.menuItems?.filter((item: any) => !item.parent) || [];
      
      const menu: Menu = {
        id: strapiMenu.id,
        title: strapiMenu.title,
        slug: strapiMenu.slug,
        description: strapiMenu.description,
        menuItems: topLevelItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          target: item.target,
          order: item.order,
          isExternal: item.isExternal,
          description: item.description,
          icon: item.icon,
          cssClass: item.cssClass,
          relationType: item.relationType || 'View All', // Default to View All (everyone can see)
          children: item.children?.map((child: any) => ({
            id: child.id,
            title: child.title,
            url: child.url,
            target: child.target,
            order: child.order,
            isExternal: child.isExternal,
            description: child.description,
            icon: child.icon,
            cssClass: child.cssClass,
            relationType: child.relationType || 'View All',
            // Include nested children (3rd level)
            children: child.children?.map((grandchild: any) => ({
              id: grandchild.id,
              title: grandchild.title,
              url: grandchild.url,
              target: grandchild.target,
              order: grandchild.order,
              isExternal: grandchild.isExternal,
              description: grandchild.description,
              icon: grandchild.icon,
              cssClass: grandchild.cssClass,
              relationType: grandchild.relationType || 'View All',
            })) || [],
          })) || [],
        })) || [],
      };
      
      return { data: menu, error: null };
    }
    
    return { data: null, error: 'Menu not found' };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchAllMenus(): Promise<MockDatabaseResponse<Menu[]>> {
  try {
    // Cache menus for 10 seconds during development
    const response = await fetchFromStrapi(
      `/menus?populate[menuItems][populate][0]=children&populate[menuItems][populate][1]=children.children&populate[menuItems][populate][2]=parent`,
      { revalidate: 10 } // Cache for 10 seconds during development
    );
    
    const menus: Menu[] = response.data?.map((strapiMenu: any) => {
      // Filter to only get top-level items (those without a parent)
      const topLevelItems = strapiMenu.menuItems?.filter((item: any) => !item.parent) || [];
      
      return {
        id: strapiMenu.id,
        title: strapiMenu.title,
        slug: strapiMenu.slug,
        description: strapiMenu.description,
        menuItems: topLevelItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          target: item.target,
          order: item.order,
          isExternal: item.isExternal,
          description: item.description,
          icon: item.icon,
          cssClass: item.cssClass,
          relationType: item.relationType || 'View All',
          children: item.children?.map((child: any) => ({
            id: child.id,
            title: child.title,
            url: child.url,
            target: child.target,
            order: child.order,
            isExternal: child.isExternal,
            description: child.description,
            icon: child.icon,
            cssClass: child.cssClass,
            relationType: child.relationType || 'View All',
          })) || [],
        })) || [],
      };
    }) || [];
    
    return { data: menus, error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

