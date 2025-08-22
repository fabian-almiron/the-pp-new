import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, PinIcon as Pinterest, Youtube } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#FBF9F6] py-12" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start justify-end gap-2">
            <Link href="#" className="font-medium text-black hover:text-gray-700">Contact</Link>
            <Link href="#" className="font-medium text-black hover:text-gray-700">FAQs</Link>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center justify-center">
              <div className="relative">
                {/* Mobile footer logo */}
                <Image
                  src="/full-logo-1-768x135.png"
                  alt="The Piped Peony"
                  width={150}
                  height={26}
                  className="h-8 w-auto md:hidden"
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
            <div className="flex gap-4">
              <Link href="#"><Facebook className="h-5 w-5 text-black hover:text-gray-700" /></Link>
              <Link href="#"><Instagram className="h-5 w-5 text-black hover:text-gray-700" /></Link>
              <Link href="#"><Pinterest className="h-5 w-5 text-black hover:text-gray-700" /></Link>
              <Link href="#"><Youtube className="h-5 w-5 text-black hover:text-gray-700" /></Link>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end justify-end gap-2">
            <Link href="#" className="font-medium text-black hover:text-gray-700">Privacy Policy</Link>
            <Link href="#" className="font-medium text-black hover:text-gray-700">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-12 text-center text-xs text-gray-400" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
          © {new Date().getFullYear()} The Piped Peony. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
