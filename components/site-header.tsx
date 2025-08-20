import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const navLinks = [
    { href: "#", label: "meet dara", id: "meet-dara" },
    { href: "/academy", label: "academy", id: "academy" },
    { href: "/blog", label: "blog", id: "blog" },
    { href: "#", label: "blooming buttercream™", id: "blooming-buttercream" },
    { href: "/shop", label: "shop", id: "shop" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#FBF9F6]/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-logo text-3xl md:text-4xl text-gray-800">
          The Piped Peony
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-sm font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="clean" size="icon">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Shopping Cart</span>
          </Button>
          <Button variant="clean">
            Sign up
          </Button>
          <Button variant="clean">
            Login
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="clean" size="icon">
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#FBF9F6]">
              <nav className="flex flex-col gap-6 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="text-lg font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 pt-4">
                   <Button variant="clean">
                    Sign up
                  </Button>
                  <Button variant="clean">
                    Login
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
