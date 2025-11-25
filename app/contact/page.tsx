import Image from "next/image"
import Link from "next/link"
import { Mail, Facebook, Instagram, MessageCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | The Piped Peony",
  description: "Get in touch with The Piped Peony Academy. Join our Facebook community or reach out via email.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Info Section - Left Side */}
          <div className="w-full">
            <h1 
              style={{ 
                fontFamily: 'Playfair Display, serif', 
                fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
                color: '#000000',
                lineHeight: '1.1',
                marginBottom: '2rem',
                fontWeight: 'normal'
              }}
            >
              CONTACT US
            </h1>
            
            <p className="text-lg text-gray-700 mb-8" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
              I'd love to hear from you! Here's how you can reach out:
            </p>

            {/* Academy Members Note */}
            <div className="mb-12 p-6 bg-[#FBF9F6] rounded-lg border-l-4 border-[#D4A771]">
              <h3 className="text-xl font-serif font-bold mb-3 text-gray-900">
                👋 Academy Members
              </h3>
              <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
                If you have technique or recipe-related questions, please post them in our Facebook group! 
                This helps Dara by reducing duplicate questions and allows other members to benefit too.
              </p>
              <Link 
                href="https://www.facebook.com/dpipedreams" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#D4A771] hover:text-[#C19660] font-medium transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Join The Piped Peony Academy Group
              </Link>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Get In Touch
              </h3>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4A771] rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email Us</h4>
                  <a 
                    href="mailto:mel@thepipedpeony.com" 
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    mel@thepipedpeony.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    We typically respond within 1-2 business days
                  </p>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Facebook</h4>
                  <Link 
                    href="https://www.facebook.com/dpipedreams" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    @dpipedreams
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Follow us for updates and inspiration
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instagram</h4>
                  <Link 
                    href="https://www.instagram.com/thepipedpeony/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    @thepipedpeony
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    See our latest creations and behind-the-scenes
                  </p>
                </div>
              </div>

              {/* Community Group */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4A771] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Community Support</h4>
                  <Link 
                    href="https://www.facebook.com/dpipedreams" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    Join our Facebook Group
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Connect with fellow bakers and get tips from Dara
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Response Times
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Email inquiries:</strong> We respond within 1-2 business days
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Facebook Group:</strong> Community support available 24/7
              </p>
              <p className="text-sm text-gray-600">
                <strong>Social Media:</strong> We check messages daily
              </p>
            </div>
          </div>

          {/* Image Section - Right Side */}
          <div className="w-full h-[500px] lg:h-full relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/Video-Library-Intermediate-thumbnail.jpg"
              alt="Beautiful yellow buttercream flower piping demonstration"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
