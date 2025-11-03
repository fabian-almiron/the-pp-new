import Image from "next/image";
import Link from "next/link";
import { fetchRecipeBySlug } from "@/lib/strapi-api";
import { notFound } from "next/navigation";
import { Clock, ChefHat, Users, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeSchema } from "@/components/structured-data";
import { sanitizeHTML } from "@/lib/sanitize";

// Mark this page as dynamic
export const dynamic = 'force-dynamic';

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  
  const recipe = await fetchRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  // Extract ingredients and instructions for structured data
  const ingredients = recipe.ingredients 
    ? (Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map((item: any) => 
            typeof item === 'string' ? item : (item.ingredients_item || item.ingredientsItem || '')
          ).filter(Boolean)
        : []
      )
    : [];

  const instructions = recipe.important || recipe.instructions
    ? (Array.isArray(recipe.important) 
        ? recipe.important.map((item: any) => 
            typeof item === 'string' ? item : (item.important_items || item.importantItems || '')
          ).filter(Boolean)
        : (Array.isArray(recipe.instructions)
            ? recipe.instructions.map((item: any) =>
                typeof item === 'string' ? item : (item.instruction || '')
              ).filter(Boolean)
            : []
          )
      )
    : [];

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <RecipeSchema
        name={recipe.title}
        description={recipe.shortDescription || recipe.excerpt || ''}
        image={(recipe.featuredImage || recipe.coverImage)?.url}
        prepTime={recipe.prepTime}
        totalTime={recipe.time}
        recipeIngredient={ingredients}
        recipeInstructions={instructions}
        author={recipe.author || "Dara"}
        datePublished={recipe.publishedAt}
      />
      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/recipes">
            <Button variant="outline" className="border-[#D4A771] text-[#D4A771] hover:bg-[#D4A771] hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header with Image and Title */}
          {(recipe.featuredImage || recipe.coverImage) && (
            <div className="flex flex-col md:flex-row items-stretch bg-[#FBF9F6] border-b-4 border-black">
              <div className="relative w-full md:w-1/2 h-64 md:h-auto">
                <Image
                  src={(recipe.featuredImage || recipe.coverImage)!.url}
                  alt={(recipe.featuredImage || recipe.coverImage)!.alternativeText || recipe.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
                <h1 className="text-3xl md:text-5xl font-serif text-black text-center">
                  {recipe.headerTitle || recipe.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Method Label */}
            {recipe.methodLabel && (
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-black">{recipe.methodLabel}</h2>
              </div>
            )}

            {/* Short Description */}
            {recipe.shortDescription && (
              <div 
                className="mb-8 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(recipe.shortDescription) }}
              />
            )}

            {/* Two Column Layout for Equipment and Ingredients */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Equipment */}
              {recipe.equipment && recipe.equipment.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-black mb-4">Equipment</h2>
                  <ul className="space-y-2 text-gray-700">
                    {recipe.equipment.map((item: any, index: number) => (
                      <li key={index}>{typeof item === 'string' ? item : item.equipment_item || item.equipmentItem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-black mb-4">Ingredients</h2>
                  {Array.isArray(recipe.ingredients) ? (
                    <ul className="space-y-2 text-gray-700">
                      {recipe.ingredients.map((item: any, index: number) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: sanitizeHTML(typeof item === 'string' ? item : item.ingredients_item || item.ingredientsItem) }} />
                      ))}
                    </ul>
                  ) : (
                    <div 
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(recipe.ingredients) }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Directions (using important field) */}
            {recipe.important && recipe.important.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-black mb-4">Directions</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  {recipe.important.map((item: any, index: number) => (
                    <li key={index} className="pl-2">
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(typeof item === 'string' ? item : item.important_items || item.importantItems) }} />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Instructions (if separate from important) */}
            {recipe.instructions && (
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-black mb-4">Instructions</h2>
                {Array.isArray(recipe.instructions) ? (
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    {recipe.instructions.map((item: any, index: number) => (
                      <li key={index} className="pl-2" dangerouslySetInnerHTML={{ __html: sanitizeHTML(typeof item === 'string' ? item : item.instruction) }} />
                    ))}
                  </ol>
                ) : (
                  <div 
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(recipe.instructions) }}
                  />
                )}
              </div>
            )}

            {/* Notes */}
            {recipe.notes && recipe.notes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-black mb-4">Notes</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  {recipe.notes.map((item: any, index: number) => (
                    <li key={index} className="pl-2">
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(typeof item === 'string' ? item : item.note_item || item.noteItem) }} />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Notice */}
            {recipe.notice && (
              <div className="mb-8 bg-pink-50 border-l-4 border-pink-500 p-6 rounded">
                <div 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(recipe.notice) }}
                />
              </div>
            )}

            {/* Full Content */}
            {recipe.content && (
              <div className="mb-8">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(recipe.content) }}
                />
              </div>
            )}

            {/* Published Date */}
            <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
              Published on {new Date(recipe.publishedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await fetchRecipeBySlug(slug);
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found | The Piped Peony',
    };
  }

  const description = recipe.excerpt || 
                      recipe.shortDescription || 
                      (recipe.content ? recipe.content.substring(0, 160) : '') ||
                      (recipe.longDescription ? recipe.longDescription.substring(0, 160) : '') ||
                      `Learn how to make ${recipe.title}`;

  return {
    title: `${recipe.title} | The Piped Peony Recipes`,
    description,
  };
}

