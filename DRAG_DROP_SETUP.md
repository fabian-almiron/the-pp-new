# Strapi Drag-Drop Content Types Configuration

## Overview
Your frontend is now fully configured to work with the Strapi drag-drop content types plugin (`@yunusemrejs/drag-drop-content-types-strapi5`). This plugin allows you to reorder content in the Strapi admin panel by dragging and dropping items.

**Note:** Your Strapi backend uses a `rank` field (not `order`) for custom ordering.

## What Was Updated

### 1. **Products** ✅
- **Files Updated**: `lib/strapi-api.ts`
- **Functions Updated**:
  - `fetchProducts()` - Sorts by `rank:asc`, then `name:asc` as fallback
  - `fetchProductsByCategory()` - Sorts by `rank:asc`, then `name:asc`
  - `fetchFeaturedProducts()` - Sorts by `rank:asc`, then `name:asc`
- **Result**: Products in your shop will display in the order you drag-and-drop them in Strapi admin

### 2. **Courses** ✅
- **Files Updated**: `lib/strapi-api.ts`, `app/api/courses/route.ts`, `app/courses/page.tsx`
- **Functions Updated**:
  - `fetchCourses()` - Default sort changed from `title:asc` to `rank:asc`
  - `fetchCoursesBySeries()` - Sorts by `rank:asc`, then `title:asc`
  - `fetchCoursesByCategory()` - Sorts by `rank:asc`, then `title:asc`
  - `fetchCoursesByLevel()` - Sorts by `rank:asc`, then `title:asc`
  - `fetchFeaturedCourses()` - Sorts by `rank:asc`, then `title:asc`
- **Result**: Courses will display in your custom drag-drop order instead of alphabetically

### 3. **Categories** ✅
- **Files Updated**: `lib/strapi-api.ts`
- **Functions Updated**:
  - `fetchAllCategories()` - Sorts by `rank:asc`, then `name:asc` as fallback
- **Result**: Categories will display in your custom order

### 4. **Menu Items** ✅
- Already using `order` field correctly (no changes needed)

### 5. **Recipes & Blogs** ℹ️
- **No changes made** - These content types remain sorted by `publishedAt:desc`
- **Reasoning**: Date-based sorting is more appropriate for blog posts and recipes

## How to Use in Strapi Admin

1. **Log into your Strapi admin panel**

2. **Navigate to Content Manager**

3. **Select a content type** (Products, Courses, or Categories)

4. **Look for the drag handle icon** (⋮⋮) on the left side of each item

5. **Click and drag** items to reorder them

6. **The order is saved automatically** to the `order` field

7. **Your frontend will automatically display items in this order**

## Technical Details

### Sorting Strategy
The frontend now uses a dual-sort strategy:
- **Primary Sort**: `rank:asc` (from your Strapi rank field)
- **Fallback Sort**: `name:asc` or `title:asc` (if rank field is missing or equal)

This means:
- Items with a `rank` value will be sorted by that value
- Items without a `rank` value will fall back to alphabetical sorting
- You can mix ranked and non-ranked items seamlessly

### API Endpoints Affected
- `/api/products` - Returns products in drag-drop order
- `/api/courses` - Returns courses in drag-drop order (can be overridden with `?sort=title:asc`)
- All Strapi API calls in `lib/strapi-api.ts`

## Testing the Configuration

1. **In Strapi Admin**:
   - Reorder some products or courses
   - Note the new order

2. **On Your Frontend**:
   - Visit `/shop` to see products
   - Visit `/courses` to see courses
   - Items should display in the order you set in Strapi

3. **Clear Cache** (if needed):
   - The frontend caches data for 5 minutes by default
   - Wait 5 minutes or restart your Next.js dev server to see changes

## Customization Options

### To Change Sort Order on a Specific Page
If you want to override the default ordering for a specific use case:

```typescript
// Example: Sort courses by title instead of order
const response = await fetch('/api/courses?sort=title:asc');
```

### To Disable Drag-Drop Ordering
If you want to revert to alphabetical sorting:

1. Edit `lib/strapi-api.ts`
2. Change `sort[0]=rank:asc` back to `sort=title:asc` or `sort=name:asc`
3. Remove the fallback sort parameter

## Notes

- The `rank` field is managed by your Strapi content types
- You can manually set rank values or use the drag-drop plugin
- The plugin handles numbering and reordering automatically
- Rank values are relative (1, 2, 3, etc.) and may have gaps

## Support

If you encounter any issues:
1. Check that the plugin is properly installed in Strapi
2. Verify the `rank` field exists on your content types in Strapi
3. Clear your browser cache and Next.js cache
4. Check the console for any API errors

---

**Last Updated**: November 18, 2025
**Plugin Version**: @yunusemrejs/drag-drop-content-types-strapi5

