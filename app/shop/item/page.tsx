"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { ItemGallery, type GalleryImage } from "@/components/ui/item-gallery"

export default function ItemPage() {
  const [selectedHand, setSelectedHand] = useState("right-handed")
  const [quantity, setQuantity] = useState(1)
  const [expandedSection, setExpandedSection] = useState<string | null>("accessories")

  // Gallery images - can be easily modified or fetched from an API
  const galleryImages: GalleryImage[] = [
    {
      src: "/placeholder_lily.jpg",
      alt: "White Lily - Elegant blooms"
    },
    {
      src: "/placeholder_orchid-pink.jpg",
      alt: "Pink Orchid - Delicate petals"
    },
    {
      src: "/placeholder_oriental-lily.jpg",
      alt: "Oriental Lily - Spotted beauty"
    },
    {
      src: "/placeholder_peony-blue.jpg",
      alt: "Blue Peony - Unique coloring"
    },
    {
      src: "/placeholder_peony.jpg",
      alt: "Pink Peony - Classic bloom"
    },
    {
      src: "/placeholder_rose-pink.jpg",
      alt: "Pink Rose - Timeless elegance"
    },
    {
      src: "/placeholder_chrysanthemum.jpg",
      alt: "Chrysanthemum - Golden petals"
    },
    {
      src: "/placeholder_daisy.jpg",
      alt: "White Daisy - Simple beauty"
    }
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <ItemGallery images={galleryImages} />

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">The Essential Flower Piping Kit, Tuned</h1>
              <p className="text-2xl text-gray-900 font-medium">$350.00</p>
            </div>

            {/* Hand Selection */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">Hand Preference</label>
              <div className="flex space-x-2">
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

            {/* Quantity */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium">Quantity</span>
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

            {/* Add to Cart */}
            <div className="flex justify-start button-grey-lines">
              <Button 
                text="ADD TO CART" 
                className="!bg-gray-600 !text-white !border-gray-600 hover:!bg-transparent hover:!text-black hover:!border-black"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                The Piped Peony Essential Flower Piping Kit, Tuned is perfect for your piping tip storage and
                organization needs! This high-quality caddy can accommodate all of your supplies in one easy-
                to-organize place. It includes all of the essential supplies you need to pipe realistic buttercream
                flowers just like Dora! Everything you need, and nothing that you don't, this caddy is adorned with The
                Piped Peony logo so Dora will be with you in spirit for all of your cake decorating needs.
              </p>
              <p>
                This kit includes several tips that are hand-tuned by Dora Watkius to her exact standards. Tuned tips
                are notated as such in the supply list.
              </p>
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
                /* Disclaimer Content */
                <div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 font-serif mb-3">Disclaimer</h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>
                        Each tuned tip will be hand-tuned by Dara Waitkus personally according to her standards and experience. 
                        Please note that because this is not an automated process, it is possible that tuned tips may look slightly 
                        different from one another. Each tip will be tuned as if it was her own personal tip. No refunds, returns, 
                        or exchanges will be available. If damage exists, please report it immediately with pictures.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Expandable Sections */
                <div className="space-y-4">
                {/* Accessories Section */}
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
                      <p>Disposable Piping Bags (Quantity 100)</p>
                      <p>Couplers (x4)</p>
                      <p>Good Flower Lifter Large Flower Piping Nail</p>
                      <p>G.G. Cabratt Y-shaped Flower Piping Nail</p>
                      <p>Oval Flower Lifter</p>
                      <p>Piped Peony Scissor Flower Lifter</p>
                      <p>Small Silicone Spatulas (x3)</p>
                      <p>Piped Peony Piping Block</p>
                      <p>The Ultimate Tip Guide</p>
                    </div>
                  </div>
                </div>
                {["Curved Petal Tips", "Drop Tips", "Leaf Tips", "Round Tips", "Straight Petal Tips"].map((section) => (
                  <div key={section} className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection(section)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <h3 className="text-lg font-medium text-gray-900 font-serif group-hover:text-[#D4A771] transition-colors">
                        {section}
                      </h3>
                      <span className="text-gray-400 group-hover:text-[#D4A771] transition-colors">
                        {expandedSection === section ? "−" : "+"}
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedSection === section 
                        ? "max-h-32 opacity-100 mt-3" 
                        : "max-h-0 opacity-0 mt-0"
                    }`}>
                      <div className="text-sm text-gray-700 space-y-1 pb-2">
                        <p>Sample content for {section.toLowerCase()} - this will be populated from database</p>
                        <p>Additional details about these tips and their uses</p>
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
