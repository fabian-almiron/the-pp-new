import type { Metadata } from "next";
import { Playfair_Display, Lato, Dancing_Script, Inter } from 'next/font/google';
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Piped Peony",
  description: "Learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights.",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/apz5gqr.css" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-[#FBF9F6] font-sans antialiased",
          playfairDisplay.variable,
          lato.variable,
          dancingScript.variable,
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <CartProvider>
            {/* Vertical line - only going UP from intersection point (positive Y-axis) - hidden on mobile */}
            <div 
              className="absolute z-10 w-px pointer-events-none hidden md:block"
              style={{
                left: "calc(50% - 600px + 1rem)", // Center minus half container width plus left padding
                top: "0", // Start from top
                height: "calc(96px + 24px + 520px + 60px)", // Extended to new intersection point
                backgroundColor: "#707070"
              }}
            ></div>
            {/* Horizontal line - only going RIGHT from intersection point (positive X-axis) - hidden on mobile */}
            <div 
              className="absolute z-10 h-px pointer-events-none hidden md:block"
              style={{
                left: "calc(50% - 600px + 1rem)", // Start from vertical line intersection
                top: "calc(96px + 24px + 520px + 60px)", // Moved down 60px
                width: "800px", // Extended length - only going right
                backgroundColor: "#707070"
              }}
            ></div>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
