"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useUser } from "@/contexts/user-context";

export function LoggedInHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { getItemCount } = useCart();
  const { logout, user } = useUser();
  const cartItemCount = getItemCount();

  const handleLogout = () => {
    logout();
  };

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const coursesLinks = [
    { href: "/category/business-series", label: "Business Series" },
    { href: "/category/coloring-series", label: "Coloring Series" },
    { href: "/category/the-decorating-series", label: "The Decorating Series" },
    { href: "/category/the-graveyard-series", label: "The Graveyard Series" },
    { href: "/category/the-kids-series", label: "The Kids Series" },
    { href: "/category/the-recipe-series", label: "The Recipe Series" },
    { href: "/category/the-starter-series", label: "The Starter Series" },
    { href: "/courses", label: "View All" },
  ];

  const libraryLinks = [
    { href: "/colors", label: "Color Library" },
    { href: "/recipes", label: "Recipe Library" },
  ];

  const detailsLinks = [
    { href: "/academy-details#blooming-buttercream", label: "Blooming Buttercream™" },
    { href: "/about", label: "Meet Dara" },
    { href: "/supply-list", label: "Supply List" },
    { href: "/suppliers", label: "Suppliers" },
    { href: "/tip-guide", label: "Tip Guide" },
  ];

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
        
        {/* Desktop Navigation */}
        <nav className="header-nav">
          {/* Courses Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('courses')}
              className="header-nav-link flex items-center gap-1"
            >
              courses
              <ChevronDown className="h-4 w-4" />
            </button>
            {activeDropdown === 'courses' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-lg z-50">
                <div className="py-2">
                  {coursesLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-600 hover:text-white transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Library Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('library')}
              className="header-nav-link flex items-center gap-1"
            >
              library
              <ChevronDown className="h-4 w-4" />
            </button>
            {activeDropdown === 'library' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg z-50">
                <div className="py-2">
                  {libraryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-600 hover:text-white transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog (no dropdown) */}
          <Link href="/blog" className="header-nav-link">
            blog
          </Link>

          {/* Shop (no dropdown) */}
          <Link href="/shop" className="header-nav-link">
            shop
          </Link>

          {/* Details Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('details')}
              className="header-nav-link flex items-center gap-1"
            >
              details
              <ChevronDown className="h-4 w-4" />
            </button>
            {activeDropdown === 'details' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-lg z-50">
                <div className="py-2">
                  {detailsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-600 hover:text-white transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

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
          <span className="text-sm text-gray-600">Welcome, {user?.name}!</span>
          <Button variant="clean" className="!border-none" onClick={handleLogout}>
            logout
          </Button>
        </div>

        {/* Mobile Menu */}
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
                {/* Mobile Courses Section */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Courses</h3>
                  {coursesLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block py-1 pl-4 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Library Section */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Library</h3>
                  {libraryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block py-1 pl-4 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Other Links */}
                <Link href="/blog" className="header-nav-link mb-2">
                  blog
                </Link>
                <Link href="/shop" className="header-nav-link mb-4">
                  shop
                </Link>

                {/* Mobile Details Section */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Details</h3>
                  {detailsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block py-1 pl-4 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
                  <Link href="/cart" className="flex items-center gap-2 text-lg font-medium tracking-wider text-gray-600 hover:text-gray-900 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  <span className="text-sm text-gray-600">Welcome, {user?.name}!</span>
                  <Button variant="clean" className="!border-none" onClick={handleLogout}>
                    logout
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
}
