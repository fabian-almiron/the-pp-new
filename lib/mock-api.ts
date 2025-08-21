import { Product, MockDatabaseResponse } from '@/data/types';
import { mockProducts, getProductBySlug, getProductById, getAllProducts, getProductsByCategory } from '@/data/products';

// Simulate database delay
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API class that simulates Supabase-like behavior
export class MockDatabase {
  // Get all products
  static async getProducts(): Promise<MockDatabaseResponse<Product[]>> {
    await simulateDelay();
    
    try {
      const products = getAllProducts();
      return {
        data: products,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch products'
      };
    }
  }

  // Get single product by slug
  static async getProductBySlug(slug: string): Promise<MockDatabaseResponse<Product>> {
    await simulateDelay();
    
    try {
      const product = getProductBySlug(slug);
      
      if (!product) {
        return {
          data: null,
          error: 'Product not found'
        };
      }

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

  // Get single product by ID
  static async getProductById(id: number): Promise<MockDatabaseResponse<Product>> {
    await simulateDelay();
    
    try {
      const product = getProductById(id);
      
      if (!product) {
        return {
          data: null,
          error: 'Product not found'
        };
      }

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
  static async getProductsByCategory(category: string): Promise<MockDatabaseResponse<Product[]>> {
    await simulateDelay();
    
    try {
      const products = getProductsByCategory(category);
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

  // Search products by name (bonus feature)
  static async searchProducts(query: string): Promise<MockDatabaseResponse<Product[]>> {
    await simulateDelay();
    
    try {
      const products = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        data: products,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to search products'
      };
    }
  }
}

// Convenience functions that match typical API patterns
export const fetchProducts = () => MockDatabase.getProducts();
export const fetchProductBySlug = (slug: string) => MockDatabase.getProductBySlug(slug);
export const fetchProductById = (id: number) => MockDatabase.getProductById(id);
export const fetchProductsByCategory = (category: string) => MockDatabase.getProductsByCategory(category);
