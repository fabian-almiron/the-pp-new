import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* About Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-grid">
          <div className="about-hero-image">
            <Image
              src="/about-header.webp"
              alt="Beautiful floral arrangement and Dana sitting with flowers"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="about-hero-content">
            <div className="about-hero-text">
              <h1 className="about-hero-title">ABOUT</h1>
              <div className="about-hero-description">
                <p className="about-hero-subtitle">
                  The Piped Peony Academy is for everyone!
                  <br />
                  We'll learn, grow, and bloom together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Goal Section */}
      <section className="about-goal-section">
        <div className="container">
          <div className="about-goal-grid">
            <div className="about-goal-title-wrapper">
              <h2 className="about-goal-title">
                OUR
                <br />
                —GOAL
              </h2>
            </div>

            <div className="about-goal-content">
              <p className="about-goal-text">
                Grow your flower piping skills and bloom as a baker with The Piped Peony Academy! With new biweekly
                content and 24/7 access to the video library, The Piped Peony Academy is your home for everything flower
                piping. As a self-taught expert, I have videos for beginners and piping pros alike. From roses to
                sunflowers, you'll have everything you need in one place. Let's start decorating!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dana Section */}
      <section className="about-dana-section">
        <div className="container">
          <div className="about-dana-grid">
            <div className="about-dana-text-content">
              <h2 className="about-dana-title">Dara</h2>

              <div className="about-dana-bio">
                <p>As a mom, wife, foodie, and artist, I turned my passion for flower piping into something more.</p>

                <p>
                  After watching endless unhelpful YouTube videos, I knew The Piped Peony Academy had the potential to
                  help cottage bakers of all skill levels. I wanted to create a place where bakers could naturally
                  connect with other decorators through our online community to share your creations and learn from
                  others.
                </p>

                <p>
                  One of my most exciting accomplishments is my signature Blooming Buttercream™, with the texture of
                  Korean buttercream with the flavor of American buttercream. It's perfect for creating every detail.
                </p>

                <p>Let's start decorating together — I'll be with you every step of the way!</p>
              </div>
            </div>

            <div className="about-dana-images">
              <Image
                src="/dara-about.jpeg"
                alt="Dana in her kitchen workspace with beautiful cake decorations"
                width={600}
                height={500}
                className="about-dana-image-single"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}