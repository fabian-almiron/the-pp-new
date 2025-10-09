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
    <header className="w-full border-b bg-[#FBF9F6]" style={{ borderColor: '#70707099' }}>
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#FBF9F6]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col pt-8">
                <Navigation 
                  menuSlug="logged-in-header" 
                  className="flex flex-col space-y-4 mb-4"
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Mobile Actions */}
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
                  <Link href="/cart" className="flex items-center gap-2 text-lg font-medium tracking-wider text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  <Link href="/my-account" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="clean" className="!border-none w-full">
                      my account
                    </Button>
                  </Link>
                  <Button variant="clean" className="!border-none w-full" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    logout
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
