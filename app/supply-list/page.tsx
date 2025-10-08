"use client"

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type Category = 'flowers' | 'color' | 'cake' | 'kids';

export default function SupplyListPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('flowers');

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Header */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-sm uppercase tracking-wider text-gray-600 mb-2" style={{ fontFamily: 'var(--font-dancing-script)' }}>
            Dara's Faves
          </p>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black uppercase">
            SUPPLY LIST
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Dara has compiled a collection of her favorite tools and equipment, designed to help individuals get started.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Intro */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-black mb-4">Supply List</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto mb-8">
            Dara has put together an all-inclusive list of supplies, tools, and piping tip styles that are specifically customized to your project. You can find her recommendations in our shop or through our suppliers.
          </p>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Button
              variant={activeCategory === 'flowers' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('flowers')}
              className={activeCategory === 'flowers' ? 'bg-black text-white' : 'border-black text-black hover:bg-gray-100'}
            >
              Flowers and basic piping
            </Button>
            <Button
              variant={activeCategory === 'color' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('color')}
              className={activeCategory === 'color' ? 'bg-black text-white' : 'border-black text-black hover:bg-gray-100'}
            >
              Color
            </Button>
            <Button
              variant={activeCategory === 'cake' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('cake')}
              className={activeCategory === 'cake' ? 'bg-black text-white' : 'border-black text-black hover:bg-gray-100'}
            >
              Cake and cupcake decorating
            </Button>
            <Button
              variant={activeCategory === 'kids' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('kids')}
              className={activeCategory === 'kids' ? 'bg-black text-white' : 'border-black text-black hover:bg-gray-100'}
            >
              Kids
            </Button>
          </div>
        </div>

        {/* Category Content */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
          {activeCategory === 'flowers' && <FlowersSection />}
          {activeCategory === 'color' && <ColorSection />}
          {activeCategory === 'cake' && <CakeSection />}
          {activeCategory === 'kids' && <KidsSection />}
        </div>
      </div>
    </div>
  );
}

function FlowersSection() {
  return (
    <div>
      <h3 className="text-2xl font-serif text-black mb-6">Flowers and Basic Piping</h3>
      
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• Roses: 59, 60, 61, 74, 80, 81, 104K, 122, 123, 124, 125, 126, 150, 340, 349, 352, 353, 354, 363</li>
          <li>• Roses: (02, 4), 79, 80, 81, 104K, 124R, 127, 349, 888, 108 (only if wilton/ateco)</li>
          <li>• G.G. Cakraft: 62, 865, 105, 106, 1002 (whichever tips or 104d right/handed tip or 104d Left/handed tip)</li>
          <li>• (smallest tip)</li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-black mb-3">Equipment</h4>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Piping black</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Silicone spatulas</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Extra large flower nail</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Piping bags (12-18)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Flower lifter (oval tip)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Needle nose pliers</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Flower lifter (octstar tip)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Food scale</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Microremovable foods</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Piping couplers</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Storage containers</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Floral wire (22 gauge)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">G.G. Cakraft 7' flower nail</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Styrofoam</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorSection() {
  return (
    <div>
      <h3 className="text-2xl font-serif text-black mb-6">Coloring</h3>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <Image
            src="/coloring-300x161.jpg"
            alt="Color palette for buttercream"
            width={400}
            height={215}
            className="rounded-lg"
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-black mb-3">Gel Colors (Wilton-based, used only for Blooming Buttercream®)</h4>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>• Americolor: super black, red, yellow, blue, optional: maroon, teal pink, electric pink</li>
            <li>• Chefmaster: buckeye, brown, liquid whitener</li>
            <li>• Flower lifter (oval tip)</li>
            <li>• Flower lifter (octstar tip)</li>
          </ul>

          <h4 className="text-lg font-semibold text-black mb-3">Oil-Based Colors (Used only for Italian Meringue Buttercream)</h4>
          <p className="text-gray-700 mb-3">
            <strong>Colour Mill:</strong> (all are completely oil-based). you can color Italian Meringue with gel colors, it's just takes longer to develop the color. Super tinter's piping for heavy a better than chespin 17 black, brown, red, yellow, blue.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Food scale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CakeSection() {
  return (
    <div>
      <h3 className="text-2xl font-serif text-black mb-6">Cake and Cupcake</h3>
      
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• Pastry brush</li>
          <li>• Piping tips: 1M (large star tip)</li>
          <li>• Bamboo skewers</li>
          <li>• Cake turntable</li>
          <li>• Cake leveler</li>
          <li>• Bench scraper (also called 'flour cake layer')</li>
          <li>• Piping bags; preferably 12"-18"</li>
          <li>• 10" metal bench scraper</li>
          <li>• Piping tips: Wilton 789 (optional)</li>
          <li>• 1 cavity thermometers</li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-black mb-3">Equipment</h4>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Food scale</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Chocolate or white chocolate melting wafers</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Parchment paper</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Cake boards; same size as cake or larger (1 usually buy a bulk pack of 8" boards so I often use them for all sizes of cakes)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Offset spatula</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Round tip paint brush or equivalent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KidsSection() {
  return (
    <div>
      <h3 className="text-2xl font-serif text-black mb-6">Kids</h3>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <Image
            src="/placeholder.jpg"
            alt="Sunflower cake decoration"
            width={400}
            height={400}
            className="rounded-lg"
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>• Wilton: 1, 2, 3, 4, 5, 16, 18, 20, 21, 30, 48, 59, 67, 68, 81, 103, 104, 125, 352 *Check out the Wilton 55 peace set if you would all of these</li>
            <li>• Ateco: 12/4R, 104K, 107, 125, 849, 863</li>
            <li>• G.G. Cakraft: 102 (right) 1002 (left) *whichever big or 104d (right-handed big or 104d left-handed big 108</li>
          </ul>

          <h4 className="text-lg font-semibold text-black mb-3">Equipment</h4>
          <div className="grid gap-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Piping black</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Silicone spatulas</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Extra large flower nail</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Piping bags (12-18 pt)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Flower lifter (oval tip)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Needle nose pliers</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Food scale</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Piping couplers</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Microremovable foods</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Floral wire (22 gauge)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Storage containers</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Styrofoam</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">G.G. Cakraft 7' flower nail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
