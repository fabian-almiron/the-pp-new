import { Product, User, MockDatabaseResponse } from '@/data/types';
import { mockProducts, getProductBySlug, getProductById, getAllProducts, getProductsByCategory } from '@/data/products';
import { mockUsers, getUserByEmail, getUserById, getAllUsers, getLoggedInUser, createUser as createUserData } from '@/data/users';

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

  // USER MANAGEMENT METHODS
  
  // Get all users
  static async getUsers(): Promise<MockDatabaseResponse<User[]>> {
    await simulateDelay();
    
    try {
      const users = getAllUsers();
      return {
        data: users,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch users'
      };
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      const user = getUserByEmail(email);
      
      if (!user) {
        return {
          data: null,
          error: 'User not found'
        };
      }

      return {
        data: user,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch user'
      };
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      const user = getUserById(id);
      
      if (!user) {
        return {
          data: null,
          error: 'User not found'
        };
      }

      return {
        data: user,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch user'
      };
    }
  }

  // Get currently logged in user
  static async getLoggedInUser(): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      const user = getLoggedInUser();
      
      if (!user) {
        return {
          data: null,
          error: 'No user is currently logged in'
        };
      }

      return {
        data: user,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to get logged in user'
      };
    }
  }

  // Login user by email
  static async loginUser(email: string): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      const user = getUserByEmail(email);
      
      if (!user) {
        return {
          data: null,
          error: 'User not found'
        };
      }

      // Log out all other users first
      mockUsers.forEach(u => u.isLoggedIn = false);
      // Log in the requested user
      user.isLoggedIn = true;

      return {
        data: user,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to login user'
      };
    }
  }

  // Logout current user
  static async logoutUser(): Promise<MockDatabaseResponse<boolean>> {
    await simulateDelay();
    
    try {
      mockUsers.forEach(user => user.isLoggedIn = false);
      
      return {
        data: true,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to logout user'
      };
    }
  }

  // Create new user
  static async createUser(userData: { name: string; email: string; password: string }): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      const newUser = createUserData(userData);
      
      if (!newUser) {
        return {
          data: null,
          error: 'User with this email already exists'
        };
      }

      return {
        data: newUser,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create user'
      };
    }
  }

  // Signup and login user in one operation
  static async signupAndLogin(userData: { name: string; email: string; password: string }): Promise<MockDatabaseResponse<User>> {
    await simulateDelay();
    
    try {
      // Create the user
      const createResponse = await this.createUser(userData);
      if (createResponse.error || !createResponse.data) {
        return createResponse;
      }

      // Login the new user
      const loginResponse = await this.loginUser(userData.email);
      return loginResponse;
    } catch (error) {
      return {
        data: null,
        error: 'Failed to signup and login user'
      };
    }
  }

  // Check if any user is logged in
  static async isUserLoggedIn(): Promise<MockDatabaseResponse<boolean>> {
    await simulateDelay();
    
    try {
      const isLoggedIn = mockUsers.some(user => user.isLoggedIn === true);
      
      return {
        data: isLoggedIn,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to check login status'
      };
    }
  }
}

// Convenience functions that match typical API patterns
// Products
export const fetchProducts = () => MockDatabase.getProducts();
export const fetchProductBySlug = (slug: string) => MockDatabase.getProductBySlug(slug);
export const fetchProductById = (id: number) => MockDatabase.getProductById(id);
export const fetchProductsByCategory = (category: string) => MockDatabase.getProductsByCategory(category);

// Users
export const fetchUsers = () => MockDatabase.getUsers();
export const fetchUserByEmail = (email: string) => MockDatabase.getUserByEmail(email);
export const fetchUserById = (id: number) => MockDatabase.getUserById(id);
export const fetchLoggedInUser = () => MockDatabase.getLoggedInUser();
export const fetchLoginUser = (email: string) => MockDatabase.loginUser(email);
export const fetchLogoutUser = () => MockDatabase.logoutUser();
export const fetchCreateUser = (userData: { name: string; email: string; password: string }) => MockDatabase.createUser(userData);
export const fetchSignupAndLogin = (userData: { name: string; email: string; password: string }) => MockDatabase.signupAndLogin(userData);
export const fetchIsUserLoggedIn = () => MockDatabase.isUserLoggedIn();
