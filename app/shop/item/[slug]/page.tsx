import { fetchProductBySlug } from "@/lib/strapi-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";
import { ProductSchema } from "@/components/structured-data";

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/${slug}`);
    const result = await response.json();
    const product = result.data;
    
    if (!product) {
      return {
        title: 'Product Not Found | The Piped Peony',
      };
    }

    const description = product.shortDescription || product.longDescription || product.description || `Shop ${product.name} at The Piped Peony`;

    return {
      title: `${product.name} | The Piped Peony Shop`,
      description,
      keywords: product.tags || [product.category, "cake decorating", "piping tools"],
      openGraph: {
        title: product.name,
        description,
        url: `https://thepipedpeony.com/shop/item/${slug}`,
        siteName: "The Piped Peony",
        images: product.images && product.images.length > 0 ? [
          {
            url: product.images[0].src,
            width: 1200,
            height: 630,
            alt: product.images[0].alt || product.name,
          },
        ] : [],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: product.images && product.images.length > 0 ? [product.images[0].src] : [],
      },
      alternates: {
        canonical: `https://thepipedpeony.com/shop/item/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found | The Piped Peony',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/${slug}`, {
      cache: 'no-store'
    });
    const result = await response.json();
    
    if (!result.data) {
      notFound();
    }

    const product = result.data;

    return (
      <>
        <ProductSchema
          name={product.name}
          description={product.shortDescription || product.longDescription || product.description || ''}
          image={product.images?.map((img: any) => img.src) || []}
          sku={product.sku || product.id.toString()}
          brand="The Piped Peony"
          price={product.price}
          priceCurrency="USD"
          availability={product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}
          url={`https://thepipedpeony.com/shop/item/${slug}`}
        />
        <ProductPageClient product={product} />
      </>
    );
  } catch (error) {
    notFound();
  }
}

