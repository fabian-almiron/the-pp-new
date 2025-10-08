# Course API Guide - Frontend Integration

This guide shows you how to use the Course API functions in your Next.js frontend to fetch and display courses imported from WordPress.

## Available API Functions

All functions are available in `/lib/strapi-api.ts`:

### 1. Fetch All Courses
```typescript
import { fetchCourses } from '@/lib/strapi-api';

// Basic usage
const { data: courses, error } = await fetchCourses();

// With pagination and sorting
const { data: courses, error } = await fetchCourses({
  page: 1,
  pageSize: 10,
  sort: 'order:asc' // or 'title:asc', 'publishedDate:desc', etc.
});
```

### 2. Fetch Single Course by Slug
```typescript
import { fetchCourseBySlug } from '@/lib/strapi-api';

const { data: course, error } = await fetchCourseBySlug('american-buttercream');
```

### 3. Fetch Course by ID
```typescript
import { fetchCourseById } from '@/lib/strapi-api';

const { data: course, error } = await fetchCourseById(1);
```

### 4. Fetch Courses by Series
```typescript
import { fetchCoursesBySeries } from '@/lib/strapi-api';

const { data: courses, error } = await fetchCoursesBySeries('The Starter Series');
```

### 5. Fetch Courses by Category
```typescript
import { fetchCoursesByCategory } from '@/lib/strapi-api';

const { data: courses, error } = await fetchCoursesByCategory('The Recipe Series');
```

### 6. Fetch Courses by Level
```typescript
import { fetchCoursesByLevel } from '@/lib/strapi-api';

const { data: courses, error } = await fetchCoursesByLevel('beginner');
// Options: 'beginner', 'intermediate', 'advanced'
```

### 7. Fetch Featured Courses
```typescript
import { fetchFeaturedCourses } from '@/lib/strapi-api';

const { data: courses, error } = await fetchFeaturedCourses();
```

### 8. Search Courses
```typescript
import { searchCourses } from '@/lib/strapi-api';

const { data: courses, error } = await searchCourses('buttercream');
```

### 9. Fetch All Series Names
```typescript
import { fetchCourseSeries } from '@/lib/strapi-api';

const { data: seriesList, error } = await fetchCourseSeries();
// Returns: ['The Starter Series', 'The Recipe Series', 'Flower Piping Series', ...]
```

### 10. Fetch All Categories
```typescript
import { fetchCourseCategories } from '@/lib/strapi-api';

const { data: categories, error } = await fetchCourseCategories();
```

## Course Data Structure

The `StrapiCourse` type includes:

```typescript
interface StrapiCourse {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string;              // HTML content
  excerpt?: string;              // Short description
  featuredImage?: {
    id: number;
    url: string;                 // Full URL with domain
    alternativeText?: string;
    width: number;
    height: number;
  };
  gallery?: Array<{...}>;        // Additional images
  author: string;
  featured: boolean;
  tags?: string[];               // Array of tag strings
  categories?: string[];         // Array of category strings
  courseLevel: 'beginner' | 'intermediate' | 'advanced';
  episode?: string;
  videoId?: string;              // Vimeo/YouTube ID
  series?: string;               // Course series name
  about?: string;                // About section (HTML)
  videoChapters?: VideoChapter[]; // Array of chapters with timestamps
  equipmentNeeded?: string[];    // Array of equipment items
  order: number;                 // Display order
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface VideoChapter {
  title: string;                 // e.g., "1 Introduction"
  time: string;                  // e.g., "00.00.01"
}
```

## Example: Course List Page

```typescript
// app/courses/page.tsx
import { fetchCourses } from '@/lib/strapi-api';

export default async function CoursesPage() {
  const { data: courses, error } = await fetchCourses({ pageSize: 50 });

  if (error || !courses) {
    return <div>Error loading courses: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">All Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg overflow-hidden">
            {course.featuredImage && (
              <img
                src={course.featuredImage.url}
                alt={course.featuredImage.alternativeText || course.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              
              <p className="text-sm text-gray-600 mb-2">
                {course.series} • {course.courseLevel}
              </p>
              
              {course.excerpt && (
                <p className="text-gray-700 mb-4">{course.excerpt}</p>
              )}
              
              <a
                href={`/courses/${course.slug}`}
                className="text-blue-600 hover:underline"
              >
                View Course →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Example: Course Detail Page

```typescript
// app/courses/[slug]/page.tsx
import { fetchCourseBySlug } from '@/lib/strapi-api';
import { notFound } from 'next/navigation';

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const { data: course, error } = await fetchCourseBySlug(params.slug);

  if (error || !course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        
        <div className="flex gap-4 mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {course.courseLevel}
          </span>
          {course.series && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {course.series}
            </span>
          )}
        </div>

        {course.featuredImage && (
          <img
            src={course.featuredImage.url}
            alt={course.featuredImage.alternativeText || course.title}
            className="w-full rounded-lg mb-8"
          />
        )}

        {course.videoId && (
          <div className="mb-8">
            <div className="aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${course.videoId}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Video Chapters */}
        {course.videoChapters && course.videoChapters.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Chapters</h2>
            <ul className="space-y-2">
              {course.videoChapters.map((chapter, index) => (
                <li key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>{chapter.title}</span>
                  <span className="text-gray-600">{chapter.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment Needed */}
        {course.equipmentNeeded && course.equipmentNeeded.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">What You'll Need</h2>
            <ul className="grid grid-cols-2 gap-2">
              {course.equipmentNeeded.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* About Section */}
        {course.about && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About This Course</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: course.about }}
            />
          </div>
        )}

        {/* Main Content */}
        {course.content && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: course.content }} />
          </div>
        )}

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Example: Filter by Series

```typescript
// app/courses/series/[series]/page.tsx
import { fetchCoursesBySeries } from '@/lib/strapi-api';

export default async function SeriesPage({ params }: { params: { series: string } }) {
  const seriesName = decodeURIComponent(params.series);
  const { data: courses, error } = await fetchCoursesBySeries(seriesName);

  if (error || !courses) {
    return <div>Error loading series: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">{seriesName}</h1>
      <p className="mb-6">Showing {courses.length} courses</p>
      
      {/* Render courses in order */}
      <div className="space-y-4">
        {courses.map((course, index) => (
          <div key={course.id} className="border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl font-bold text-gray-300">
                {index + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
                {course.excerpt && <p className="text-gray-700">{course.excerpt}</p>}
                <a
                  href={`/courses/${course.slug}`}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Course
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

All API functions return a `MockDatabaseResponse<T>` with this structure:

```typescript
interface MockDatabaseResponse<T> {
  data: T | null;
  error: string | null;
}
```

Always check for errors:

```typescript
const { data, error } = await fetchCourses();

if (error) {
  // Handle error - show message to user
  console.error('Failed to load courses:', error);
  return <ErrorComponent message={error} />;
}

if (!data) {
  // Handle empty state
  return <EmptyState />;
}

// Use data safely
return <CoursesList courses={data} />;
```

## Next Steps

1. Create course listing pages (`/app/courses/page.tsx`)
2. Create course detail pages (`/app/courses/[slug]/page.tsx`)
3. Add video player integration with chapter navigation
4. Create series browsing pages
5. Add search functionality
6. Integrate with your membership/authentication system

## Tips

- Use Next.js 15 server components for data fetching (no need for `useEffect`)
- Images are already prefixed with Strapi URL
- Video chapters can be used to create interactive video navigation
- Equipment lists can be turned into shopping links
- Series can be displayed as playlists
- Use the `order` field to display courses in the correct sequence

