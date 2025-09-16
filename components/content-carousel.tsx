"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselItem } from "@/data/types";
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
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-8">
        {title}
      </h2>
      
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item, index) => (
              <CarouselItemComponent key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Link href={`/courses/${item.slug}`} className="block group">
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </CarouselItemComponent>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
            <ChevronLeft className="h-4 w-4" />
          </CarouselPrevious>
          
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
            <ChevronRight className="h-4 w-4" />
          </CarouselNext>
        </Carousel>
      </div>
    </section>
  );
}
