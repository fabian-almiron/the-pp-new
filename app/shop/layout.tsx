import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | The Piped Peony - Cake Decorating Supplies & Tools",
  description: "Browse our collection of premium cake decorating supplies, piping tools, and exclusive products. Everything you need to create beautiful buttercream flowers.",
  keywords: ["cake decorating supplies", "piping tools", "buttercream tools", "cake decorating products", "flower piping tools", "baking supplies"],
  openGraph: {
    title: "Shop | The Piped Peony",
    description: "Premium cake decorating supplies and piping tools",
    url: "https://thepipedpeony.com/shop",
    siteName: "The Piped Peony",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Piped Peony Shop",
    description: "Premium cake decorating supplies and tools",
  },
  alternates: {
    canonical: "https://thepipedpeony.com/shop",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

