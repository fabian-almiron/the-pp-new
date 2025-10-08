"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { LoggedInHeader } from "@/components/logged-in-header";
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import Navigation from '@/components/navigation';

export function SiteHeader() {
  const { isSignedIn, isLoaded } = useClerkUser();
  
  // Show logged-in header for authenticated users
  if (isLoaded && isSignedIn) {
    return <LoggedInHeader />;
  }

  // Show regular header (will handle both loading and non-authenticated states)
  return (
    <HeaderContent />
  );
}

function HeaderContent() {
  const { getItemCount } = useCart();
  const { isSignedIn } = useClerkUser();
  const { signOut } = useClerk();
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
              width={100}
              height={35}
              className="h-8 w-auto md:hidden"
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
          menuSlug="logged-out-header" 
          className="header-nav"
        />
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="clean" size="icon">
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#FBF9F6]">
              <nav className="flex flex-col pt-8">
                <Navigation 
                  menuSlug="logged-out-header" 
                  className="flex flex-col space-y-4"
                />
                <div className="flex flex-col gap-4 pt-4">
                  <Link href="/cart" className="flex items-center gap-2 text-lg font-medium tracking-wider text-gray-600 hover:text-gray-900 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  {isSignedIn ? (
                    <>
                      <Link href="/my-account">
                        <Button variant="clean" className="!border-none w-full">
                          my account
                        </Button>
                      </Link>
                      <Button variant="clean" className="!border-none w-full" onClick={handleLogout}>
                        logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button variant="clean" className="!border-none !bg-[#f1eae6] w-full">
                          sign up
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="clean" className="!border-none w-full">
                          login
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
