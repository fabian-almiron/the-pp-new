"use client"

import { useState, useEffect } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { ItemGallery } from "@/components/ui/item-gallery"
import { fetchProductBySlug } from "@/lib/strapi-api"
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
              {/* Dynamic Variations - show if product has variations */}
              {product.hasVariations && product.variations && product.variations.options.length > 0 && (
                <div className="space-y-2 sm:flex-1 lg:w-full text-center sm:text-right lg:text-left">
                  <label className="text-sm text-gray-700 font-medium block">
                    {product.variations.type === 'hand' ? 'Hand Preference' : 'Options'}
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-end lg:justify-start">
                    {product.variations.options.map((variation) => (
                      <button
                        key={variation.name}
                        onClick={() => setSelectedVariation(variation.name)}
                        className={`px-4 py-2 text-sm border transition-colors ${
                          selectedVariation === variation.name
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#D4A771] hover:text-[#D4A771]"
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
                      <p className="text-sm text-gray-600 mt-1">
                        ${selected.price.toFixed(2)}
                      </p>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Legacy Hand Selection - only show if product uses old format */}
              {!product.hasVariations && product.variants.hasHandPreference && (
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

        {/* Dynamic Product Tabs Section */}
        {product.productTabs && product.productTabs.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {product.productTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id.toString())}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id.toString()
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {product.productTabs.map((tab) => (
                  activeTab === tab.id.toString() && (
                    <div key={tab.id}>
                      {/* Tab Content (if displayType includes content) */}
                      {tab.content && (tab.displayType === 'content_only' || tab.displayType === 'content_and_accordion') && (
                        <div className="mb-6">
                          <div 
                            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: tab.content }}
                          />
                        </div>
                      )}

                      {/* Accordion Items (if displayType includes accordion) */}
                      {tab.accordionItems.length > 0 && (tab.displayType === 'accordion_only' || tab.displayType === 'content_and_accordion') && (
                        <div className="space-y-4">
                          {tab.accordionItems.map((item, index) => (
                            <div key={item.id} className={index > 0 ? "border-t border-gray-200 pt-4" : ""}>
                              <button
                                onClick={() => toggleAccordion(tab.id, item.id)}
                                className="flex items-center justify-between w-full text-left group"
                              >
                                <h3 className="text-lg font-medium text-gray-900 font-serif group-hover:text-[#D4A771] transition-colors">
                                  {item.title}
                                </h3>
                                <span className="text-gray-400 group-hover:text-[#D4A771] transition-colors">
                                  {expandedAccordions[`${tab.id}-${item.id}`] ? "−" : "+"}
                                </span>
                              </button>
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                expandedAccordions[`${tab.id}-${item.id}`]
                                  ? "max-h-96 opacity-100 mt-3" 
                                  : "max-h-0 opacity-0 mt-0"
                              }`}>
                                <div 
                                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none pb-2"
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
