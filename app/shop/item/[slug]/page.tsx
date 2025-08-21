"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { ItemGallery } from "@/components/ui/item-gallery"
import { fetchProductBySlug } from "@/lib/mock-api"
import { Product } from "@/data/types"
import { PeonyLoader } from "@/components/ui/peony-loader"
import { useCart } from "@/contexts/cart-context"

export default function ItemPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedHand, setSelectedHand] = useState("right-handed")
  const [quantity, setQuantity] = useState(1)
  const [expandedSection, setExpandedSection] = useState<string | null>("accessories")
  const [addingToCart, setAddingToCart] = useState(false)

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return
      
      setLoading(true)
      setError(null)
      
      const response = await fetchProductBySlug(slug)
      
      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }
      
      if (!response.data) {
        notFound()
        return
      }
      
      setProduct(response.data)
      setLoading(false)
    }

    loadProduct()
  }, [slug])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addItem(product, quantity, {
      hand: product.variants.hasHandPreference ? selectedHand : undefined,
      size: product.variants.hasSizeOptions ? undefined : undefined, // Add size logic when needed
      color: product.variants.hasColorOptions ? undefined : undefined // Add color logic when needed
    })
    
    setAddingToCart(false)
    
    // Show success feedback (you could add a toast notification here)
    alert('Item added to cart!')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <PeonyLoader />
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The requested product could not be found."}</p>
          <Button text="Back to Shop" className="!bg-[#D4A771] !text-white" />
        </div>
      </div>
    )
  }

  // Universal disclaimer text
  const universalDisclaimer = "Each tuned tip will be hand-tuned by Dara Waitkus personally according to her standards and experience. Please note that because this is not an automated process, it is possible that tuned tips may look slightly different from one another. Each tip will be tuned as if it was her own personal tip. No refunds, returns, or exchanges will be available. If damage exists, please report it immediately with pictures."

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <ItemGallery images={product.images} />

          {/* Product Details */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-serif text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl text-gray-900 font-medium">${product.price.toFixed(2)}</p>
            </div>

            {/* Conditional sections based on product variants */}
            <div className="flex flex-col sm:flex-row sm:gap-8 lg:flex-col lg:gap-0 space-y-6 sm:space-y-0 lg:space-y-6">
              {/* Hand Selection - only show if product has hand preference */}
              {product.variants.hasHandPreference && (
                <div className="space-y-2 sm:flex-1 lg:w-full text-center sm:text-right lg:text-left">
                  <label className="text-sm text-gray-700 font-medium block">Hand Preference</label>
                  <div className="flex space-x-2 justify-center sm:justify-end lg:justify-start">
                    <button
                      onClick={() => setSelectedHand("right-handed")}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
                        selectedHand === "right-handed"
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:text-[#D4A771]"
                      }`}
                    >
                      right-handed
                    </button>
                    <button
                      onClick={() => setSelectedHand("left-handed")}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
                        selectedHand === "left-handed"
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:text-[#D4A771]"
                      }`}
                    >
                      left-handed
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2 sm:flex-1 lg:w-full text-center sm:text-left lg:text-left">
                <span className="text-sm text-gray-700 font-medium block">Quantity</span>
                <div className="flex justify-center sm:justify-start lg:justify-start">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-2 hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-sm min-w-[3rem] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex justify-center lg:justify-start button-grey-lines">
              <Button 
                text={addingToCart ? "ADDING..." : "ADD TO CART"}
                className="!bg-gray-600 !text-white !border-gray-600 hover:!bg-transparent hover:!text-black hover:!border-black"
                onClick={handleAddToCart}
                disabled={addingToCart}
              />
            </div>

            {/* Product Description */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>{product.shortDescription}</p>
              <p>{product.longDescription}</p>
            </div>
          </div>
        </div>

        {/* What's Included Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setExpandedSection("accessories")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    expandedSection === "accessories"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  what's included
                </button>
                <button 
                  onClick={() => setExpandedSection("disclaimer")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    expandedSection === "disclaimer"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  disclaimer
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {expandedSection === "disclaimer" ? (
                /* Universal Disclaimer Content */
                <div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 font-serif mb-3">Disclaimer</h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>{product.disclaimer || universalDisclaimer}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Expandable Sections */
                <div className="space-y-4">
                  {/* Accessories Section */}
                  {product.specifications.accessories && (
                    <div>
                      <button
                        onClick={() => toggleSection("accessories")}
                        className="flex items-center justify-between w-full text-left group"
                      >
                        <h3 className="text-lg font-medium text-gray-900 font-serif group-hover:text-[#D4A771] transition-colors">Accessories</h3>
                        <span className="text-gray-400 group-hover:text-[#D4A771] transition-colors">
                          {expandedSection === "accessories" ? "−" : "+"}
                        </span>
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedSection === "accessories" 
                          ? "max-h-96 opacity-100" 
                          : "max-h-0 opacity-0"
                      }`}>
                        <div className="space-y-2 text-sm text-gray-700 pb-2 mt-3">
                          {product.specifications.accessories.map((accessory, index) => (
                            <p key={index}>{accessory}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tip Categories */}
                  {product.specifications.tipCategories?.map((category) => (
                    <div key={category.name} className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => toggleSection(category.name)}
                        className="flex items-center justify-between w-full text-left group"
                      >
                        <h3 className="text-lg font-medium text-gray-900 font-serif group-hover:text-[#D4A771] transition-colors">
                          {category.name}
                        </h3>
                        <span className="text-gray-400 group-hover:text-[#D4A771] transition-colors">
                          {expandedSection === category.name ? "−" : "+"}
                        </span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedSection === category.name 
                          ? "max-h-32 opacity-100 mt-3" 
                          : "max-h-0 opacity-0 mt-0"
                      }`}>
                        <div className="text-sm text-gray-700 space-y-1 pb-2">
                          {category.items.map((item, index) => (
                            <p key={index}>{item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
