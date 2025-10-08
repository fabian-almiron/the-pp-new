import { fetchCoursesByCategory, fetchCourseCategories } from "@/lib/strapi-api";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Video, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mark this page as dynamic (always server-rendered)
export const dynamic = 'force-dynamic';

// Function to get Vimeo thumbnail URL
function getVimeoThumbnail(videoId: string, size: 'small' | 'medium' | 'large' = 'large'): string {
  if (!videoId) return '';
  
  // Vimeo thumbnail URL format
  const sizeMap = {
    small: '200x150',
    medium: '640x480', 
    large: '1280x720'
  };
  
  return `https://vumbnail.com/${videoId}_${sizeMap[size]}.jpg`;
}

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper to convert slug to display name
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to fetch category by slug
async function fetchCategoryBySlug(slug: string) {
  try {
    const response = await fetch(`http://localhost:1337/api/categories?filters[slug][$eq]=${slug}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params for Next.js 15
  const { slug } = await params;
  
  // Fetch category by slug
  const category = await fetchCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  // Fetch courses by category name
  const { data: courses, error } = await fetchCoursesByCategory(category.name);

  if (error || !courses || courses.length === 0) {
    notFound();
  }

  return renderCategoryPage(category.name, courses, slug);
}

function renderCategoryPage(title: string, courses: any[], slug: string) {
  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Hero Section */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-black/70 text-white border-black/50 hover:bg-black/80 backdrop-blur-sm">
            {title}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black uppercase">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} in this category
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group relative"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                {/* Course Image */}
                <div className="relative h-44 bg-[#FBF9F6]">
                  {course.featuredImage ? (
                    <Image
                      src={course.featuredImage.url}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : course.videoId ? (
                    <Image
                      src={getVimeoThumbnail(course.videoId)}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🌸</span>
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4A771]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Level Badge */}
                  {course.courseLevel && (
                    <div className="absolute top-3 right-3">
                      <Badge className={`${
                        course.courseLevel === 'beginner' ? 'bg-green-500 hover:bg-green-600' :
                        course.courseLevel === 'intermediate' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-500 hover:bg-red-600'
                      } text-white border-0 shadow-lg`}>
                        {course.courseLevel}
                      </Badge>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {course.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#D4A771] text-white border-0 shadow-lg hover:bg-[#C99860]">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold mb-2 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h3>
                  
                  {course.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                      {course.excerpt}
                    </p>
                  )}

                  {/* Course Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    {course.videoChapters && course.videoChapters.length > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Video className="w-4 h-4 text-[#D4A771]" />
                        <span className="font-medium">{course.videoChapters.length} chapters</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-[#D4A771] group-hover:translate-x-1 transition-transform">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

          {/* Back to All Courses */}
          <div className="text-center">
            <Link href="/courses">
              <Button 
                variant="outline" 
                className="border-2 border-[#D4A771] text-[#D4A771] hover:bg-[#D4A771] hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  // Await params for Next.js 15
  const { slug } = await params;
  const title = slugToTitle(slug);
  
  return {
    title: `${title} | The Piped Peony Academy`,
    description: `Browse courses in ${title}. Learn buttercream flower piping, cake decorating, and more.`,
  };
}

