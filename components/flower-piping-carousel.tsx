"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

export function FlowerPipingCarousel() {
  const items = [
    { title: "Piping a Miniature Flower", image: "/placeholder_peony.jpg", alt: "Piped frosting flowers in a box" },
    { title: "The Sister House", image: "/placeholder.jpg", alt: "White-themed cake plate with piped flowers" },
    { title: "The Pipe One", image: "/placeholder_lily.jpg", alt: "Close-up of a piped white flower on green background" },
    { title: "Pie Palmallia", image: "/placeholder_oriental-lily.jpg", alt: "Reddish-pink flower on a wooden tray" },
    { title: "Buttercream Rosette", image: "/fullblorosetn.png", alt: "Buttercream rosette" },
    { title: "Eucalyptus Sprig", image: "/eucasprigtn.png", alt: "Eucalyptus sprig" },
    { title: "Video Preview 1", image: "/vidimgtn4.png", alt: "Video thumbnail 1" },
    { title: "Black Cake", image: "/archy-header-image.webp", alt: "Black cake header" },
    { title: "Shop Welcome", image: "/shop-welcome.png", alt: "Shop welcome" },
    { title: "Placeholder Peony Blue", image: "/placeholder_peony-blue.jpg", alt: "Blue peony placeholder" },
    { title: "Placeholder Orchid Pink", image: "/placeholder_orchid-pink.jpg", alt: "Orchid pink placeholder" },
    { title: "Placeholder Chrysanthemum", image: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum placeholder" },
  ]

  const [api, setApi] = useState<any>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [activeDot, setActiveDot] = useState(0)

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
        <h2 className="flower-piping-title">Flower Piping</h2>

        <div className="flower-piping-fixed">
          <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="flower-carousel-fixed-content">
              {items.map((item, index) => (
                <CarouselItem key={index} className="flower-carousel-fixed-item">
                  <Link href="/category/the-flower-piping-series" className="block">
                    <div className="flower-item-wrapper">
                      <div className="flower-image-wrapper">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          width={400}
                          height={400}
                          className="flower-image"
                        />
                      </div>
                      <div className="flower-item-content">
                        <h3 className="flower-item-title">{item.title}</h3>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant="clean" className="flower-nav-btn left-0 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext variant="clean" className="flower-nav-btn right-0 top-1/2 -translate-y-1/2 z-10" />
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
          <Link href="/category/the-flower-piping-series">
            <Button variant="clean" className="border border-black bg-white text-black px-6 py-2">view all flower piping videos</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


