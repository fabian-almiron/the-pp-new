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
                      menuSlug="header" 
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

                    {isSignedIn ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/signup" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <button className="w-full px-4 py-3 rounded-lg bg-[#D4A771] hover:bg-[#C69963] text-white font-medium transition-colors">
                            Sign Up
                          </button>
                        </Link>

                        <Link 
                          href="/login" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <button className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-[#FBF9F6] text-gray-700 font-medium transition-colors">
                            Login
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
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
