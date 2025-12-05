"use client"

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function SupplyListPage() {
  const flowersRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLDivElement>(null);
  const kidsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
            Dara has put together an all-inclusive list of supplies, tools, and piping tip styles that are specifically customized to your project. You can trust her recommendations to guide you through the creative process and help you bring your vision to life.
          </p>

          {/* Category Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Button
              variant="outline"
              onClick={() => scrollToSection(flowersRef)}
              className="border-black text-black hover:bg-gray-100"
            >
              Flowers and basic piping
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection(colorRef)}
              className="border-black text-black hover:bg-gray-100"
            >
              Color
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection(cakeRef)}
              className="border-black text-black hover:bg-gray-100"
            >
              Cake and cupcake decorating
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection(kidsRef)}
              className="border-black text-black hover:bg-gray-100"
            >
              Kids
            </Button>
          </div>
        </div>

        {/* All Sections */}
        <div className="space-y-12">
          <div ref={flowersRef}>
            <FlowersSection />
          </div>
          <div ref={colorRef}>
            <ColorSection />
          </div>
          <div ref={cakeRef}>
            <CakeSection />
          </div>
          <div ref={kidsRef}>
            <KidsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowersSection() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Left Image Container */}
        <div className="hidden md:block">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src="/piping.jpg"
              alt="Flowers and basic piping supplies"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-serif text-black mb-6">Flowers and Basic Piping</h3>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
            <ul className="space-y-2 text-gray-700 text-sm pl-6">
              <li>• <strong>Wilton:</strong> 4B, 1, 2, 3, 4, 7, 8, 9, 10, 12, 16, 19A, 61, 81, 101, 102, 103, 104, 123, 133, 199, 249, 352, 366</li>
              <li>• <strong>Ateco:</strong> 6G, 4I, 79, 80, 81, 124K, 126K, 227, 249, 808, 109 (only if left-handed)</li>
              <li>• <strong>G.G. Cakraft:</strong> 65, 810, 105, 106, 1051 (left-handed tip) or 1052 (right-handed tip), 1061 (left-handed tip) or 1062 (right-handed tip)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-black mb-3">Equipment</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping block</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Silicone spatulas</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Extra large flower nail</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping bags (10-12 in)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Flower lifter (oval tip)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Needle nose pliers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Flower lifter (scissor tip)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Food scale</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Microwavable bowls</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping couplers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Storage containers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Floral wire (22 gauge)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">G.G. Cakraft Y flower nail</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Styrofoam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorSection() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Left Image Container */}
        <div className="hidden md:block">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src="/coloring.jpg"
              alt="Color palette for buttercream"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-serif text-black mb-6">Coloring</h3>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-3">Gel Colors (Water-based, used only for Blooming Buttercream)</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm"><strong>Americolor:</strong> super black, red, yellow, blue, optional: mauve, soft pink, electric pink</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm"><strong>Chefmaster:</strong> buckeye, brown, liquid whitener</span>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-black mb-3">Oil-Based Colors (Used only for Italian Meringue Buttercream)</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm"><strong>Colour Mill</strong> (all are completely optional; you can color Italian Meringue with gel colors; it's just takes longer to develop the color; Sugar Sister's pricing for these is better than Amazon's): black, brown, red, yellow, blue, green</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Food scale</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CakeSection() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Left Image Container */}
        <div className="hidden md:block">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src="/cake-card.png"
              alt="Cake and cupcake decorating supplies"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-serif text-black mb-6">Cake and Cupcake</h3>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
            <ul className="space-y-2 text-gray-700 text-sm pl-6">
              <li>• Pastry brush</li>
              <li>• Piping tips: Ateco 869</li>
              <li>• Bamboo skewers</li>
              <li>• Cake turntable</li>
              <li>• Cake leveler</li>
              <li>• Food scale</li>
              <li>• Chocolate or white chocolate melting wafers</li>
              <li>• Parchment paper</li>
              <li>• Cake boards; some size as cake or larger (I usually buy a bulk pack of 9" boards so I can use them for all sizes of cakes.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function KidsSection() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Left Image Container */}
        <div className="hidden md:block">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src="/kids.png"
              alt="Kids cake decorating supplies"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-serif text-black mb-6">Kids</h3>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-3">Tips</h4>
            <ul className="space-y-2 text-gray-700 text-sm pl-6 mb-6">
              <li>• <strong>Wilton:</strong> 24 or 4B, 1, 2, 5, 6, 10, 12, 16, 59c/59, 81, 101, 103, 123, 233, 349, 369 *check out the Wilton 55 piece set if you need all of these.</li>
              <li>• <strong>Ateco:</strong> 50, 79, 1246, 1266, 237, 349, 869</li>
              <li>• <strong>G.G. Cakroft:</strong> 102 (opt), 1061 (left-handed tip) or 1062 (right-handed tip), 106</li>
            </ul>

            <h4 className="text-lg font-semibold text-black mb-3">Equipment</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping block</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Silicone spatulas</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Extra large flower nail</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping bags (10-12 in)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Flower lifter (oval tip)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Needle nose pliers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Flower lifter (scissor tip)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Food scale</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Microwavable bowls</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Piping couplers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Storage containers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Floral wire (22 gauge)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">G.G. Cakroft 9 flower nail</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#D4A771] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Styrofoam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
