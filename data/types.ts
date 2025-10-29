export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ProductTipCategory {
  name: string;
  items: string[];
}

export interface ProductSpecifications {
  accessories?: string[];
  tipCategories?: ProductTipCategory[];
}

export interface ProductVariants {
  hasHandPreference?: boolean;
  hasSizeOptions?: boolean;
  hasColorOptions?: boolean;
}

export interface ProductVariation {
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  price: number;
  hand?: string;
  tuning?: string;
  size?: string;
  color?: string;
}

export interface ProductVariations {
  type: string;
  options: ProductVariation[];
}

export interface AccordionItem {
  id: number;
  title: string;
  content: string;
  isExpanded: boolean;
  order: number;
}

export interface ProductTab {
  id: number;
  title: string;
  content?: string;
  isActive: boolean;
  order: number;
  accordionItems: AccordionItem[];
  displayType: 'content_only' | 'accordion_only' | 'content_and_accordion';
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  images: GalleryImage[];
  shortDescription: string;
  longDescription: string;
  category: string;
  inStock: boolean;
  variants: ProductVariants;
  specifications: ProductSpecifications;
  disclaimer?: string;
  // New Strapi fields
  hasVariations?: boolean;
  variations?: ProductVariations;
  stripeProductId?: string;
  stripePriceId?: string;
  // Product tabs (nested structure)
  productTabs?: ProductTab[];
}

export interface MockDatabaseResponse<T> {
  data: T | null;
  error: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  isLoggedIn: boolean;
  membershipStatus: "active" | "inactive" | "pending";
  membershipType: "trial" | "basic" | "premium";
  joinDate: string;
  profileImage: string;
}

// Video Course Types
export interface Chapter {
  id: string;
  title: string;
  videoSrc: string;
  duration: number; // in seconds
}

export interface Course {
  title: string;
  series: string;
  chapters: Chapter[];
  aboutContent: string;
  whatYouNeedContent: string;
}

export interface CarouselItem {
  slug: string;
  title: string;
  thumbnailUrl: string;
  series?: string;
}

// Strapi Course Types (from WordPress import)
export interface VideoChapter {
  title: string;
  time: string;
}

export interface StrapiCourse {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: {
    id: number;
    url: string;
    alternativeText?: string;
    width: number;
    height: number;
  };
  gallery?: Array<{
    id: number;
    url: string;
    alternativeText?: string;
    width: number;
    height: number;
  }>;
  author: string;
  featured: boolean;
  tags?: string[];
  categories?: string[];
  courseLevel: 'beginner' | 'intermediate' | 'advanced';
  episode?: string;
  videoId?: string;
  series?: string;
  about?: string;
  videoChapters?: VideoChapter[];
  equipmentNeeded?: string[];
  wordpressId?: number;
  permalink?: string;
  order: number;
  publishedDate?: string;
  modifiedDate?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}