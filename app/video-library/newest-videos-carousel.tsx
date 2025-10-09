"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { StrapiCourse } from "@/data/types";

interface NewestVideosCarouselProps {
  courses: StrapiCourse[];
}

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

export function NewestVideosCarousel({ courses }: NewestVideosCarouselProps) {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="font-playfair text-4xl md:text-5xl text-black font-normal mb-8 text-center">
          Newest Videos
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {courses.length > 0 ? (
              courses.map((course) => {
                // Prioritize Vimeo thumbnail if videoId exists, otherwise use featuredImage or gallery
                const thumbnail = course.videoId 
                  ? getVimeoThumbnail(course.videoId)
                  : course.featuredImage?.url || 
                    course.gallery?.[0]?.url || 
                    "/placeholder_rose-pink.jpg";
                
                const altText = course.featuredImage?.alternativeText || 
                  course.gallery?.[0]?.alternativeText || 
                  course.title;

                return (
                  <CarouselItem 
                    key={course.id} 
                    className="flex-[0_0_100%] min-w-0 pl-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333333%] md:pl-4"
                  >
                    <Link href={`/courses/${course.slug}`} className="group relative block h-full">
                      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#D4A771] h-full flex flex-col">
                        {/* Course Image */}
                        <div className="relative h-56 bg-[#FBF9F6] overflow-hidden">
                          <Image
                            src={thumbnail}
                            alt={altText}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#D4A771] bg-opacity-90 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-100 group-hover:scale-110">
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                          </div>
                        </div>
                        
                        {/* Course Info */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-3 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          
                          {course.excerpt && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                              {course.excerpt}
                            </p>
                          )}
                          
                          {/* Course Meta */}
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <span className="text-sm text-[#D4A771] group-hover:text-[#C99860] font-medium">
                              Watch Now →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })
            ) : (
              // Fallback content if no courses
              <CarouselItem className="flex-[0_0_100%] min-w-0 pl-2">
                <div className="text-center py-12">
                  <p className="font-sofia text-gray-600">
                    No courses available at the moment. Check back soon!
                  </p>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
