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
      <TestimonialsSection />
      <FaqSection />
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
            width={227}
            height={300}
            className="hero-academy-image"
          />
        </div>
        <div className="hero-academy-content">
          <h1 className="hero-academy-title">ACADEMY</h1>
          <div className="hero-academy-body">
            <p className="hero-academy-subtitle">Get started with a 7-day free trial!</p>
            <p className="hero-academy-pricing">No contract membership for only $15 a month.</p>
            <div className="hero-academy-cta-wrapper">
              <Button variant="cta">
                Sign up for 7 free days
              </Button>
            </div>
            <p className="hero-academy-description">
              By signing up you agree to The Piped Peony's <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
        <div className="hero-academy-image-right">
          <Image
            src="/aca-imgright.png"
            alt="Decorated cake with buttercream flowers"
            width={400}
            height={300}
            className="hero-academy-image"
          />
        </div>
      </div>
    </section>
  );
}

function WhyPipedPeonySection() {
  const featuresColumn1 = [
    "Unlimited classes",
    "Techniques",
    "Exclusive recipes"
  ];
  
  const featuresColumn2 = [
    "Color mixing ideas",
    "Support & community",
    "No contract required"
  ];

  return (
    <section className="why-piped-peony-section">
      <div className="container">
        <div className="why-piped-peony-grid">
          <div className="why-piped-peony-content">
            <h2 className="why-piped-peony-title" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: '47px' }}>Why Piped Peony</h2>
            <p className="why-piped-peony-description">
              Whether you are a complete beginner or more advanced, our Academy has something to offer everyone looking to enhance their piping skills.
            </p>
            <div className="why-piped-peony-features-grid">
              <ul className="why-piped-peony-features-column">
                {featuresColumn1.map((feature, index) => (
                  <li key={index} className="why-piped-peony-feature">
                    <Image
                      src="/checkmark.svg"
                      alt="Checkmark"
                      width={21.5}
                      height={21.5}
                      className="why-piped-peony-checkmark"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <ul className="why-piped-peony-features-column">
                {featuresColumn2.map((feature, index) => (
                  <li key={index} className="why-piped-peony-feature">
                    <Image
                      src="/checkmark.svg"
                      alt="Checkmark"
                      width={21.5}
                      height={21.5}
                      className="why-piped-peony-checkmark"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
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
        <h2 className="featured-video-title" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: '47px' }}>Featured Video</h2>
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
  const features = [
    { title: "Watch Anytime, Anywhere", description: "Watch on-demand classes at your convenience, allowing for a more flexible and efficient learning experience." },
    { title: "Online Community & Support", description: "Upon joining, you will be granted access to a private Facebook group that provides you with the necessary support to acquire and enhance your piping skills." },
    { title: "Exclusive Recipes", description: "As a member, you will gain access to cake and piping recipes that will enhance the beauty and taste of your creations, including our exclusive Blooming Buttercream™ recipe." },
    { title: "New Monthly Content", description: "Stay ahead of the latest trends and seasons with new designs and the latest innovative techniques." },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="text-center mb-8 md:mb-12" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: '47px' }}>What You Get</h2>
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

function RecipeSection() {
  return (
    <section className="recipe-section">
      <div className="container">
        <div className="recipe-grid">
          <div className="recipe-content">
            <p className="recipe-signature">Recipe</p>
            <h2 className="recipe-title" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: '47px' }}>Blooming Buttercream™</h2>
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
              src="/blooming-pic.jpeg"
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
            <h2 className="video-series-title" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: '47px' }}>Video Series</h2>
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
