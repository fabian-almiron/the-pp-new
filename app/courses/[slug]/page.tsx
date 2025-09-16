import { Course, CarouselItem } from "@/data/types";
import { CoursePageClient } from "@/components/course-page-client";
import { notFound } from "next/navigation";

// Mock data - In a real app, this would come from a database or API
const mockCourses: Record<string, Course> = {
  "the-black-cake-class": {
    title: "The Black Cake Class",
    series: "Coloring Series",
    chapters: [
      {
        id: "overview",
        title: "Overview",
        videoSrc: "/videos/black-cake-overview.mp4", // placeholder
        duration: 180, // 3 minutes
      },
      {
        id: "best-way-avoid-black-lips",
        title: "What is the best way to avoid black lips?",
        videoSrc: "/videos/black-cake-avoid-lips.mp4", // placeholder
        duration: 240, // 4 minutes
      },
      {
        id: "buttercream-to-use",
        title: "What buttercream should I use?",
        videoSrc: "/videos/black-cake-buttercream.mp4", // placeholder
        duration: 300, // 5 minutes
      },
      {
        id: "measure-coloring",
        title: "Measure black coloring into buttercream",
        videoSrc: "/videos/black-cake-measure.mp4", // placeholder
        duration: 420, // 7 minutes
      },
      {
        id: "microwave-sessions",
        title: "Microwave sessions",
        videoSrc: "/videos/black-cake-microwave.mp4", // placeholder
        duration: 360, // 6 minutes
      },
      {
        id: "color-developing-blades",
        title: "Color Developing Method 1: Blades",
        videoSrc: "/videos/black-cake-blades.mp4", // placeholder
        duration: 480, // 8 minutes
      },
      {
        id: "color-developing-patience",
        title: "Color Developing Method 2: Patience",
        videoSrc: "/videos/black-cake-patience.mp4", // placeholder
        duration: 600, // 10 minutes
      },
      {
        id: "acrylic-express",
        title: "The Acrylic Express: Let's get a smooth finish and sharp edge",
        videoSrc: "/videos/black-cake-acrylic.mp4", // placeholder
        duration: 540, // 9 minutes
      },
      {
        id: "applying-center",
        title: "Applying buttercream to the center",
        videoSrc: "/videos/black-cake-center.mp4", // placeholder
        duration: 420, // 7 minutes
      },
      {
        id: "applying-top-disc",
        title: "Applying the top disc",
        videoSrc: "/videos/black-cake-top-disc.mp4", // placeholder
        duration: 300, // 5 minutes
      },
      {
        id: "applying-to-cake",
        title: "Applying buttercream to the cake",
        videoSrc: "/videos/black-cake-to-cake.mp4", // placeholder
        duration: 480, // 8 minutes
      },
      {
        id: "removing-excess",
        title: "Removing excess buttercream",
        videoSrc: "/videos/black-cake-excess.mp4", // placeholder
        duration: 360, // 6 minutes
      },
      {
        id: "final-smoothing",
        title: "Final smoothing",
        videoSrc: "/videos/black-cake-smoothing.mp4", // placeholder
        duration: 420, // 7 minutes
      },
      {
        id: "acrylic-disc-removal",
        title: "Acrylic disc removal",
        videoSrc: "/videos/black-cake-removal.mp4", // placeholder
        duration: 240, // 4 minutes
      },
      {
        id: "conclusion",
        title: "Conclusion",
        videoSrc: "/videos/black-cake-conclusion.mp4", // placeholder
        duration: 120, // 2 minutes
      },
    ],
    aboutContent: `
      <p>In this class, you'll learn how to get a rich, black buttercream. The best part? No excessive color use or black cocoa powder involved! So, you can say goodbye to that Oreo-like taste. Plus, we'll show you how to use acrylic discs to give your black cake a smooth buttercream finish and that sharp, professional buttercream edge!</p>
    `,
    whatYouNeedContent: `
      <ul>
        <li>Black gel food coloring (AmeriColor Super Black recommended)</li>
        <li>Buttercream (recipe provided in course)</li>
        <li>Acrylic discs</li>
        <li>Offset spatula</li>
        <li>Bench scraper</li>
        <li>Microwave-safe bowl</li>
        <li>Stand mixer or hand mixer</li>
      </ul>
    `,
  },
};

const mockRelatedCourses: CarouselItem[] = [
  {
    slug: "the-greens-evergreenish-buttercream",
    title: "The Greens: Evergreenish Buttercream",
    thumbnailUrl: "/placeholder_peony.jpg",
  },
  {
    slug: "the-reds-deep-red-buttercream",
    title: "The Reds: Deep Red Buttercream",
    thumbnailUrl: "/placeholder_rose-pink.jpg",
  },
  {
    slug: "how-to-gel-white-buttercream",
    title: "How to Gel White Buttercream",
    thumbnailUrl: "/placeholder_lily.jpg",
  },
  {
    slug: "the-muting-levers",
    title: "The Muting Levers",
    thumbnailUrl: "/placeholder_orchid-pink.jpg",
  },
];

interface CoursePageProps {
  params: {
    slug: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = mockCourses[params.slug];
  
  if (!course) {
    notFound();
  }

  return (
    <CoursePageClient 
      course={course} 
      relatedCourses={mockRelatedCourses}
    />
  );
}

// Generate static params for known courses (optional, for static generation)
export function generateStaticParams() {
  return Object.keys(mockCourses).map((slug) => ({
    slug,
  }));
}

// Metadata for SEO
export function generateMetadata({ params }: CoursePageProps) {
  const course = mockCourses[params.slug];
  
  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} - ${course.series} | The Piped Peony`,
    description: course.aboutContent.replace(/<[^>]*>/g, '').substring(0, 160),
  };
}
