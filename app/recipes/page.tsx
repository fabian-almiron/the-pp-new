"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat, Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Recipe {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  shortDescription?: string;
  featuredImage?: {
    url: string;
    alternativeText?: string;
  };
  coverImage?: {
    url: string;
    alternativeText?: string;
  };
  category?: string;
  categories?: string[];
  time?: string;
  prepTime?: string;
  difficulty?: string;
  featured?: boolean;
}

export default function RecipeLibraryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Fetch recipes on mount
  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        setRecipes(data);
        setLoading(false);
      } catch (err) {
        console.error('Recipe fetch error:', err);
        setError('Failed to load recipes. Please make sure Strapi is running and the Recipe API is accessible.');
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    const cats = new Set<string>();
    recipes.forEach(recipe => {
      // If recipe has categories array, add all of them
      if (recipe.categories && recipe.categories.length > 0) {
        recipe.categories.forEach(cat => cats.add(cat));
      }
      // Fallback to single category field for backward compatibility
      else if (recipe.category) {
        cats.add(recipe.category);
      }
    });
    return Array.from(cats).sort();
  }, [recipes]);

  const difficulties = useMemo(() => {
    const diffs = new Set(recipes.map(r => r.difficulty).filter(Boolean));
    return Array.from(diffs).sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== "all") {
        const hasCategory = recipe.categories 
          ? recipe.categories.includes(selectedCategory)
          : recipe.category === selectedCategory;
        if (!hasCategory) {
          return false;
        }
      }
      
      // Difficulty filter
      if (selectedDifficulty !== "all" && recipe.difficulty !== selectedDifficulty) {
        return false;
      }
      
      return true;
    });
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-[#D4A771] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF9F6]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">Recipe Library</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-8">
            <p className="font-bold">Notice</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              To add recipes: Visit <a href="http://localhost:1337/admin" className="underline">http://localhost:1337/admin</a>, 
              create recipes, and make them public in Settings → Users & Permissions → Public → Recipe (find & findOne).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Header */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-black/70 text-white border-black/50 hover:bg-black/80 backdrop-blur-sm">
            <ChefHat className="w-3 h-3 mr-1" />
            Recipe Collection
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black uppercase">
            Recipe Library
          </h1>
          <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
            Discover delicious recipes for cakes, buttercream, and more
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#D4A771] focus:ring-[#D4A771]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-[#D4A771] focus:ring-[#D4A771] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="w-full lg:w-48">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-[#D4A771] focus:ring-[#D4A771] focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff} className="capitalize">{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters & Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-black">{filteredRecipes.length}</span> of <span className="font-semibold text-black">{recipes.length}</span> recipes
            </p>
            
            {(searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="text-[#D4A771] hover:text-[#C19660]"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No recipes found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <Link 
                key={recipe.documentId} 
                href={`/recipes/${recipe.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                {/* Cover Image */}
                <div className="relative h-56 bg-[#FBF9F6] overflow-hidden">
                  {(recipe.featuredImage || recipe.coverImage) ? (
                    <Image
                      src={(recipe.featuredImage || recipe.coverImage)!.url}
                      alt={(recipe.featuredImage || recipe.coverImage)!.alternativeText || recipe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#D4A771] to-[#C19660]">
                      <ChefHat className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {recipe.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#D4A771] text-white border-0 shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    </div>
                  )}

                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-xl font-serif font-bold text-black mb-2 group-hover:text-[#D4A771] transition-colors line-clamp-2">
                    {recipe.title}
                  </h2>

                  {/* Excerpt or Short Description */}
                  {(recipe.excerpt || recipe.shortDescription) && (
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {recipe.excerpt || recipe.shortDescription?.replace(/<[^>]*>/g, '').substring(0, 120)}
                    </p>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {(recipe.time || recipe.prepTime) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#D4A771]" />
                        <span>{recipe.time || recipe.prepTime}</span>
                      </div>
                    )}
                    {recipe.difficulty && (
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-4 h-4 text-[#D4A771]" />
                        <span className="capitalize">{recipe.difficulty}</span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  {recipe.category && (
                    <Badge variant="outline" className="border-[#D4A771] text-[#D4A771]">
                      {recipe.category}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
