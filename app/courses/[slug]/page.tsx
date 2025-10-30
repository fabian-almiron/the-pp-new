import { Course, CarouselItem } from "@/data/types";
import { CoursePageClient } from "@/components/course-page-client";
import { SubscriberGate } from "@/components/subscriber-gate";
import { notFound } from "next/navigation";
import { fetchCourseBySlug, fetchCoursesBySeries } from "@/lib/strapi-api";

// Mark this page as dynamic (always server-rendered)
export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: {
    slug: string;
  };
}

// Helper function to convert timestamp format "00.00.01" to seconds
function parseTimestamp(timeStr: string | undefined | null): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  try {
    const timeParts = timeStr.split('.');
    if (timeParts.length === 3) {
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch (error) {
    console.warn('Error parsing timestamp:', timeStr, error);
  }
  
  return 0;
}

// Helper function to convert Strapi course to legacy Course format
function convertToLegacyCourse(strapiCourse: any): Course {
  if (!strapiCourse) {
    throw new Error('Course data is missing');
  }
  // Convert video chapters to the format expected by the component
  const chapters = (strapiCourse.videoChapters && Array.isArray(strapiCourse.videoChapters)) 
    ? strapiCourse.videoChapters.map((chapter: any, index: number) => ({
        id: `chapter-${index}`,
        title: chapter?.title || `Chapter ${index + 1}`,
        videoSrc: strapiCourse.videoId 
          ? `https://player.vimeo.com/video/${strapiCourse.videoId}#t=${chapter?.time || '0'}`
          : '',
        duration: parseTimestamp(chapter?.time), // Convert timestamp to seconds for display
      }))
    : [];

  // If we have a videoId but no chapters, create a single chapter
  if (strapiCourse.videoId && chapters.length === 0) {
    chapters.push({
      id: 'main',
      title: 'Full Video',
      videoSrc: `https://player.vimeo.com/video/${strapiCourse.videoId}`,
      duration: 0,
    });
  }

  // Convert equipment needed to HTML list
  const whatYouNeedContent = strapiCourse.equipmentNeeded && strapiCourse.equipmentNeeded.length > 0
    ? `<ul>${strapiCourse.equipmentNeeded.map((item: string) => `<li>${item}</li>`).join('')}</ul>`
    : '<p>No equipment list provided.</p>';

  return {
    title: strapiCourse.title,
    series: strapiCourse.series || 'General',
    chapters,
    aboutContent: strapiCourse.about || strapiCourse.content || '<p>No description available.</p>',
    whatYouNeedContent,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const { data: strapiCourse, error } = await fetchCourseBySlug(slug);
  
  if (error || !strapiCourse) {
    notFound();
  }

  // Convert to legacy format
  const course = convertToLegacyCourse(strapiCourse);

  // Fetch related courses from the same series
  let relatedCourses: CarouselItem[] = [];
  if (strapiCourse.series) {
    const { data: seriesCourses } = await fetchCoursesBySeries(strapiCourse.series);
    if (seriesCourses) {
      relatedCourses = seriesCourses
        .filter(c => c.slug !== slug) // Exclude current course
        .slice(0, 4) // Limit to 4 related courses
        .map(c => ({
          slug: c.slug,
          title: c.title,
          thumbnailUrl: c.featuredImage?.url || '/placeholder_peony.jpg',
          series: c.series,
        }));
    }
  }

  // If no related courses, fetch featured courses
  if (relatedCourses.length === 0) {
    const { fetchFeaturedCourses } = await import('@/lib/strapi-api');
    const { data: featured } = await fetchFeaturedCourses();
    if (featured) {
      relatedCourses = featured.slice(0, 4).map(c => ({
        slug: c.slug,
        title: c.title,
        thumbnailUrl: c.featuredImage?.url || '/placeholder_peony.jpg',
        series: c.series,
      }));
    }
  }

  return (
    <SubscriberGate>
      <CoursePageClient 
        course={course} 
        relatedCourses={relatedCourses}
      />
    </SubscriberGate>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params;
  const { data: strapiCourse } = await fetchCourseBySlug(slug);
  
  if (!strapiCourse) {
    return {
      title: "Course Not Found",
    };
  }

  const description = strapiCourse.excerpt || 
    strapiCourse.about?.replace(/<[^>]*>/g, '').substring(0, 160) ||
    strapiCourse.content?.replace(/<[^>]*>/g, '').substring(0, 160) ||
    '';

  return {
    title: `${strapiCourse.title} - ${strapiCourse.series || 'Courses'} | The Piped Peony`,
    description,
  };
}
