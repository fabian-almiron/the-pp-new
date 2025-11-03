import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Courses | The Piped Peony Academy",
  description: "Master the art of cake decorating with our comprehensive video courses. Learn from expert instructor Dara with courses ranging from beginner to advanced piping artistry.",
  keywords: ["cake decorating courses", "buttercream piping classes", "online cake decorating", "piping tutorials", "flower piping course", "cake decorating academy"],
  openGraph: {
    title: "All Courses | The Piped Peony Academy",
    description: "Comprehensive cake decorating courses from beginner to advanced levels",
    url: "https://thepipedpeony.com/courses",
    siteName: "The Piped Peony",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Piped Peony Academy Courses",
    description: "Master cake decorating with expert-led online courses",
  },
  alternates: {
    canonical: "https://thepipedpeony.com/courses",
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

