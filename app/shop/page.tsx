"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/types";
import { PeonyLoader } from "@/components/ui/peony-loader";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/products');
        const result = await response.json();
        
        if (!response.ok || result.error) {
          setError(result.error || 'Failed to load products');
          setLoading(false);
          return;
        }
        
        if (result.data) {
          console.log('🛍️ Loaded products:', result.data.length);
          console.log('📋 Product slugs:', result.data.map((p: Product) => p.slug));
          setProducts(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <div className="text-center mb-12">
            <div className="mb-6">
              <h3 className="signature-text mb-2">Welcome to the</h3>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-4">Shop</h1>
            </div>
            <p className="text-gray-600 mt-2">Watch our academy's videos to stay up-to-date on the latest techniques, trends, and piping recipes.</p>
            <p className="text-gray-600">All orders placed on or after June 11th will be fulfilled on 6/24 due to upcoming business and personal travel. Thank you for continuing to support our small business!</p>
          </div>
          <div className="flex justify-center items-center py-16">
            <PeonyLoader />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <div className="text-center mb-12">
            <div className="mb-6">
              <h3 className="signature-text mb-2">Welcome to the</h3>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-4">Shop</h1>
            </div>
            <p className="text-gray-600 mt-2">Watch our academy's videos to stay up-to-date on the latest techniques, trends, and piping recipes.</p>
            <p className="text-gray-600">All orders placed on or after June 11th will be fulfilled on 6/24 due to upcoming business and personal travel. Thank you for continuing to support our small business!</p>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-gray-900 mb-4">Unable to Load Products</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-[#D4A771] text-white rounded hover:bg-[#C19660] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto" style={{ margin: "0px 159.583px", padding: "80px 16px 96px" }}>
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="signature-text mb-2">Welcome to the</h1>
            <h1 className="shop-title">Shop</h1>
          </div>
          <p className="text-gray-600 mt-2">Watch our academy's videos to stay up-to-date on the latest techniques, trends, and piping recipes.</p>
          <p className="text-gray-600">All orders placed on or after June 11th will be fulfilled on 6/24 due to upcoming business and personal travel. Thank you for continuing to support our small business!</p>
          <div className="mt-6">
            <Link href="/cart" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <span>View Cart</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/item/${product.slug}`}
              className="group relative"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                {/* Product Image */}
                <div className="relative h-44 bg-[#FBF9F6]">
                  <Image
                    src={product.images[0]?.src || "/placeholder.svg"}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4A771]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold mb-2 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  
                  <p className="text-lg font-semibold text-gray-700 mb-4">
                    ${product.price.toFixed(2)}
                  </p>

                  {/* Product Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <span className="text-sm text-gray-500">
                      View Details
                    </span>
                    <span className="text-sm font-medium text-[#D4A771] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
