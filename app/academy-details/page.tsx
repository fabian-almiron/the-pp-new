import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq-accordion";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

export default function AcademyDetailsPage() {
  return (
    <>
      <HeroAcademySection />
      <WhyPipedPeonySection />
      <FeaturedVideoSection />
      <WhatYouGetSection />
      <RecipeSection />
      <VideoSeriesSection />
      <CommunityTestimonialsSection />
      <FaqSection />
      <TestimonialsSection />
    </>
  );
}

function HeroAcademySection() {
  return (
    <section className="hero-academy-section">
      <div className="hero-academy-grid">
        <div className="hero-academy-image-left">
          <Image
            src="/flowers-leftacdm-227x300.png"
            alt="Beautiful buttercream flowers"
            fill
            style={{ objectFit: 'cover' }}
            className="hero-academy-image"
          />
        </div>
        <div className="hero-academy-content">
          <h1 className="hero-academy-title">ACADEMY</h1>
          <p className="hero-academy-subtitle">Get started with a 7-day free trial!</p>
          <div className="hero-academy-cta-wrapper">
            <Button variant="cta">
              See what's included
            </Button>
          </div>
          <p className="hero-academy-description">
            Becoming an expert in the Piped Peony's School of
            Buttercream Artistry takes time, but with our proven
            method you'll be creating beautiful designs in no time.
          </p>
        </div>
        <div className="hero-academy-image-right">
          <Image
            src="/aca-imgright.png"
            alt="Decorated cake with buttercream flowers"
            fill
            style={{ objectFit: 'cover' }}
            className="hero-academy-image"
          />
        </div>
      </div>
    </section>
  );
}

function WhyPipedPeonySection() {
  const features = [
    "Get your questions answered",
    "Learn at any pace",
    "Access exclusive recipes",
    "Supportive community",
    "Monthly new content"
  ];

  return (
    <section className="why-piped-peony-section">
      <div className="container">
        <div className="why-piped-peony-grid">
          <div className="why-piped-peony-content">
            <h2 className="why-piped-peony-title">Why Piped Peony</h2>
            <p className="why-piped-peony-description">
              Whether you are a complete beginner or more advanced, our Academy has something to offer everyone looking to enhance their piping skills.
            </p>
            <ul className="why-piped-peony-features">
              {features.map((feature, index) => (
                <li key={index} className="why-piped-peony-feature">
                  <span className="why-piped-peony-checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="why-piped-peony-image">
            <Image
              src="/dara-about.jpeg"
              alt="Dara working on cake decoration"
              width={400}
              height={500}
              className="why-piped-peony-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedVideoSection() {
  return (
    <section className="featured-video-section">
      <div className="container">
        <h2 className="featured-video-title">Featured Video</h2>
        <div className="featured-video-wrapper">
          {/* Placeholder for video - will be replaced with actual video embed */}
          <div className="featured-video-placeholder">
            <div className="featured-video-play-button">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.9"/>
                <polygon points="10,8 16,12 10,16" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatYouGetSection() {
  const benefits = [
    {
      title: "Weekly Meetings & Updates",
      description: "Join our weekly live meetings where we discuss techniques, answer questions, and share updates on new content and seasonal designs."
    },
    {
      title: "Unlimited Community & Support",
      description: "Access to our private Facebook community where you can share your work, get feedback, and connect with fellow bakers from around the world."
    },
    {
      title: "Exclusive Recipes",
      description: "Get access to our signature Blooming Buttercream™ recipe and other exclusive formulations that make your flowers look more realistic."
    },
    {
      title: "New Monthly Content",
      description: "Fresh content every month including seasonal designs, new techniques, and trending piping styles to keep your skills current."
    }
  ];

  return (
    <section className="what-you-get-section">
      <div className="container">
        <h2 className="what-you-get-title">What You Get</h2>
        <div className="what-you-get-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="what-you-get-card">
              <h3 className="what-you-get-card-title">{benefit.title}</h3>
              <p className="what-you-get-card-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecipeSection() {
  return (
    <section className="recipe-section">
      <div className="container">
        <div className="recipe-grid">
          <div className="recipe-content">
            <p className="recipe-signature">Recipe</p>
            <h2 className="recipe-title">Blooming Buttercream™</h2>
            <p className="recipe-description">
              Our exclusive Blooming Buttercream™ recipe is what sets our flowers apart from others you've seen online. This special formulation creates flowers that look incredibly realistic and have the perfect consistency for piping.
            </p>
            <p className="recipe-description">
              Available exclusively to Academy members, this recipe has been perfected over years of testing and refinement.
            </p>
            <Button variant="cta">
              Get the recipe
            </Button>
          </div>
          <div className="recipe-image">
            <Image
              src="/fullblorosetn.png"
              alt="Blooming Buttercream flowers"
              width={400}
              height={400}
              className="recipe-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoSeriesSection() {
  return (
    <section className="video-series-section">
      <div className="container">
        <div className="video-series-grid">
          <div className="video-series-image">
            <Image
              src="/video-series-cutting-cake-235x300.png"
              alt="Instructor cutting decorated cake"
              width={300}
              height={400}
              className="video-series-img"
            />
          </div>
          <div className="video-series-content">
            <h2 className="video-series-title">Video Series</h2>
            <p className="video-series-description">
              Follow along with our comprehensive video series that takes you step-by-step through each technique. From basic piping to advanced flower arrangements, our videos are designed to help you learn at your own pace.
            </p>
            <div className="video-series-list">
              <div className="video-series-item">• The Foundations Series</div>
              <div className="video-series-item">• Flower Fundamentals</div>
              <div className="video-series-item">• Advanced Arrangements</div>
              <div className="video-series-item">• Seasonal Specials</div>
              <div className="video-series-item">• Troubleshooting Guide</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityTestimonialsSection() {
  const testimonials = [
    {
      text: "I joined about 3 months ago and I was hesitant at first as I live in Canada. However, this experience has been incredible. Not only is Dara's teaching style accessible and engaging, but her community is so supportive.",
      author: "Ana K"
    },
    {
      text: "The instruction and community are both incredible. I recommend it to anyone wanting to learn or is currently learning the art of buttercream flowers.",
      author: "Samantha"
    },
    {
      text: "I'm so thankful I found this community. The support and encouragement has been amazing. Dara makes learning so much fun and easy to understand.",
      author: "Jessica M"
    },
    {
      text: "The comprehensive content and supportive community make this academy worth every penny. My piping skills have improved dramatically.",
      author: "Rose R"
    }
  ];

  return (
    <section className="community-testimonials-section">
      <div className="container">
        <h2 className="community-testimonials-title">
          The Go-To Community<br />
          of Thousands of Bakers
        </h2>
        <div className="community-testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="community-testimonial-card">
              <p className="community-testimonial-text">"{testimonial.text}"</p>
              <p className="community-testimonial-author">- {testimonial.author}</p>
            </div>
          ))}
        </div>
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

function TestimonialsSection() {
  return <TestimonialsCarousel />;
}
