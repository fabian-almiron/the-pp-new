import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowerPipingCarousel } from "@/components/flower-piping-carousel";
import { fetchCourses } from "@/lib/strapi-api";
import { NewestVideosCarousel } from "./newest-videos-carousel";

export default async function VideoLibraryPage() {
  // Fetch latest courses from Strapi
  const coursesResponse = await fetchCourses({ 
    pageSize: 12, 
    sort: 'publishedAt:desc' 
  });
  
  const courses = coursesResponse.data || [];

  return (
    <>
      <VideoLibraryHero />
      <DifficultyLevels />
      <NewestVideosCarousel courses={courses} />
      <VideoSeriesSection />
      <FlowerPipingCarousel />
      <BusinessSeriesSection />
    </>
  );
}

function VideoLibraryHero() {
  return (
    <section 
      className="w-full py-12 md:py-24 lg:py-32 bg-white bg-cover bg-center"
      style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl text-black mb-4 leading-tight">
          <span className="block text-3xl md:text-4xl lg:text-5xl font-light mb-2">Welcome To The</span>
          VIDEO LIBRARY
        </h1>
        <p className="max-w-2xl mx-auto text-black font-sofia text-base md:text-lg mt-6 leading-relaxed">
          Watch our academy's videos to stay up-to-date on the latest
          techniques, trends, and piping recipes.
        </p>
      </div>
    </section>
  );
}

function DifficultyLevels() {
  const difficultyLevels = [
    {
      title: "Beginner",
      image: "/placeholder_daisy.jpg",
      alt: "Beginner level tutorials featuring simple cake decorating techniques"
    },
    {
      title: "Intermediate", 
      image: "/placeholder_lily.jpg",
      alt: "Intermediate level tutorials with advanced piping techniques"
    },
    {
      title: "Advanced",
      image: "/placeholder_rose-pink.jpg", 
      alt: "Advanced level tutorials for expert cake decoration"
    }
  ];

  return (
    <section className="featuredvl-section w-full py-12 md:py-24 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto px-4 md:px-6">
        {difficultyLevels.map((level, index) => (
          <div 
            key={index} 
            className="relative bg-white cursor-pointer transition-all duration-300 border border-black hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative w-full h-64 md:h-64 overflow-hidden">
              <Image
                src={level.image}
                alt={level.alt}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bg-white bottom-0 left-0 right-0 bg-black  text-center py-3 px-4">
                <h3 className="font-playfair  md:text-2xl text-black font-normal">
                  {level.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// NewestVideos component moved to separate client component file for carousel functionality

function VideoSeriesSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="font-playfair text-4xl md:text-5xl text-black font-normal mb-8 text-center">
          Video Series
        </h2>
        <div className="flex justify-center items-center">
          <div className="max-w-4xl w-full bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center order-1">
                <h3 className="font-playfair text-3xl md:text-4xl text-black font-normal mb-2">
                  Coloring
                </h3>
                <p className="font-sofia text-sm text-gray-600 mb-4 uppercase tracking-wide">
                  10 parts
                </p>
                <p className="font-sofia text-base text-black leading-relaxed mb-6">
                  By utilizing the color wheel and the three primary colors, you
                  can discover the art of creating secondary and tertiary
                  colors with ease.
                </p>
                <div className="mt-auto">
                  <Link href="/category/coloring-series">
                    <Button variant="clean">View Series</Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden order-2">
                <div className="relative w-full h-80 md:h-96">
                  <Image
                    src="/coloring-300x161.jpg"
                    alt="Coloring series featuring cake decorating with color techniques"
                    width={655}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <Button variant="default">View All Series</Button>
        </div>
      </div>
    </section>
  );
}

function BusinessSeriesSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="font-playfair text-4xl md:text-5xl text-black font-normal mb-8 text-center">
          Business Series
        </h2>
        <div className="flex justify-center items-center">
          <div className="max-w-4xl w-full bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center order-1">
                <h3 className="font-playfair text-3xl md:text-4xl text-black font-normal mb-4">
                  Business Series
                </h3>
                <p className="font-sofia text-base text-black leading-relaxed mb-6">
                  We know that to truly be successful, you must master the business side of your craft. From pricing and branding to client management and growth strategies, this series guides you through building a sustainable business.
                </p>
                <div className="mt-auto">
                  <Link href="/category/business-series">
                    <Button variant="default">View Series</Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden order-2">
                <div className="relative w-full h-80 md:h-96">
                  <Image
                    src="/academy-dara.png"
                    alt="Instructor smiling while working on a decorated cake"
                    width={655}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
