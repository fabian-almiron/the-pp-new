import Link from "next/link"
import { Mail, Facebook, Instagram } from "lucide-react"
import type { Metadata } from "next"
import ContactForm from "@/components/contact-form"

// TikTok SVG Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Pinterest SVG Icon Component
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.14.5C5.86.5 2.7 5 2.7 8.75c0 2.27.86 4.3 2.7 5.05.3.12.57 0 .66-.33l.27-1.06c.1-.32.06-.44-.2-.73-.52-.62-.86-1.44-.86-2.6 0-3.33 2.5-6.32 6.5-6.32 3.55 0 5.5 2.17 5.5 5.07 0 3.8-1.7 7.02-4.2 7.02-1.4 0-2.44-1.16-2.1-2.58.4-1.7 1.16-3.52 1.16-4.74 0-1.1-.6-2-1.82-2-1.44 0-2.6 1.48-2.6 3.5 0 1.28.43 2.14.43 2.14l-1.76 7.44c-.5 2.1-.08 4.7-.04 4.96.02.16.22.2.3.1.14-.18 1.82-2.26 2.4-4.33.16-.58.93-3.63.93-3.63.46.88 1.8 1.65 3.22 1.65 4.25 0 7.13-3.87 7.13-9.05C20.5 4.15 17.18.5 12.14.5z"/>
  </svg>
)

export const metadata: Metadata = {
  title: "Contact Us | The Piped Peony",
  description: "Get in touch with The Piped Peony Academy. Send us a message using our contact form, join our Facebook community, or reach out via email.",
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
              I'd love to hear from you! Send a message and I'll get back to you as soon as possible.
            </p>

            {/* Academy Members Note */}
            <div className="mb-12 p-6 bg-[#FBF9F6] rounded-lg border-l-4 border-[#D4A771]">
              <h3 className="text-xl font-serif font-bold mb-3 text-gray-900">
                👋 Hello Piped Peony Academy Members!
              </h3>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
                We wanted to remind you that if you have any technique or recipe-related questions, please post them in our Facebook group, <strong>The Piped Peony Academy</strong>. This not only helps Dara by reducing the number of duplicate questions she receives, but it allows other members to benefit too!
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
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
                    href="https://www.facebook.com/share/g/1BkoEge94n/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    The Piped Peony Academy Group
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Join our community of bakers
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
                    href="https://www.instagram.com/thepipedpeony/?hl=en" 
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

              {/* TikTok */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <TikTokIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">TikTok</h4>
                  <Link 
                    href="https://www.tiktok.com/@thepipedpeonyacademy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    @thepipedpeonyacademy
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Watch our quick tips and tutorials
                  </p>
                </div>
              </div>

              {/* Pinterest */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E60023] rounded-full flex items-center justify-center">
                  <PinterestIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Pinterest</h4>
                  <Link 
                    href="https://www.pinterest.com/ideas/the-piped-peony/911367369654/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#D4A771] hover:text-[#C19660] transition-colors"
                  >
                    The Piped Peony
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Pin your favorite designs and ideas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section - Right Side */}
          <div className="w-full">
            <div className="sticky top-4 lg:top-8 bg-[#FBF9F6] rounded-lg p-8 shadow-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 
                style={{ 
                  fontFamily: 'Playfair Display, serif', 
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)', 
                  color: '#000000',
                  lineHeight: '1.2',
                  marginBottom: '1rem',
                  fontWeight: 'normal'
                }}
              >
                Send us a message
              </h2>
              <p className="text-gray-700 mb-8" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
                Fill out the form below and we'll get back to you within 1-2 business days.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
