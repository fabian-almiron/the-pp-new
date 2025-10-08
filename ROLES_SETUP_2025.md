# 🎭 User Roles System - 2025 Implementation Guide

## ✅ What's Implemented

A modern, scalable role-based access control (RBAC) system using **Clerk** with 2025 best practices:

### **Roles Available:**
- **Customer** - Basic access (free tier)
- **Subscriber** - Premium access (paid tier)

---

## 🔧 Setup Instructions

### 1. **Configure Roles in Clerk Dashboard**

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users** → **User Management**
3. For each user, click **Edit** → **Metadata**
4. Add to **Public Metadata**:
   ```json
   {
     "role": "customer"
   }
   ```
   or
   ```json
   {
     "role": "subscriber"
   }
   ```

### 2. **Set Default Role for New Users**

In your Clerk Dashboard:
1. Go to **Webhooks** → **Add Endpoint**
2. Create a webhook for `user.created` event
3. Set endpoint URL: `https://your-domain.com/api/webhooks/user-created`
4. This will automatically assign "customer" role to new users

---

## 🎯 Role Permissions

### **Customer (Free Tier)**
✅ Purchase products  
✅ View cart and checkout  
✅ Access free content  
✅ Manage profile  
✅ View order history  

### **Subscriber (Premium Tier)**
✅ All Customer permissions  
✅ **Plus:** Access premium content  
✅ **Plus:** Full video library access  
✅ **Plus:** Academy courses and tutorials  
✅ **Plus:** Color and recipe libraries  
✅ **Plus:** Category content access  

---

## 🛡️ Protected Routes

### **Authentication Required (Any User):**
- `/my-account` - Account management

### **Subscriber Only (Premium Content):**
- `/video-library` - Video tutorials
- `/academy` - Academy content  
- `/courses` - Course materials
- `/colors` - Color library
- `/recipes` - Recipe library
- `/category/*` - Category content

### **Public Access:**
- `/shop` - Product browsing
- `/cart` - Shopping cart
- `/login` - Authentication
- `/signup` - Registration

---

## 💻 Usage in Code

### **Client-Side Role Checking**

```typescript
import { useRole } from "@/hooks/use-role"
import { PERMISSIONS } from "@/lib/roles"

function MyComponent() {
  const { 
    role, 
    isSubscriber, 
    hasPermission, 
    hasMinimumRole 
  } = useRole()

  // Check specific permission
  if (hasPermission(PERMISSIONS.ACCESS_VIDEO_LIBRARY)) {
    return <VideoLibrary />
  }

  // Check role level
  if (isSubscriber) {
    return <PremiumContent />
  }

  return <UpgradePrompt />
}
```

### **Conditional Rendering**

```typescript
import { withRole, withPermission } from "@/hooks/use-role"

// Wrap component with role requirement
const PremiumVideo = withRole(VideoPlayer, "subscriber", UpgradePrompt)

// Wrap component with permission requirement
const ColorLibrary = withPermission(
  ColorPalette, 
  PERMISSIONS.ACCESS_COLOR_LIBRARY,
  AccessDenied
)
```

### **Available Permissions**

```typescript
PERMISSIONS.PURCHASE_PRODUCTS
PERMISSIONS.VIEW_CART
PERMISSIONS.ACCESS_FREE_CONTENT
PERMISSIONS.ACCESS_PREMIUM_CONTENT
PERMISSIONS.ACCESS_VIDEO_LIBRARY
PERMISSIONS.STREAM_VIDEOS
PERMISSIONS.ACCESS_ACADEMY
PERMISSIONS.ACCESS_COURSES
PERMISSIONS.ACCESS_COLOR_LIBRARY
PERMISSIONS.ACCESS_RECIPE_LIBRARY
PERMISSIONS.ACCESS_CATEGORY_CONTENT
PERMISSIONS.MANAGE_PROFILE
PERMISSIONS.VIEW_ORDER_HISTORY
```

---

## 🎨 UI Components

### **Role Badge Display**
Users see their role in:
- Header (when logged in)
- My Account page
- Profile sections

### **Upgrade Prompts**
- Automatic redirect to `/upgrade` for premium content
- Upgrade button in My Account for customers
- Beautiful pricing comparison

---

## 🔄 User Flow

### **Customer Journey:**
1. **Sign up** → Automatically assigned "customer" role
2. **Browse shop** → Full access to products
3. **Try premium content** → Redirected to upgrade page
4. **Upgrade** → Role changed to "subscriber"
5. **Access premium** → Full content library unlocked

### **Subscriber Benefits:**
- Immediate access to all premium content
- No upgrade prompts or restrictions
- Premium badge display
- Priority support (future feature)

---

## 🚀 Testing the System

### **Test as Customer:**
1. Create new account (auto-assigned customer role)
2. Try accessing `/academy` → Should redirect to `/upgrade`
3. Visit `/my-account` → Should see "Customer" badge and upgrade button

### **Test as Subscriber:**
1. In Clerk Dashboard, change user metadata: `{"role": "subscriber"}`
2. Access `/academy` → Should work without redirect
3. Visit `/my-account` → Should see "Subscriber" badge, no upgrade button

---

## 🔧 Advanced Configuration

### **Add New Role:**
1. Update `UserRole` type in `/lib/roles.ts`
2. Add to `ROLE_HIERARCHY` and `ROLE_PERMISSIONS`
3. Update UI components and middleware as needed

### **Add New Permission:**
1. Add to `PERMISSIONS` object in `/lib/roles.ts`
2. Assign to appropriate roles in `ROLE_PERMISSIONS`
3. Use in components with `hasPermission()`

---

## 🎯 2025 Best Practices Implemented

✅ **Granular Permissions** - Fine-grained access control  
✅ **Role Hierarchy** - Subscriber inherits customer permissions  
✅ **Client-Side Hooks** - Easy role checking in components  
✅ **Middleware Protection** - Server-side route protection  
✅ **Metadata Storage** - Secure role storage in Clerk  
✅ **Graceful Degradation** - Upgrade prompts instead of errors  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Optimized permission checking  

---

## 🎉 Ready to Use!

Your role system is now fully implemented and ready for production. Users will have a smooth experience with clear upgrade paths and proper access control.

**Next Steps:**
1. Set up Stripe integration for subscription payments
2. Create webhook for automatic role assignment after payment
3. Add role-based email notifications
4. Implement role-based analytics

🚀 **Your authentication system now supports both free customers and premium subscribers with 2025 best practices!**
