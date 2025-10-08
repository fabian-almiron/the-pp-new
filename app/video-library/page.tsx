import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { FlowerPipingCarousel } from "@/components/flower-piping-carousel";

export default function VideoLibraryPage() {
  return (
    <>
      <VideoLibraryHero />
      <DifficultyLevels />
      <NewestVideos />
      <VideoSeriesSection />
      <FlowerPipingCarousel />
      <BusinessSeriesSection />
    </>
  );
}

function VideoLibraryHero() {
  return (
    <section 
      className="video-library-hero"
      style={{ backgroundImage: 'url(/archive-header-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="video-library-hero-content">
        <h1 className="video-library-hero-title">
          <span className="vl-title-span">Welcome To The</span><br />
          VIDEO LIBRARY
        </h1>
        <p className="video-library-hero-subtitle">
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
    <section className="difficulty-levels-section">
      <div className="difficulty-levels-grid">
        {difficultyLevels.map((level, index) => (
          <div key={index} className="difficulty-level-card">
            <div className="difficulty-level-image-wrapper">
              <Image
                src={level.image}
                alt={level.alt}
                width={400}
                height={300}
                className="difficulty-level-image"
              />
              <div className="difficulty-level-overlay">
                <h3 className="difficulty-level-title">{level.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewestVideos() {
  const newestVideos = [
    {
      title: "Buttercream Rose Techniques",
      description: "Learn the fundamental techniques for creating beautiful buttercream roses.",
      thumbnail: "/placeholder_rose-pink.jpg",
      duration: "12:45"
    },
    {
      title: "Advanced Piping Methods",
      description: "Master advanced piping techniques for professional cake decoration.",
      thumbnail: "/placeholder_peony.jpg",
      duration: "18:30"
    },
    {
      title: "Color Theory for Cakes",
      description: "Understanding color combinations and gradients in cake design.",
      thumbnail: "/placeholder_orchid-pink.jpg",
      duration: "15:20"
    },
    {
      title: "Wedding Cake Basics",
      description: "Essential skills for creating stunning multi-tier wedding cakes.",
      thumbnail: "/placeholder_lily.jpg",
      duration: "22:15"
    },
    {
      title: "Fondant vs Buttercream",
      description: "Comparing techniques and when to use each decorating method.",
      thumbnail: "/placeholder_chrysanthemum.jpg",
      duration: "14:40"
    },
    {
      title: "Seasonal Flower Designs",
      description: "Create seasonal cake decorations with buttercream flowers.",
      thumbnail: "/placeholder_oriental-lily.jpg",
      duration: "16:55"
    }
  ];

  return (
    <section className="newest-videos-section">
      <div className="newest-videos-content">
        <h2 className="newest-videos-title">Newest Videos</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {newestVideos.map((video, index) => (
              <CarouselItem key={index} className="video-carousel-item">
                <Link href="/courses/the-black-cake-class" className="block">
                  <div className="video-item-wrapper">
                    <div className="video-thumbnail-wrapper">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={400}
                        height={200}
                        className="video-thumbnail"
                      />
                      <div className="video-play-overlay">
                        <Play className="video-play-icon" fill="white" />
                      </div>
                    </div>
                    <div className="video-item-content">
                      <h3 className="video-item-title">{video.title}</h3>
                      <p className="video-item-description">{video.description}</p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

// FlowerPipingSection refactored into FlowerPipingCarousel component

function VideoSeriesSection() {
  return (
    <section className="video-series-section-new">
      <div className="video-series-content">
        <h2 className="video-series-title">Video Series</h2>
        <div className="video-series-grid">
          <div className="video-series-card">
            <div className="video-series-link">
              <div className="video-series-card-content">
                <h3 className="video-series-card-title">Coloring</h3>
                <p className="video-series-card-parts">10 parts</p>
                <p className="video-series-card-description">
                  By utilizing the color wheel and the three primary colors, you
                  can discover the art of creating secondary and tertiary
                  colors with ease.
                </p>
                <div className="video-series-button-wrapper">
                  <Link href="/category/coloring-series">
                    <Button variant="clean">View Series</Button>
                  </Link>
                </div>
              </div>
              <div className="video-series-image-wrapper">
                <div className="video-series-image-container">
                  <Image
                    src="/coloring-300x161.jpg"
                    alt="Coloring series featuring cake decorating with color techniques"
                    width={655}
                    height={400}
                    className="video-series-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="video-series-view-all-wrapper">
          <Button variant="default">View All Series</Button>
        </div>
      </div>
    </section>
  );
}

function BusinessSeriesSection() {
  return (
    <section className="video-series-section-new">
      <div className="video-series-content">
        <h2 className="video-series-title">Business Series</h2>
        <div className="video-series-grid">
          <div className="video-series-card">
            <div className="video-series-link">
              <div className="video-series-card-content">
                <h3 className="video-series-card-title">Business Series</h3>
                <p className="video-series-card-description">
                  We know that to truly be successful, you must master the business side of your craft. From pricing and branding to client management and growth strategies, this series guides you through building a sustainable business.
                </p>
                <div className="video-series-button-wrapper">
                  <Link href="/category/business-series">
                    <Button variant="default">View Series</Button>
                  </Link>
                </div>
              </div>
              <div className="video-series-image-wrapper">
                <div className="video-series-image-container">
                  <Image
                    src="/academy-dara.png"
                    alt="Instructor smiling while working on a decorated cake"
                    width={655}
                    height={400}
                    className="video-series-image"
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
