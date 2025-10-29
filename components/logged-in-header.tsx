"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { useClerk, useUser } from "@clerk/nextjs";
import Navigation from '@/components/navigation';
import { useState } from 'react';

export function LoggedInHeader() {
  const { getItemCount } = useCart();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = getItemCount();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FBF9F6]" style={{ borderColor: '#70707099' }}>
      <div className="header-container">
        <Link href="/" className="header-logo">
          <div className="relative">
            {/* Mobile logo - smaller size */}
            <Image
              src="/piped-peony-logo-1536x339.png"
              alt="The Piped Peony"
              width={120}
              height={40}
              className="h-10 w-auto md:hidden"
              priority
            />
            {/* Desktop logo - larger size */}
            <Image
              src="/piped-peony-logo-2048x452.png"
              alt="The Piped Peony"
              width={220}
              height={48}
              className="hidden md:block h-16 w-auto"
              priority
            />
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <Navigation 
          menuSlug="logged-in-header" 
          className="header-nav"
        />

        {/* Header Actions */}
        <div className="header-actions">
          <Link href="/cart">
            <Button variant="clean" size="icon" className="relative !border-none">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4A771] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </Link>
          <Link href="/my-account">
            <Button variant="clean" className="!border-none">
              my account
            </Button>
          </Link>
          <Button variant="clean" className="!border-none" onClick={handleLogout}>
            logout
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="header-mobile-menu">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="clean" size="icon">
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col h-full pt-8">
                {/* Logo */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <Image
                    src="/piped-peony-logo-1536x339.png"
                    alt="The Piped Peony"
                    width={150}
                    height={50}
                    className="h-12 w-auto"
                  />
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto">
                  <Navigation 
                    menuSlug="logged-in-header" 
                    className="flex flex-col space-y-2 mb-6"
                    onLinkClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 mt-auto">
                  <Link 
                    href="/cart" 
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#FBF9F6] hover:bg-[#f1eae6] transition-colors group" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-gray-900">
                      <ShoppingCart className="h-5 w-5 text-[#D4A771]" />
                      Cart
                    </span>
                    {cartItemCount > 0 && (
                      <span className="bg-[#D4A771] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    href="/my-account" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <button className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-[#FBF9F6] text-gray-700 font-medium transition-colors">
                      My Account
                    </button>
                  </Link>

                  <button 
                    className="w-full px-4 py-3 rounded-lg bg-[#D4A771] hover:bg-[#C69963] text-white font-medium transition-colors"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  >
                    Sign Out
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
