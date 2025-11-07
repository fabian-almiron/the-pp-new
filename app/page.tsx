import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq-accordion";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { fetchCourses } from "@/lib/strapi-api";
import { OrganizationSchema } from "@/components/structured-data";
import type { Metadata } from "next";

// Force dynamic rendering for home page to fetch latest courses
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "The Piped Peony Academy | Learn Buttercream Flower Piping",
  description: "Learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights. Join The Piped Peony Academy for on-demand cake decorating classes, exclusive recipes, and supportive community.",
  keywords: ["buttercream flowers", "cake decorating", "piping tutorials", "buttercream piping", "flower cake", "cake decorating classes", "online baking courses"],
  openGraph: {
    title: "The Piped Peony Academy | Learn Buttercream Flower Piping",
    description: "Join The Piped Peony Academy for expert cake decorating tutorials, exclusive Blooming Buttercream™ recipes, and a supportive community.",
    url: "https://thepipedpeony.com",
    siteName: "The Piped Peony",
    images: [
      {
        url: "/archy-header-image.webp",
        width: 1200,
        height: 630,
        alt: "Beautiful buttercream flower cake",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Piped Peony Academy | Learn Buttercream Flower Piping",
    description: "Learn buttercream flower piping with expert tutorials and exclusive recipes.",
    images: ["/archy-header-image.webp"],
  },
  alternates: {
    canonical: "https://thepipedpeony.com",
  },
};

export default async function HomePage() {
  // Fetch latest 3 courses
  const { data: latestCourses } = await fetchCourses({
    pageSize: 3,
    sort: 'publishedAt:desc'
  });

  return (
    <>
      <OrganizationSchema
        name="The Piped Peony Academy"
        url="https://thepipedpeony.com"
        logo="https://thepipedpeony.com/piped-peony-logo-2048x452.png"
        description="Learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights. Expert cake decorating and buttercream flower piping courses."
        socialProfiles={[
          "https://www.facebook.com/thepipedpeony",
          "https://www.instagram.com/thepipedpeony",
        ]}
      />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
      <LatestVideosSection courses={latestCourses || []} />
      <FaqSection />
      <CtaSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="hero-section !pt-4 md:!pt-8 lg:!pt-12">
      <div className="container !px-4">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title !mb-4 md:!mb-6">
              The Piped Peony
            </h1>
            <p className="hero-description !mb-6 md:!mb-12 !max-w-full md:!max-w-[75%]">
              The Piped Peony Academy is for everyone! We'll learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights.
            </p>
            <div className="hero-cta-wrapper !mb-8 md:!mb-0">
              <Link href="/signup">
                <Button variant="cta">
                  Sign up for 7 free days
                </Button>
              </Link>
            </div>
          </div>
          <div className="hero-image-area relative z-20">
            <div className="hero-image-container">
              <div className="hero-image-frame">
                <Image
                  src="/archy-header-image.webp"
                  alt="Beautifully decorated cake with buttercream flowers"
                  fill
                  priority
                  quality={85}
                  style={{ objectFit: 'cover' }}
                  className="hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { title: "Watch Anytime, Anywhere", description: "Watch on-demand classes at your convenience, allowing for a more flexible and efficient learning experience." },
    { title: "Online Community & Support", description: "Upon joining, you will be granted access to a private Facebook group that provides you with the necessary support to acquire and enhance your piping skills." },
    { title: "Exclusive Recipes", description: "As a member, you will gain access to cake and piping recipes that will enhance the beauty and taste of your creations, including our exclusive Blooming Buttercream™ recipe." },
    { title: "New Monthly Content", description: "Stay ahead of the latest trends and seasons with new designs and the latest innovative techniques." },
  ];

  return (
    <section className="features-section !py-8 md:!py-16">
      <div className="container !px-4">
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-item">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section !py-8 md:!py-16">
      <div className="container !px-4">
        {/* Mobile: Centered content without line */}
        <div className="about-content-mobile">
          <h2 className="about-signature">Nice to meet you!</h2>
          <h3 className="about-name">My name is Dara</h3>
          <div className="about-text-content">
            <p>I fell in love with buttercream flowers four years ago, inspired by my passion for food. Food is a love language that bonds family, friends and communities-there's a reason everyone gathers in the kitchen! I wanted to find a way to share food's beauty, and buttercream flowers were it!</p>
            <p>Learning to pipe buttercream flowers wasn't easy. First, I had to learn all about piping tips on my own, which felt like learning a whole new language. Then, I spent hours watching unhelpful videos that produced flowers that were flat and unrealistic looking. The hardest part? There was no one to turn to for guidance if I couldn't get a technique. I was all alone on my journey.</p>
            <p>That's why I started the Piped Peony Academy. I wanted to build a path for anyone who had a desire and will to learn the craft. Most importantly, I wanted to price it to be affordable, and I wanted to be there to offer guidance and support.</p>
          </div>
          <div className="about-button-wrapper">
            <Link href="/meet-dara">
              <Button variant="cta">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Tablet and Desktop: Grid with line */}
        <div className="about-content-desktop">
          <div className="about-text-column">
            <h2 className="about-signature">Nice to meet you!</h2>
            <h3 className="about-name">My name is Dara</h3>
            <div className="about-text-content">
              <p>I fell in love with buttercream flowers four years ago, inspired by my passion for food. Food is a love language that bonds family, friends and communities-there's a reason everyone gathers in the kitchen! I wanted to find a way to share food's beauty, and buttercream flowers were it!</p>
              <p>Learning to pipe buttercream flowers wasn't easy. First, I had to learn all about piping tips on my own, which felt like learning a whole new language. Then, I spent hours watching unhelpful videos that produced flowers that were flat and unrealistic looking. The hardest part? There was no one to turn to for guidance if I couldn't get a technique. I was all alone on my journey.</p>
              <p>That's why I started the Piped Peony Academy. I wanted to build a path for anyone who had a desire and will to learn the craft. Most importantly, I wanted to price it to be affordable, and I wanted to be there to offer guidance and support.</p>
            </div>
            <div className="about-button-wrapper">
              <Link href="/meet-dara">
                <Button variant="cta">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="about-line-decoration">

            <img src="/dara-about.jpeg" alt="Dara" className="about-line-image" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return <TestimonialsCarousel />;
}

// Function to get Vimeo thumbnail URL
function getVimeoThumbnail(videoId: string, size: 'small' | 'medium' | 'large' = 'large'): string {
  if (!videoId) return '';
  
  const sizeMap = {
    small: '200x150',
    medium: '640x480', 
    large: '1280x720'
  };
  
  return `https://vumbnail.com/${videoId}_${sizeMap[size]}.jpg`;
}

function LatestVideosSection({ courses }: { courses: any[] }) {
  return (
    <section className="latest-videos-section !py-8 md:!py-16">
      <div className="container latest-videos-content !px-4">
        <h2 className="latest-videos-title">Our Latest Videos</h2>
      </div>
      <div className="latest-videos-divider">
        <div className="latest-videos-divider-line"></div>
      </div>
      <div className="container latest-videos-content !px-4">
        <p className="latest-videos-description">Check out our most recent videos for our academy members!</p>
        <div className="latest-videos-grid">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              href={`/courses/${course.slug}`}
              className="video-item"
            >
              <div className="video-item-image-wrapper">
                {course.featuredImage ? (
                  <Image 
                    src={course.featuredImage.url} 
                    alt={course.title} 
                    width={400} 
                    height={400} 
                    className="video-item-image" 
                  />
                ) : course.videoId ? (
                  <Image 
                    src={getVimeoThumbnail(course.videoId)} 
                    alt={course.title} 
                    width={400} 
                    height={400} 
                    className="video-item-image" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FBF9F6]">
                    <span className="text-6xl">🌸</span>
                  </div>
                )}
              </div>
              <h3 className="video-item-title">{course.title}</h3>
            </Link>
          ))}
        </div>
        <Link href="/video-library">
          <Button variant="cta">
            Learn More
          </Button>
        </Link>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="faq-section !py-8 md:!py-16">
      <div className="container !px-4">
        <div className="faq-grid">
          <div className="faq-header">
            <h3 className="faq-signature">FAQs</h3>
            <h2 className="faq-title">Frequently<br className="hidden md:block" /> Asked<br className="hidden md:block" /> Questions</h2>
            <Image
              src="/faq-lines.svg"
              alt=""
              width={213}
              height={213}
              className="faq-decoration"
            />
          </div>
          <div>
            <FaqAccordion />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="cta-section !py-12 md:!py-20">
      <Image
        src="/peak-though.jpeg"
        alt="Background of buttercream flowers"
        fill
        style={{ objectFit: 'cover' }}
        className="cta-background"
      />

      <div className="cta-content">
        <h2 className="cta-title">
          Join The Piped Peony<br />Academy Community!
        </h2>
        <Link href="/signup">
          <Button variant="light" className="button-cta">
            Sign up today
          </Button>
        </Link>
      </div>
    </section>
  );
}
