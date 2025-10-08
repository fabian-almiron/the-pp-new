"use client"

import { useUser } from "@clerk/nextjs";
import { 
  getUserRole, 
  hasPermission, 
  hasMinimumRole, 
  hasExactRole,
  getUserPermissions,
  hasAnyPermission,
  hasAllPermissions,
  getRoleDisplayName,
  getRoleBadgeColor,
  getRoleDescription,
  type UserRole 
} from "@/lib/roles";

/**
 * Custom hook for role-based access control (2025 best practice)
 * Provides client-side role checking with Clerk integration
 */
export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = getUserRole(user);
  const permissions = getUserPermissions(user);

  return {
    // User state
    user,
    isLoaded,
    isSignedIn,
    
    // Role information
    role,
    permissions,
    roleDisplayName: getRoleDisplayName(role),
    roleBadgeColor: getRoleBadgeColor(role),
    roleDescription: getRoleDescription(role),
    
    // Permission checking functions
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasMinimumRole: (minimumRole: UserRole) => hasMinimumRole(user, minimumRole),
    hasExactRole: (requiredRole: UserRole) => hasExactRole(user, requiredRole),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    
    // Convenience role checks
    isCustomer: hasExactRole(user, "customer"),
    isSubscriber: hasExactRole(user, "subscriber"),
    canAccessPremium: hasMinimumRole(user, "subscriber"),
  };
}

/**
 * HOC for role-based component rendering
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole,
  fallback?: React.ComponentType<P>
) {
  return function RoleProtectedComponent(props: P) {
    const { hasMinimumRole, isLoaded } = useRole();
    
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    
    if (!hasMinimumRole(requiredRole)) {
      return fallback ? <fallback {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * HOC for permission-based component rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ComponentType<P>
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission, isLoaded } = useRole();
    
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    
    if (!hasPermission(requiredPermission)) {
      return fallback ? <fallback {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
}
