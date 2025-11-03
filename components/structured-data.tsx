import Script from 'next/script';

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  contactEmail?: string;
  socialProfiles?: string[];
}

export function OrganizationSchema({ 
  name, 
  url, 
  logo, 
  description, 
  contactEmail,
  socialProfiles = []
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    ...(contactEmail && { "email": contactEmail }),
    ...(socialProfiles.length > 0 && { "sameAs": socialProfiles }),
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CourseSchemaProps {
  name: string;
  description: string;
  provider: string;
  url: string;
  image?: string;
  instructor?: string;
}

export function CourseSchema({ 
  name, 
  description, 
  provider, 
  url, 
  image,
  instructor 
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider,
      "url": "https://thepipedpeony.com"
    },
    "url": url,
    ...(image && { "image": image }),
    ...(instructor && { 
      "instructor": {
        "@type": "Person",
        "name": instructor
      }
    }),
  };

  return (
    <Script
      id="course-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string[];
  sku?: string;
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: string;
  url: string;
}

export function ProductSchema({
  name,
  description,
  image = [],
  sku,
  brand = "The Piped Peony",
  price,
  priceCurrency = "USD",
  availability = "https://schema.org/InStock",
  url,
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    ...(image.length > 0 && { "image": image }),
    ...(sku && { "sku": sku }),
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": price.toFixed(2),
        "priceCurrency": priceCurrency,
        "availability": availability,
        "url": url
      }
    }),
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface RecipeSchemaProps {
  name: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeIngredient?: string[];
  recipeInstructions?: string[];
  author?: string;
  datePublished?: string;
}

export function RecipeSchema({
  name,
  description,
  image,
  prepTime,
  cookTime,
  totalTime,
  recipeYield,
  recipeIngredient = [],
  recipeInstructions = [],
  author = "Dara",
  datePublished,
}: RecipeSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": name,
    ...(description && { "description": description }),
    ...(image && { "image": image }),
    ...(prepTime && { "prepTime": prepTime }),
    ...(cookTime && { "cookTime": cookTime }),
    ...(totalTime && { "totalTime": totalTime }),
    ...(recipeYield && { "recipeYield": recipeYield }),
    "author": {
      "@type": "Person",
      "name": author
    },
    ...(recipeIngredient.length > 0 && { "recipeIngredient": recipeIngredient }),
    ...(recipeInstructions.length > 0 && { 
      "recipeInstructions": recipeInstructions.map(instruction => ({
        "@type": "HowToStep",
        "text": instruction
      }))
    }),
    ...(datePublished && { "datePublished": datePublished }),
  };

  return (
    <Script
      id="recipe-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = "Dara",
  url,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    ...(description && { "description": description }),
    ...(image && { "image": image }),
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Piped Peony",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thepipedpeony.com/piped-peony-logo-2048x452.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

