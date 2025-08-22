import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, PinIcon as Pinterest, Youtube } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#FBF9F6] py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="#" className="font-medium text-gray-700 hover:text-gray-900">Contact</Link>
            <Link href="#" className="font-medium text-gray-700 hover:text-gray-900">FAQs</Link>
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
                {/* Desktop footer logo */}
                <Image
                  src="/full-logo-1-1024x180.png"
                  alt="The Piped Peony"
                  width={200}
                  height={35}
                  className="hidden md:block h-10 w-auto"
                />
              </div>
            </Link>
            <p className="text-xs uppercase tracking-widest text-gray-500">Techniques. Recipes. Color. Support.</p>
            <div className="flex gap-4">
              <Link href="#"><Facebook className="h-5 w-5 text-gray-600 hover:text-gray-900" /></Link>
              <Link href="#"><Instagram className="h-5 w-5 text-gray-600 hover:text-gray-900" /></Link>
              <Link href="#"><Pinterest className="h-5 w-5 text-gray-600 hover:text-gray-900" /></Link>
              <Link href="#"><Youtube className="h-5 w-5 text-gray-600 hover:text-gray-900" /></Link>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <Link href="#" className="font-medium text-gray-700 hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="font-medium text-gray-700 hover:text-gray-900">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} The Piped Peony. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
