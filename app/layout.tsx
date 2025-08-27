import type { Metadata } from "next";
import { Playfair_Display, Lato, Dancing_Script, Inter } from 'next/font/google';
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/contexts/cart-context";
import { UserProvider } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { HomePageLines } from "@/components/home-page-lines";
import { ShopShadowBorders } from "@/components/shop-shadow-borders";

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
  description: "Learn, grow, and bloom together with helpful piping tutorials that take your skills to new heights."
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
          <UserProvider>
            <CartProvider>
              <HomePageLines />
              <ShopShadowBorders />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </CartProvider>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
