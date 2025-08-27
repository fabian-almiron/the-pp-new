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