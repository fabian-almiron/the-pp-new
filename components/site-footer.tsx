import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, PinIcon as Pinterest, Youtube } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Contact - order 3 on mobile */}
          <div className="footer-nav-section order-3 md:order-1">
            <Link href="#" className="footer-nav-link">Contact</Link>
            <Link href="#" className="footer-nav-link md:block hidden">FAQs</Link>
          </div>
          
          {/* FAQ - order 4 on mobile, hidden on desktop (shown in contact section) */}
          <div className="footer-nav-section order-4 md:hidden">
            <Link href="#" className="footer-nav-link">FAQs</Link>
          </div>
          <div className="footer-center-section order-1 md:order-2">
            <Link href="/" className="flex items-center justify-center">
              <div className="relative">
                {/* Mobile footer logo */}
                <Image
                  src="/full-logo-1-768x135.png"
                  alt="The Piped Peony"
                  width={300}
                  height={52}
                  className="h-16 w-auto md:hidden"
                />
                {/* Desktop footer logo - updated size and higher resolution */}
                <Image
                  src="/full-logo-1-1536x271.png"
                  alt="The Piped Peony"
                  width={689}
                  height={121}
                  className="hidden md:block w-auto max-w-[689px]"
                  style={{ height: '121px' }}
                />
              </div>
            </Link>
            <div className="footer-social-links order-2">
              <Link href="#" className="footer-social-link"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="footer-social-link"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="footer-social-link"><Pinterest className="h-5 w-5" /></Link>
              <Link href="#" className="footer-social-link"><Youtube className="h-5 w-5" /></Link>
            </div>
          </div>
          {/* Privacy Policy - order 5 on mobile */}
          <div className="footer-nav-section order-5 md:order-3">
            <Link href="#" className="footer-nav-link">Privacy Policy</Link>
            <Link href="#" className="footer-nav-link md:block hidden">Terms & Conditions</Link>
          </div>
          
          {/* Terms & Conditions - order 6 on mobile, hidden on desktop (shown in privacy section) */}
          <div className="footer-nav-section order-6 md:hidden">
            <Link href="#" className="footer-nav-link">Terms & Conditions</Link>
          </div>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} The Piped Peony. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
