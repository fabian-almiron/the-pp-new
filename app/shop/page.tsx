"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProducts } from "@/lib/mock-api";
import { Product } from "@/data/types";
import { PeonyLoader } from "@/components/ui/peony-loader";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from mock database
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      const response = await fetchProducts();
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      
      if (response.data) {
        setProducts(response.data);
      }
      
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">Shop Our Tools & Supplies</h1>
            <p className="text-gray-600 mt-2">Everything you need to start your buttercream flower journey.</p>
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
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">Shop Our Tools & Supplies</h1>
            <p className="text-gray-600 mt-2">Everything you need to start your buttercream flower journey.</p>
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
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-800">Shop Our Tools & Supplies</h1>
          <p className="text-gray-600 mt-2">Everything you need to start your buttercream flower journey.</p>
          <div className="mt-6">
            <Link href="/cart" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <span>View Cart</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {products.map((product) => (
            <div key={product.id} className="group text-center product-card-double-border p-4 bg-white flex flex-col">
              <Link href={`/shop/item/${product.slug}`} className="flex-grow">
                <div className="block overflow-hidden mb-6 aspect-video">
                  <Image
                    src={product.images[0]?.src || "/placeholder.svg"}
                    alt={product.images[0]?.alt || product.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-serif text-2xl text-gray-800 mb-3 leading-tight">{product.name}</h3>
              </Link>
              <p className="text-base text-gray-600 mb-0">${product.price.toFixed(2)}</p>
              <div className="mt-8 mt-auto mb-4 flex justify-center">
                <Link href={`/shop/item/${product.slug}`}>
                  <button 
                    className="font-semibold border border-black text-black hover:border-[#D4A771] hover:text-[#D4A771] lowercase bg-transparent transition-colors duration-200"
                    style={{ paddingTop: '2px', paddingBottom: '2px', paddingLeft: '12px', paddingRight: '12px', fontSize: '0.875rem' }}
                  >
                    select options
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
