import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq-accordion";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

export default function AcademyPage() {
  return (
    <>
      <HeroLoggedInSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}

function HeroLoggedInSection() {
  return (
    <section className="academy-logged-in-hero">
      <div className="container">
        <div className="academy-logged-in-content">
          <h1 className="academy-logged-in-title">
            YOU'VE LOGGED IN!
          </h1>
          <p className="academy-logged-in-description">
            Welcome back to The Piped Peony Academy! You now have access to all our exclusive content, 
            tutorials, and community features. Start exploring your dashboard to continue your 
            buttercream artistry journey.
          </p>
          <div className="academy-logged-in-cta-wrapper">
            <Button variant="cta">
              Go to Dashboard
            </Button>
          </div>
        </div>
        <div className="academy-logged-in-image">
          <Image
            src="/archy-header-image.webp"
            alt="Beautiful decorated cake with buttercream flowers"
            width={600}
            height={400}
            className="academy-logged-in-img"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return <TestimonialsCarousel />;
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
