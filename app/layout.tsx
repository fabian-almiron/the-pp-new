import type { Metadata } from "next";
import { Playfair_Display, Lato, Dancing_Script, Inter, Alex_Brush } from 'next/font/google';
import Script from 'next/script';
import "./globals.css";
import "./mobile-header-fix.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { HomePageLines } from "@/components/home-page-lines";
import { ShopShadowBorders } from "@/components/shop-shadow-borders";
import { ClerkProvider } from '@clerk/nextjs';
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { SubscriptionStatusChecker } from "@/components/subscription-status-checker";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap", // Prevent invisible text while loading
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400", // Alex Brush only has one weight
  variable: "--font-alex-brush",
  display: "swap",
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Google Tag Manager - Loaded inline for fastest initialization */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WX96X4D');
          ` }} />
          {/* End Google Tag Manager */}
          
          {/* Preconnect to TypeKit for faster font loading */}
          <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
          {/* Load TypeKit asynchronously - load as print media then switch to all */}
          <link 
            rel="stylesheet" 
            href="https://use.typekit.net/apz5gqr.css" 
            media="print"
          />
          {/* Inline script to switch media to 'all' after load */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.querySelector('link[href*="typekit"]').media='all';
          ` }} />
        </head>
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            playfairDisplay.variable,
            lato.variable,
            dancingScript.variable,
            inter.variable,
            alexBrush.variable
          )}
        >
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe 
              src="https://www.googletagmanager.com/ns.html?id=GTM-WX96X4D"
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          {/* End Google Tag Manager (noscript) */}
          
          <div className="keyword-uptime" style={{ display: 'none' }}>c-squared-uptime</div>
          {/* Skip to main content link for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[#D4A771] focus:text-white focus:top-4 focus:left-4 focus:rounded-md"
          >
            Skip to main content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <SubscriptionStatusChecker />
            <CartProvider>
              <HomePageLines />
              <ShopShadowBorders />
              <SiteHeader />
              <main id="main-content" className="flex-1">{children}</main>
              <SiteFooter />
            </CartProvider>
          </div>
          <CookieConsentBanner />
          <Analytics />
          <SpeedInsights />
          
          {/* accessiBe - Loaded during idle time for minimal performance impact */}
          <Script
            id="accessibe-script"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  var s = document.createElement('script');
                  var h = document.querySelector('head') || document.body;
                  s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
                  s.async = true;
                  s.onload = function(){
                    acsbJS.init();
                  };
                  h.appendChild(s);
                })();
              `
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
