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
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              The Piped Peony
            </h1>
            <p className="hero-description">
              The Piped Peony Academy is for everyone! We'll learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights.
            </p>
            <div className="hero-cta-wrapper">
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
      <div className="container">
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
    <section className="about-section">
      <div className="container">
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

function LatestVideosSection() {
  const videos = [
    { title: "The Eucalyptus Sprig", image: "/eucasprigtn.png" },
    { title: "The Full Bloom Rose", image: "/fullblorosetn.png" },
    { title: "The Berry Bling", image: "/vidimgtn4.png" },
  ];

  return (
    <section className="latest-videos-section">
      <div className="container latest-videos-content">
        <h2 className="latest-videos-title">Our Latest Videos</h2>
      </div>
      <div className="latest-videos-divider">
        <div className="latest-videos-divider-line"></div>
      </div>
      <div className="container latest-videos-content">
        <p className="latest-videos-description">Check out our most recent videos for our academy members!</p>
        <div className="latest-videos-grid">
          {videos.map((video) => (
            <div key={video.title} className="video-item">
              <div className="video-item-image-wrapper">
                <Image src={video.image} alt={video.title} width={400} height={400} className="video-item-image" />
              </div>
              <h3 className="video-item-title">{video.title}</h3>
            </div>
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
    <section className="faq-section">
      <div className="container">
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
    <section className="cta-section">
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
