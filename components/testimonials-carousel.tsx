"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export function TestimonialsCarousel() {
  const testimonialImages = [
    { name: "Amy", image: "/amy-slide.png" },
    { name: "Barbara D", image: "/barbara-d-slide.png" },
    { name: "Danae M", image: "/daniel-m-slide.png" },
    { name: "Julie", image: "/julie-slide.png" },
    { name: "Aja", image: "/aja_slide.png" },
    { name: "Brianna", image: "/brianna_slide.png" },
    { name: "Chanel Ray", image: "/chanel_ray_slide.png" },
    { name: "Melissa M", image: "/melissa_m_slide.png" },
    { name: "Natalie", image: "/natalie_slide.png" },
    { name: "Sweet Art", image: "/sweet_art_slide.png" },
  ];

  const [api, setApi] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive calculations
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive values based on screen size
  const getResponsiveValues = () => {
    if (windowWidth >= 1024) {
      // Desktop: 4 images visible, move by 3
      return { imagesVisible: 4, stepSize: 3 };
    } else if (windowWidth >= 768) {
      // Tablet: 3 images visible, move by 2
      return { imagesVisible: 3, stepSize: 2 };
    } else {
      // Mobile: 1 image visible, move by 1
      return { imagesVisible: 1, stepSize: 1 };
    }
  };

  const { imagesVisible, stepSize } = getResponsiveValues();
  
  // Calculate how many dots we need based on screen size
  const totalDots = Math.ceil((testimonialImages.length - imagesVisible + 1) / stepSize);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const selected = api.selectedScrollSnap();
      setCurrentSlide(selected);
    };

    api.on('select', onSelect);
    onSelect();

    return () => api.off('select', onSelect);
  }, [api]);

  const scrollToPosition = (dotIndex) => {
    if (api) {
      const targetSlide = dotIndex * stepSize;
      api.scrollTo(targetSlide);
    }
  };

  // Determine which dot should be active based on current slide
  const activeDot = Math.floor(currentSlide / stepSize);

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        {/* Mobile: Centered title without line */}
        <div className="block md:hidden text-center mb-12">
          <h2 className="testimonials-title text-black mb-0 leading-tight text-center">A Community of<br />Thousands of Bakers</h2>
        </div>
        
        {/* Tablet and Desktop: Grid with line */}
        <div className="hidden md:grid grid-cols-5 items-center mb-12 gap-8">
          <div className="col-span-3 flex justify-center">
            <div className="w-full h-px bg-black"></div>
          </div>
          <div className="col-span-2 text-center">
            <h2 className="testimonials-title text-black mb-0 leading-tight">A Community of<br />Thousands of Bakers</h2>
          </div>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="testimonials-carousel"
        >
          <CarouselContent className="testimonials-carousel-content">
            {testimonialImages.map((testimonial, index) => (
              <CarouselItem key={index} className="testimonials-carousel-item">
                <div className="testimonial-image-wrapper">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name} testimonial`}
                    width={600}
                    height={400}
                    className="testimonial-carousel-image"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Dot Navigation */}
        <div className="testimonials-dots-container">
          {Array.from({ length: totalDots }, (_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => scrollToPosition(dotIndex)}
              className={`testimonials-dot ${activeDot === dotIndex ? 'active' : ''}`}
              aria-label={`Go to position ${dotIndex * stepSize + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
