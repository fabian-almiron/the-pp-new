"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { useUser } from "@/contexts/user-context";
import { LoggedInHeader } from "@/components/logged-in-header";

export function SiteHeader() {
  const { isLoggedIn, loading } = useUser();
  
  // Show loading state
  if (loading) {
    return (
      <header className="w-full border-b bg-[#FBF9F6]" style={{ borderColor: '#70707099' }}>
        <div className="header-container">
          <div className="flex items-center justify-center w-full py-4">
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  // Show logged-in header for authenticated users
  if (isLoggedIn) {
    return <LoggedInHeader />;
  }

  // Show regular header for non-authenticated users
  const navLinks = [
    { href: "/about", label: "meet dara", id: "meet-dara" },
    { href: "/academy-details", label: "academy", id: "academy" },
    { href: "/blog", label: "blog", id: "blog" },
    { href: "#", label: "blooming buttercream™", id: "blooming-buttercream" },
    { href: "/shop", label: "shop", id: "shop" },
  ];

  return (
    <HeaderContent navLinks={navLinks} />
  );
}

interface NavLink {
  href: string;
  label: string;
  id: string;
}

function HeaderContent({ navLinks }: { navLinks: NavLink[] }) {
  const { getItemCount } = useCart();
  const { isLoggedIn, login, logout, user } = useUser();
  const cartItemCount = getItemCount();

  const handleQuickLogin = async () => {
    // Quick login for testing purposes
    await login("dara@pipedpeony.com");
  };

  const handleLogout = () => {
    logout();
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
              width={160}
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
              className="hidden md:block h-12 w-auto"
              priority
            />
          </div>
        </Link>
        <nav className="header-nav">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="header-nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
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
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-600">Welcome, {user?.name}!</span>
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
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="header-nav-link mb-4"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 pt-4">
                  <Link href="/cart" className="flex items-center gap-2 text-lg font-medium tracking-wider text-gray-600 hover:text-gray-900 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <span className="text-sm text-gray-600 px-4">Welcome, {user?.name}!</span>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
