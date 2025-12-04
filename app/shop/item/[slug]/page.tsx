import { fetchProductBySlug, fetchProducts } from "@/lib/strapi-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";
import { ProductSchema } from "@/components/structured-data";

// Use ISR: Revalidate every 10 minutes (products don't change often)
export const revalidate = 600; // 10 minutes

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const { data: products } = await fetchProducts();
    if (!products) return [];
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

// Helper to strip HTML tags for metadata
function stripHtmlForMeta(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const { data: product } = await fetchProductBySlug(slug);
    
    if (!product) {
      return {
        title: 'Product Not Found | The Piped Peony',
      };
    }

    // Use shortDescription (already cleaned) or strip HTML from longDescription/description
    const description = product.shortDescription || 
                       stripHtmlForMeta(product.longDescription) || 
                       stripHtmlForMeta(product.description) || 
                       `Shop ${product.name} at The Piped Peony`;

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
    const { data: product, error } = await fetchProductBySlug(slug);
    
    if (error || !product) {
      notFound();
    }

    // Strip HTML from descriptions for structured data
    const cleanDescription = product.shortDescription || 
                            stripHtmlForMeta(product.longDescription) || 
                            stripHtmlForMeta(product.description) || 
                            '';

    return (
      <>
        <ProductSchema
          name={product.name}
          description={cleanDescription}
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
    console.error('Error loading product:', error);
    notFound();
  }
}

