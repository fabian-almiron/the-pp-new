"use client"

import { useState, useEffect, useCallback } from 'react';
import { Search, X, BookOpen, ShoppingBag, Utensils, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'course' | 'recipe' | 'blog' | 'product';
  id: number;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  price?: number;
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Search function with debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const trimmedQuery = query.trim().toLowerCase();

    try {
      // Fetch all data in parallel
      const [coursesRes, recipesRes, productsRes] = await Promise.all([
        fetch('/api/courses').then(res => res.json()),
        fetch('/api/recipes').then(res => res.json()),
        fetch('/api/products').then(res => res.json()),
      ]);

      const allResults: SearchResult[] = [];

      // Search courses
      if (coursesRes.data) {
        const courseMatches = coursesRes.data.filter((course: any) =>
          course.title?.toLowerCase().includes(trimmedQuery) ||
          course.description?.toLowerCase().includes(trimmedQuery) ||
          course.instructor?.toLowerCase().includes(trimmedQuery) ||
          course.tags?.some((tag: string) => tag.toLowerCase().includes(trimmedQuery))
        ).map((course: any) => ({
          type: 'course' as const,
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          image: course.thumbnail?.url,
        }));
        allResults.push(...courseMatches);
      }

      // Search recipes
      if (recipesRes.data) {
        const recipeMatches = recipesRes.data.filter((recipe: any) =>
          recipe.title?.toLowerCase().includes(trimmedQuery) ||
          recipe.description?.toLowerCase().includes(trimmedQuery) ||
          recipe.ingredients?.some((ing: any) => 
            ing.name?.toLowerCase().includes(trimmedQuery)
          )
        ).map((recipe: any) => ({
          type: 'recipe' as const,
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description,
          image: recipe.image?.url,
        }));
        allResults.push(...recipeMatches);
      }

      // Search products
      if (productsRes.data) {
        const productMatches = productsRes.data.filter((product: any) =>
          product.title?.toLowerCase().includes(trimmedQuery) ||
          product.description?.toLowerCase().includes(trimmedQuery) ||
          product.category?.toLowerCase().includes(trimmedQuery)
        ).map((product: any) => ({
          type: 'product' as const,
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          image: product.images?.[0]?.url,
          price: product.price,
        }));
        allResults.push(...productMatches);
      }

      setResults(allResults.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery('');
    setResults([]);

    // Navigate based on type
    switch (result.type) {
      case 'course':
        router.push(`/courses/${result.slug}`);
        break;
      case 'recipe':
        router.push(`/recipes/${result.slug}`);
        break;
      case 'blog':
        router.push(`/blog/${result.slug}`);
        break;
      case 'product':
        router.push(`/shop/item/${result.slug}`);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-[#D4A771]" />;
      case 'recipe':
        return <Utensils className="h-4 w-4 text-[#D4A771]" />;
      case 'blog':
        return <FileText className="h-4 w-4 text-[#D4A771]" />;
      case 'product':
        return <ShoppingBag className="h-4 w-4 text-[#D4A771]" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'recipe':
        return 'Recipe';
      case 'blog':
        return 'Blog';
      case 'product':
        return 'Product';
      default:
        return type;
    }
  };

  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="clean"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative !border-none"
        aria-label="Search"
      >
        <Search className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses, recipes, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-0 focus-visible:ring-0 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </DialogHeader>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isSearching && (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4A771]"></div>
                <span className="ml-2">Searching...</span>
              </div>
            )}

            {!isSearching && searchQuery && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#FBF9F6] transition-colors text-left group"
                  >
                    {/* Image */}
                    {result.image ? (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                        {getIcon(result.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getIcon(result.type)}
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-[#D4A771] transition-colors line-clamp-1">
                        {result.title}
                      </h4>
                      {result.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {result.description}
                        </p>
                      )}
                      {result.price !== undefined && (
                        <p className="text-sm font-medium text-[#D4A771] mt-1">
                          ${result.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searchQuery && !isSearching && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Start typing to search courses, recipes, and products</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

