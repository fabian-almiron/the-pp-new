"use client"

import { useState, useEffect } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { ItemGallery } from "@/components/ui/item-gallery"
import { Product } from "@/data/types"
import { PeonyLoader } from "@/components/ui/peony-loader"
import { useCart } from "@/contexts/cart-context"

export default function ItemPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedHand, setSelectedHand] = useState("right-handed")
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [expandedAccordions, setExpandedAccordions] = useState<{[key: string]: boolean}>({})
  const [addingToCart, setAddingToCart] = useState(false)

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/products/${slug}`)
        const result = await response.json()
        
        if (!response.ok || result.error) {
          setError(result.error || 'Failed to load product')
          setLoading(false)
          return
        }
        
        if (!result.data) {
          notFound()
          return
        }
        
        setProduct(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  // Set default variation and active tab when product loads
  useEffect(() => {
    if (product?.hasVariations && product?.variations?.options?.length > 0) {
      setSelectedVariation(product.variations.options[0].name)
    }
    
    // Set default active tab
    if (product?.productTabs && product.productTabs.length > 0) {
      const defaultTab = product.productTabs.find(tab => tab.isActive) || product.productTabs[0]
      setActiveTab(defaultTab.id.toString())
      
      // Set default expanded accordions
      const defaultExpanded: {[key: string]: boolean} = {}
      product.productTabs.forEach(tab => {
        tab.accordionItems.forEach(item => {
          defaultExpanded[`${tab.id}-${item.id}`] = item.isExpanded
        })
      })
      setExpandedAccordions(defaultExpanded)
    }
  }, [product])

  const toggleAccordion = (tabId: number, itemId: number) => {
    const key = `${tabId}-${itemId}`
    
    // Close all accordions in this tab and open only the clicked one
    setExpandedAccordions(prev => {
      const newState: {[key: string]: boolean} = {}
      
      // Get all accordion keys for this tab
      if (product?.productTabs) {
        const currentTab = product.productTabs.find(tab => tab.id === tabId)
        if (currentTab) {
          currentTab.accordionItems.forEach(item => {
            const accordionKey = `${tabId}-${item.id}`
            // If this is the clicked accordion, toggle it. Otherwise, close it
            newState[accordionKey] = accordionKey === key ? !prev[key] : false
          })
        }
      }
      
      return newState
    })
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get the selected variation details
    const variation = product.hasVariations && product.variations 
      ? product.variations.options.find(v => v.name === selectedVariation)
      : null
    
    // Create cart item with variation data
    const productWithVariation = {
      ...product,
      price: variation ? variation.price : product.price,
      stripePriceId: variation ? variation.stripePriceId : product.stripePriceId,
      stripeProductId: variation ? variation.stripeProductId : product.stripeProductId,
    }
    
    addItem(productWithVariation, quantity, {
      hand: variation?.hand || (product.variants.hasHandPreference ? selectedHand : undefined),
      size: variation?.size,
      color: variation?.color,
    })
    
    setAddingToCart(false)
    
    // Redirect to cart page
    router.push('/cart')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <PeonyLoader />
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {error || "The requested product could not be found."}
            </p>
          </div>
          <Button 
            text="Back to Shop" 
            className="!bg-[#D4A771] !text-white !border-[#D4A771] hover:!bg-[#C99860] !px-8 !py-3 !rounded-lg !shadow-md hover:!shadow-lg" 
          />
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ItemGallery images={product.images} />
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <p className="text-3xl text-[#D4A771] font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Product Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.shortDescription}</p>
              {product.longDescription && (
                <p className="text-gray-600 leading-relaxed mt-4">{product.longDescription}</p>
              )}
            </div>

            {/* Options Card */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              {/* Dynamic Variations - show if product has variations */}
              {product.hasVariations && product.variations && product.variations.options.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide block">
                    {product.variations.type === 'hand' ? 'Hand Preference' : 'Options'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.variations.options.map((variation) => (
                      <button
                        key={variation.name}
                        onClick={() => setSelectedVariation(variation.name)}
                        className={`px-6 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                          selectedVariation === variation.name
                            ? "bg-[#D4A771] text-white border-[#D4A771] shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:shadow-sm"
                        }`}
                      >
                        {variation.name}
                      </button>
                    ))}
                  </div>
                  {/* Show price if variation has different price */}
                  {selectedVariation && (() => {
                    const selected = product.variations.options.find(v => v.name === selectedVariation);
                    return selected && selected.price !== product.price ? (
                      <p className="text-lg font-semibold text-[#D4A771]">
                        ${selected.price.toFixed(2)}
                      </p>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Legacy Hand Selection - only show if product uses old format */}
              {!product.hasVariations && product.variants.hasHandPreference && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide block">
                    Hand Preference
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedHand("right-handed")}
                      className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        selectedHand === "right-handed"
                          ? "bg-[#D4A771] text-white border-[#D4A771] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:shadow-sm"
                      }`}
                    >
                      Right-Handed
                    </button>
                    <button
                      onClick={() => setSelectedHand("left-handed")}
                      className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        selectedHand === "left-handed"
                          ? "bg-[#D4A771] text-white border-[#D4A771] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:shadow-sm"
                      }`}
                    >
                      Left-Handed
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide block">
                  Quantity
                </label>
                <div className="flex items-center">
                  <div className="inline-flex items-center bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5 text-gray-700" />
                    </button>
                    <span className="px-6 py-3 text-base font-semibold min-w-[4rem] text-center border-x-2 border-gray-300">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                text={addingToCart ? "ADDING TO CART..." : "ADD TO CART"}
                className="!w-full !py-4 !text-base !font-semibold !bg-[#D4A771] !text-white !border-[#D4A771] hover:!bg-[#C99860] hover:!border-[#C99860] !rounded-lg !shadow-md hover:!shadow-lg !transition-all"
                onClick={handleAddToCart}
                disabled={addingToCart}
              />
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium">In Stock & Ready to Ship</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-sm font-medium">Currently Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Product Tabs Section */}
        {product.productTabs && product.productTabs.length > 0 && (
          <div className="mt-20">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b-2 border-gray-200 bg-gray-50">
                <div className="flex flex-wrap">
                  {product.productTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id.toString())}
                      className={`px-6 lg:px-8 py-4 text-sm lg:text-base font-semibold border-b-4 transition-all ${
                        activeTab === tab.id.toString()
                          ? "border-[#D4A771] text-[#D4A771] bg-white"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8 lg:p-12">
                {product.productTabs.map((tab) => (
                  activeTab === tab.id.toString() && (
                    <div key={tab.id} className="animate-fadeIn">
                      {/* Tab Content (if displayType includes content) */}
                      {tab.content && (tab.displayType === 'content_only' || tab.displayType === 'content_and_accordion') && (
                        <div className="mb-8">
                          <div 
                            className="prose prose-gray prose-lg max-w-none [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
                            dangerouslySetInnerHTML={{ __html: tab.content }}
                          />
                        </div>
                      )}

                      {/* Accordion Items (if displayType includes accordion) */}
                      {tab.accordionItems.length > 0 && (tab.displayType === 'accordion_only' || tab.displayType === 'content_and_accordion') && (
                        <div className="space-y-4">
                          {tab.accordionItems.map((item, index) => (
                            <div 
                              key={item.id} 
                              className={`${
                                index > 0 ? "border-t-2 border-gray-100 pt-6" : ""
                              } ${
                                expandedAccordions[`${tab.id}-${item.id}`] ? "bg-gray-50 -mx-6 px-6 py-4 rounded-lg" : ""
                              }`}
                            >
                              <button
                                onClick={() => toggleAccordion(tab.id, item.id)}
                                className="flex items-center justify-between w-full text-left group"
                              >
                                <h3 className="text-xl font-bold text-gray-900 font-serif group-hover:text-[#D4A771] transition-colors pr-4">
                                  {item.title}
                                </h3>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  expandedAccordions[`${tab.id}-${item.id}`]
                                    ? "bg-[#D4A771] text-white rotate-180"
                                    : "bg-gray-200 text-gray-600 group-hover:bg-[#D4A771] group-hover:text-white"
                                }`}>
                                  <span className="text-xl font-light leading-none">
                                    {expandedAccordions[`${tab.id}-${item.id}`] ? "−" : "+"}
                                  </span>
                                </div>
                              </button>
                              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                expandedAccordions[`${tab.id}-${item.id}`]
                                  ? "max-h-[1000px] opacity-100 mt-4" 
                                  : "max-h-0 opacity-0"
                              }`}>
                                <div 
                                  className="prose prose-gray max-w-none [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
                                  dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
