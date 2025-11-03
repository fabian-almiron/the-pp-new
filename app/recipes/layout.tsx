import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Library | The Piped Peony - Exclusive Buttercream & Cake Recipes",
  description: "Discover delicious recipes for cakes, buttercream, and more. Access exclusive recipes including our signature Blooming Buttercream™ recipe and professional piping techniques.",
  keywords: ["buttercream recipe", "cake recipes", "blooming buttercream", "piping recipes", "cake decorating recipes", "flower buttercream recipe"],
  openGraph: {
    title: "Recipe Library | The Piped Peony",
    description: "Exclusive buttercream and cake recipes from expert instructor Dara",
    url: "https://thepipedpeony.com/recipes",
    siteName: "The Piped Peony",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Piped Peony Recipes",
    description: "Exclusive buttercream and cake recipes",
  },
  alternates: {
    canonical: "https://thepipedpeony.com/recipes",
  },
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

