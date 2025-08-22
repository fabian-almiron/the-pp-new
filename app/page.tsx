import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq-accordion";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
      <LatestVideosSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              The Piped Peony
            </h1>
            <p className="hero-description">
              The Piped Peony Academy is for everyone! We'll learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights.
            </p>
            <div className="hero-cta-wrapper">
              <Button size="lg" className="px-8 py-6 text-lg">
                Sign up for 7 free days
              </Button>
            </div>
          </div>
          <div className="hero-image-area relative z-20">
            <div className="hero-image-container">
              <div className="hero-image-frame">
                <Image
                  src="/archy-header-image.webp"
                  alt="Beautifully decorated cake with buttercream flowers"
                  fill
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
    <section className="features-section">
      <div className="features-container">
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
    <section className="w-full py-12 md:py-24 lg:py-32" style={{ backgroundColor: '#f2ece7' }}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Mobile: Centered content without line */}
        <div className="block md:hidden text-center">
          <h2 className="font-lindsey-signature text-4xl text-gray-700 mb-4">Nice to meet you!</h2>
          <h3 className="font-serif text-5xl md:text-6xl text-gray-800 mb-6">My name is Dara</h3>
          <div className="max-w-3xl mx-auto space-y-4">
            <p>I fell in love with buttercream flowers four years ago, inspired by my passion for food. Food is a love language that bonds family, friends and communities-there's a reason everyone gathers in the kitchen! I wanted to find a way to share food's beauty, and buttercream flowers were it!</p>
            <p>Learning to pipe buttercream flowers wasn't easy. First, I had to learn all about piping tips on my own, which felt like learning a whole new language. Then, I spent hours watching unhelpful videos that produced flowers that were flat and unrealistic looking. The hardest part? There was no one to turn to for guidance if I couldn't get a technique. I was all alone on my journey.</p>
            <p>That's why I started the Piped Peony Academy. I wanted to build a path for anyone who had a desire and will to learn the craft. Most importantly, I wanted to price it to be affordable, and I wanted to be there to offer guidance and support.</p>
          </div>
          <div className="mt-8">
            <Button size="lg" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Tablet and Desktop: Grid with line */}
        <div className="hidden md:grid grid-cols-3 items-start gap-8">
          <div className="col-span-1">
            <h2 className="font-lindsey-signature text-4xl text-gray-700 mb-4">Nice to meet you!</h2>
            <h3 className="font-serif text-5xl lg:text-6xl text-gray-800 mb-6">My name is Dara</h3>
            <div className="space-y-4">
              <p>I fell in love with buttercream flowers four years ago, inspired by my passion for food. Food is a love language that bonds family, friends and communities-there's a reason everyone gathers in the kitchen! I wanted to find a way to share food's beauty, and buttercream flowers were it!</p>
              <p>Learning to pipe buttercream flowers wasn't easy. First, I had to learn all about piping tips on my own, which felt like learning a whole new language. Then, I spent hours watching unhelpful videos that produced flowers that were flat and unrealistic looking. The hardest part? There was no one to turn to for guidance if I couldn't get a technique. I was all alone on my journey.</p>
              <p>That's why I started the Piped Peony Academy. I wanted to build a path for anyone who had a desire and will to learn the craft. Most importantly, I wanted to price it to be affordable, and I wanted to be there to offer guidance and support.</p>
            </div>
            <div className="mt-8">
              <Button size="lg" className="px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="col-span-2 flex justify-center items-start pt-16">
            <div className="w-full h-px bg-black"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return <TestimonialsCarousel />;
}

function LatestVideosSection() {
  const videos = [
    { title: "The Eucalyptus Sprig", image: "/placeholder.svg?width=400&height=400" },
    { title: "The Full Bloom Rose", image: "/placeholder.svg?width=400&height=400" },
    { title: "The Berry Bling", image: "/placeholder.svg?width=400&height=400" },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-gray-800 mb-4">Our Latest Videos</h2>
        <p className="text-gray-600 mb-12">Check out our most recent videos for our academy members!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {videos.map((video) => (
            <div key={video.title} className="group">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Image src={video.image || "/placeholder.svg"} alt={video.title} width={400} height={400} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="mt-4 font-serif text-xl text-gray-800">{video.title}</h3>
            </div>
          ))}
        </div>
        <Button size="lg"  className="px-8 py-6 text-lg">
          Learn More
        </Button>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="w-full bg-white py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="text-center md:text-left">
            <h3 className="font-lindsey-signature text-3xl text-gray-700 mb-2">FAQs</h3>
            <h2 className="font-serif text-4xl md:text-5xl text-gray-800">Frequently Asked Questions</h2>
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
    <section className="relative w-full h-[500px] flex items-center justify-center text-center text-white">
      <Image
        src="/placeholder.svg?width=1920&height=600"
        alt="Background of buttercream flowers"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10 p-4">
        <h2 className="font-serif text-4xl md:text-6xl mb-6">
          Join The Piped Peony<br />Academy Community!
        </h2>
        <Button size="lg" variant="light" className="px-8 py-6 text-lg">
          Sign up today
        </Button>
      </div>
    </section>
  );
}
