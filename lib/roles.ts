import { User } from "@clerk/nextjs/server";

// Define user roles following 2025 best practices
export type UserRole = "customer" | "subscriber";

// Define role hierarchy (subscriber includes all customer permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 1,
  subscriber: 2,
} as const;

// Define granular permissions following 2025 RBAC best practices
export const PERMISSIONS = {
  // Shopping permissions
  PURCHASE_PRODUCTS: "purchase:products",
  VIEW_CART: "view:cart",
  
  // Content access permissions
  ACCESS_FREE_CONTENT: "access:free_content",
  ACCESS_PREMIUM_CONTENT: "access:premium_content",
  
  // Video library permissions
  ACCESS_VIDEO_LIBRARY: "access:video_library",
  STREAM_VIDEOS: "stream:videos",
  
  // Academy permissions
  ACCESS_ACADEMY: "access:academy",
  ACCESS_COURSES: "access:courses",
  
  // Resource library permissions
  ACCESS_COLOR_LIBRARY: "access:color_library",
  ACCESS_RECIPE_LIBRARY: "access:recipe_library",
  ACCESS_CATEGORY_CONTENT: "access:category_content",
  
  // Account permissions
  MANAGE_PROFILE: "manage:profile",
  VIEW_ORDER_HISTORY: "view:order_history",
} as const;

// Define base permissions for each role
const CUSTOMER_PERMISSIONS = [
  PERMISSIONS.PURCHASE_PRODUCTS,
  PERMISSIONS.VIEW_CART,
  PERMISSIONS.ACCESS_FREE_CONTENT,
  PERMISSIONS.MANAGE_PROFILE,
  PERMISSIONS.VIEW_ORDER_HISTORY,
] as const;

// Define role-based permissions mapping (2025 best practice)
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  customer: CUSTOMER_PERMISSIONS,
  subscriber: [
    // Inherits all customer permissions
    ...CUSTOMER_PERMISSIONS,
    // Plus additional subscriber permissions
    PERMISSIONS.ACCESS_PREMIUM_CONTENT,
    PERMISSIONS.ACCESS_VIDEO_LIBRARY,
    PERMISSIONS.STREAM_VIDEOS,
    PERMISSIONS.ACCESS_ACADEMY,
    PERMISSIONS.ACCESS_COURSES,
    PERMISSIONS.ACCESS_COLOR_LIBRARY,
    PERMISSIONS.ACCESS_RECIPE_LIBRARY,
    PERMISSIONS.ACCESS_CATEGORY_CONTENT,
  ],
} as const;

/**
 * Get user role from Clerk user metadata (2025 best practice)
 * Uses publicMetadata for client-side access, privateMetadata for sensitive data
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return "customer";
  
  // 2025 best practice: Use publicMetadata for role (non-sensitive)
  // privateMetadata should be used for sensitive role data only
  const role = (user.publicMetadata?.role as string)?.toLowerCase() as UserRole;
  
  // Validate role and default to customer
  if (role && (role === "customer" || role === "subscriber")) {
    return role;
  }
  
  // Log warning if user has invalid/unknown role
  if (role && role !== "customer" && role !== "subscriber") {
    console.warn(`⚠️ User ${user.id} has invalid role: "${role}". Defaulting to "customer". This should be fixed in Clerk dashboard.`);
  }
  
  return "customer";
}

/**
 * Check if user has a specific permission (2025 RBAC best practice)
 */
export function hasPermission(user: User | null, permission: string): boolean {
  const role = getUserRole(user);
  const userPermissions = ROLE_PERMISSIONS[role];
  return userPermissions.includes(permission);
}

/**
 * Check if user has minimum role level (hierarchical check)
 */
export function hasMinimumRole(user: User | null, minimumRole: UserRole): boolean {
  const userRole = getUserRole(user);
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if user has exact role
 */
export function hasExactRole(user: User | null, requiredRole: UserRole): boolean {
  return getUserRole(user) === requiredRole;
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: User | null): string[] {
  const role = getUserRole(user);
  return ROLE_PERMISSIONS[role];
}

/**
 * Check multiple permissions at once
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    customer: "Customer",
    subscriber: "Subscriber",
  };
  return roleNames[role] || "Customer";
}

/**
 * Get role badge styling (Tailwind classes)
 */
export function getRoleBadgeColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    customer: "bg-gray-100 text-gray-800 border-gray-300",
    subscriber: "bg-[#D4A771] text-white border-[#D4A771]",
  };
  return roleColors[role] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    customer: "Access to shop and purchase products",
    subscriber: "Full access to all content, courses, and premium features",
  };
  return descriptions[role] || "";
}
