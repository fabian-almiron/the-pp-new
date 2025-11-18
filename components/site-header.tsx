"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { LoggedInHeader } from "@/components/logged-in-header";
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import Navigation from '@/components/navigation';
import { SearchDialog } from '@/components/search-dialog';
import { useState, useEffect } from 'react';

export function SiteHeader() {
  const { isSignedIn, isLoaded } = useClerkUser();
  
  // Show logged-in header for authenticated users
  if (isLoaded && isSignedIn) {
    return <LoggedInHeader />;
  }

  // Show regular header (will handle both loading and non-authenticated states)
  return (
    <LoggedOutHeader />
  );
}

function LoggedOutHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getItemCount } = useCart();
  const { isSignedIn } = useClerkUser();
  const { signOut } = useClerk();
  const cartItemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FBF9F6]" style={{ borderColor: '#70707099' }}>
      <div className="header-container">
        <Link href="/" className="header-logo">
          <div className="relative">
            {/* Mobile logo - HD version */}
            <Image
              src="/piped-peony-logo-2048x452.png"
              alt="The Piped Peony"
              width={160}
              height={35}
              className="h-12 w-auto md:hidden"
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
        <Navigation 
          menuSlug="header" 
          className="header-nav"
        />
        <div className="header-actions">
          <SearchDialog />
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
          {isSignedIn ? (
            <>
              <Link href="/my-account">
                <Button variant="clean" className="!border-none">
                  my account
                </Button>
              </Link>
              <Button variant="clean" className="!border-none" onClick={handleLogout}>
                logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button variant="clean" className="!border-none !bg-[#f1eae6]">
                  sign up
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="clean" className="!border-none">
                  login
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="header-mobile-menu">
          {mounted && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="clean" size="icon" className="!border-0 hover:bg-transparent">
                  <Menu className="text-gray-700" style={{ width: '1.5rem', height: '1.5rem' }} />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[380px] bg-white p-0 flex flex-col">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                
                {/* Drawer Header */}
                <div className="px-6 py-5 bg-[#FBF9F6] border-b border-gray-200">
                  <Image
                    src="/piped-peony-logo-1536x339.png"
                    alt="The Piped Peony"
                    width={140}
                    height={31}
                    className="h-10 w-auto"
                  />
                </div>

                {/* Scrollable Navigation Section */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <Navigation 
                    menuSlug="header" 
                    className="mobile-drawer-nav"
                    onLinkClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>

                {/* Drawer Footer - Fixed Actions */}
                <div className="mt-auto border-t border-gray-200 bg-white px-4 py-4 space-y-3">
                  {/* Cart Button */}
                  <Link 
                    href="/cart" 
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#FBF9F6] hover:bg-[#f1eae6] transition-all duration-200 group shadow-sm" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3 font-medium text-gray-800 group-hover:text-gray-900">
                      <ShoppingCart className="h-5 w-5 text-[#D4A771]" />
                      Shopping Cart
                    </span>
                    {cartItemCount > 0 && (
                      <span className="bg-[#D4A771] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>

                  {/* Auth Buttons */}
                  {isSignedIn ? (
                    <div className="flex gap-2">
                      <Link 
                        href="/my-account" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1"
                      >
                        <button className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 shadow-sm">
                          My Account
                        </button>
                      </Link>

                      <button 
                        className="flex-1 px-4 py-3.5 rounded-xl bg-[#D4A771] hover:bg-[#C69963] text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link 
                        href="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1"
                      >
                        <button className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 shadow-sm">
                          Login
                        </button>
                      </Link>

                      <Link 
                        href="/signup" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1"
                      >
                        <button className="w-full px-4 py-3.5 rounded-xl bg-[#D4A771] hover:bg-[#C69963] text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
          {!mounted && (
            <Button variant="clean" size="icon" className="!border-0 hover:bg-transparent">
              <Menu className="text-gray-700" style={{ width: '1.5rem', height: '1.5rem' }} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
