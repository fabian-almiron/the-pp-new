import Image from "next/image";
import Link from "next/link";
import { fetchRecipeBySlug } from "@/lib/strapi-api";
import { notFound } from "next/navigation";
import { Clock, ChefHat, Users, Star, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeSchema } from "@/components/structured-data";
import { SanitizedHTML } from "@/components/sanitized-html";
import { InlineHTML } from "@/components/inline-html";
import { DownloadRecipeButton } from "@/components/download-recipe-button";
import { RecipeContentGate } from "@/components/recipe-content-gate";

// Keep recipes dynamic for now due to complex HTML sanitization
export const dynamic = 'force-dynamic';

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function to fetch adjacent recipes
async function fetchAdjacentRecipes(currentSlug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/recipes?sort=title:asc&populate=featuredImage,coverImage&pagination[limit]=100`, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.STRAPI_API_TOKEN && {
          'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
        }),
      },
      cache: 'no-store'
    });
    
    if (!response.ok) return { prev: null, next: null };
    
    const data = await response.json();
    const recipes = data.data || [];
    
    const currentIndex = recipes.findIndex((r: any) => r.slug === currentSlug);
    
    if (currentIndex === -1) return { prev: null, next: null };
    
    const prev = currentIndex > 0 ? recipes[currentIndex - 1] : null;
    const next = currentIndex < recipes.length - 1 ? recipes[currentIndex + 1] : null;
    
    return { prev, next };
  } catch (error) {
    console.error('Error fetching adjacent recipes:', error);
    return { prev: null, next: null };
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  
  const [recipe, adjacentRecipes] = await Promise.all([
    fetchRecipeBySlug(slug),
    fetchAdjacentRecipes(slug)
  ]);

  if (!recipe) {
    notFound();
  }
  
  const { prev, next } = adjacentRecipes;

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

        {/* Recipe Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-black text-center">
            {recipe.title}
          </h1>
        </div>

        <RecipeContentGate>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
            {/* Download Button - Top Right Corner */}
            <div className="absolute top-4 right-4 z-10 no-print">
              <DownloadRecipeButton recipe={recipe} />
            </div>
            <div className="p-8 md:p-12">
              {/* Method Label */}
              {recipe.methodLabel && (
                <div className="mb-6">
                  <h2 className="text-2xl font-serif text-black">{recipe.methodLabel}</h2>
                </div>
              )}

              {/* Short Description */}
              {recipe.shortDescription && (
                <SanitizedHTML 
                  html={recipe.shortDescription}
                  className="mb-8 text-gray-700 leading-relaxed"
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
                          <li key={index}>
                            <InlineHTML html={typeof item === 'string' ? item : item.ingredients_item || item.ingredientsItem} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <SanitizedHTML
                        html={recipe.ingredients}
                        className="prose prose-gray max-w-none"
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
                        <InlineHTML html={typeof item === 'string' ? item : item.important_items || item.importantItems} />
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
                        <li key={index} className="pl-2">
                          <InlineHTML html={typeof item === 'string' ? item : item.instruction} />
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <SanitizedHTML
                      html={recipe.instructions}
                      className="prose prose-gray max-w-none"
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
                        <InlineHTML html={typeof item === 'string' ? item : item.note_item || item.noteItem} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Notice */}
              {recipe.notice && (
                <div className="mb-8 bg-pink-50 border-l-4 border-pink-500 p-6 rounded">
                  <SanitizedHTML 
                    html={recipe.notice}
                    className="text-gray-700"
                  />
                </div>
              )}

              {/* Full Content */}
              {recipe.content && (
                <div className="mb-8">
                  <SanitizedHTML
                    html={recipe.content}
                    className="prose prose-gray max-w-none"
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
        </RecipeContentGate>

        {/* Next/Previous Navigation */}
        {(prev || next) && (
          <div className="mt-12 flex justify-between items-center gap-4 next-prev-navigation">
            {prev ? (
              <Link 
                href={`/recipes/${prev.slug}`}
                className="flex-1 group"
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#D4A771] hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Previous Recipe</span>
                  </div>
                  <h3 className="text-lg font-serif text-black group-hover:text-[#D4A771] transition-colors line-clamp-2">
                    {prev.title}
                  </h3>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            
            {next ? (
              <Link 
                href={`/recipes/${next.slug}`}
                className="flex-1 group"
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#D4A771] hover:shadow-lg transition-all text-right">
                  <div className="flex items-center justify-end gap-3 text-gray-600 mb-2">
                    <span className="text-sm font-medium">Next Recipe</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif text-black group-hover:text-[#D4A771] transition-colors line-clamp-2">
                    {next.title}
                  </h3>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
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

