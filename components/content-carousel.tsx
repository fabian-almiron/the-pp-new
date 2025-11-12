"use client";

import Image from "next/image";
import Link from "next/link";
import { Video } from "lucide-react";
import { CarouselItem } from "@/data/types";
import { VimeoThumbnail } from "@/components/vimeo-thumbnail";
import {
  Carousel,
  CarouselContent,
  CarouselItem as CarouselItemComponent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ContentCarouselProps {
  items: CarouselItem[];
  title?: string;
}

export function ContentCarousel({ items, title = "Continue the Series" }: ContentCarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 mb-12">
      <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-8">
        {title}
      </h2>
      
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: items.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 pb-4">
            {items.map((item, index) => (
              <CarouselItemComponent key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link href={`/courses/${item.slug}`} className="block group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                    {/* Course Image */}
                    <div className="relative h-44 bg-[#FBF9F6]">
                      {item.videoId ? (
                        <VimeoThumbnail
                          videoId={item.videoId}
                          alt={item.title}
                          fallbackUrl={item.thumbnailUrl}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#D4A771]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Course Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Series Badge */}
                      {item.series && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          {item.series}
                        </p>
                      )}
                      
                      <h3 className="text-base font-bold mb-2 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2 min-h-[3rem]">
                        {item.title}
                      </h3>

                      {/* Course Description */}
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                          {item.excerpt}
                        </p>
                      )}

                      {/* Course Meta */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        {item.chapterCount && item.chapterCount > 0 ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Video className="w-4 h-4 text-[#D4A771]" />
                            <span className="font-medium">{item.chapterCount} chapter{item.chapterCount !== 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Video className="w-4 h-4 text-[#D4A771]" />
                            <span className="font-medium">Course</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-[#D4A771] group-hover:translate-x-1 transition-transform">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItemComponent>
            ))}
          </CarouselContent>
          
          {/* Navigation buttons centered below carousel */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <CarouselPrevious className="static translate-x-0 translate-y-0" />
            <CarouselNext className="static translate-x-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
