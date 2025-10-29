"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Category } from "@/lib/strapi-api"

interface FlowerPipingCarouselProps {
  categories: Category[];
}

export function FlowerPipingCarousel({ categories }: FlowerPipingCarouselProps) {
  const items = categories || []

  const [api, setApi] = useState<any>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [activeDot, setActiveDot] = useState(0)

  // Don't render if no categories
  if (items.length === 0) {
    return null
  }

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const getResponsiveValues = () => {
    if (windowWidth >= 1024) return { imagesVisible: 4, stepSize: 3 }
    if (windowWidth >= 768) return { imagesVisible: 3, stepSize: 2 }
    return { imagesVisible: 1, stepSize: 1 }
  }

  const { imagesVisible, stepSize } = getResponsiveValues()
  const totalDots = Math.ceil((items.length - imagesVisible + 1) / stepSize)

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      const selected = api.selectedScrollSnap()
      const nextDot = Math.min(
        Math.floor(selected / stepSize),
        Math.max(totalDots - 1, 0)
      )
      setActiveDot(nextDot)
    }
    api.on("select", onSelect)
    onSelect()
    return () => api.off("select", onSelect)
  }, [api, stepSize, totalDots])

  const scrollToPosition = (dotIndex: number) => {
    if (!api) return
    api.scrollTo(dotIndex * stepSize)
  }

  return (
    <section className="flower-piping-section">
      <div className="flower-piping-content">
        <h2 className="flower-piping-title">Browse by Category</h2>

        <div className="flower-piping-fixed">
          <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="flower-carousel-fixed-content">
              {items.map((item, index) => (
                <CarouselItem key={index} className="flower-carousel-fixed-item">
                  <Link href={`/category/${item.slug}`} className="block group">
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                      {/* Category Image */}
                      <div className="relative h-56 bg-[#FBF9F6] overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image.url}
                            alt={item.image.alternativeText || item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🌸</span>
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#D4A771]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Category Title */}
                      <div className="p-5 flex items-center justify-center">
                        <h3 className="font-playfair text-xl text-black group-hover:text-[#D4A771] transition-colors text-center font-normal">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              variant="clean" 
              className="flower-nav-btn left-0 top-1/2 -translate-y-1/2 z-10 !rounded-full h-10 w-10 border-2 border-gray-300 bg-white hover:bg-[#D4A771] hover:border-[#D4A771] hover:text-white transition-all shadow-md" 
            />
            <CarouselNext 
              variant="clean" 
              className="flower-nav-btn right-0 top-1/2 -translate-y-1/2 z-10 !rounded-full h-10 w-10 border-2 border-gray-300 bg-white hover:bg-[#D4A771] hover:border-[#D4A771] hover:text-white transition-all shadow-md" 
            />
          </Carousel>
        </div>

        <div className="flower-carousel-indicators">
          {Array.from({ length: totalDots }, (_, i) => (
            <button
              key={i}
              onClick={() => scrollToPosition(i)}
              className={`dot ${activeDot === i ? "active" : ""}`}
              aria-label={`Go to position ${i * stepSize + 1}`}
            />
          ))}
        </div>

        <div className="flower-piping-cta">
          <Link href="/courses">
            <Button variant="clean" className="border border-black bg-white text-black px-6 py-2">view all categories</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


