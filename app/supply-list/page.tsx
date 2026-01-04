"use client"

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function SupplyListPage() {
  const flowersRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLDivElement>(null);

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
              <li>• <strong>Wilton:</strong> 4B, 1, 2, 3, 4, 7, 8, 9, 10, 12, 14, 59s, 81, 101, 102, 103, 104, 133, 199, 349, 352, 366</li>
              <li>• <strong>Ateco:</strong> 00, 4I, 79, 80, 81, 123, 124K, 125k, 126K, 227, 349, 352, 869</li>
              <li>• <strong>G.G. Cakraft:</strong> 55, 105, 106, 1051 (left-handed tip) or 1052 (right-handed tip), 1061 (left-handed tip) or 1062 (right-handed tip)</li>
              <li>• <strong>Korea:</strong> 61</li>
              <li>• <strong>PP:</strong> 349 (Wilton 349 is a substitute for this tip)</li>
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
            <h4 className="text-lg font-semibold text-black mb-3">Gel Colors</h4>
            <ul className="space-y-2 text-gray-700 text-sm pl-6">
              <li>• <strong>Wilton:</strong> black, red, lemon yellow, royal blue, brown, violet, leaf green</li>
              <li>• <strong>Americolor:</strong> electric pink, regal purple</li>
              <li>• <strong>Chefmaster:</strong> liquid whitener</li>
            </ul>
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

