import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Header */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-base font-bold tracking-wider text-gray-600 mb-1" style={{ fontFamily: 'LeFestin, cursive' }}>Dara's Faves</p>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black uppercase">
            SUPPLIERS
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-black mb-4">Our Suppliers</h2>
          <p className="text-lg text-gray-700">
            Need something not in our shop? Visit our trusted partners, Whipzi Baking Essentials or The Butterfly Cake Shop.
          </p>
        </div>

        {/* Supplier Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Whipzi Baking Essentials */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-[#D4A771]" />
              <h3 className="text-2xl font-serif text-black mb-6">Whipzi Baking Essentials</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-[#FBF9F6] rounded-md p-4 border-l-4 border-[#D4A771]">
                <p className="text-sm text-gray-600 mb-1">20% off</p>
                <p className="text-lg font-semibold text-black">Code: PIPEDPEONY20</p>
              </div>

              <div className="bg-[#FBF9F6] rounded-md p-4 border-l-4 border-black">
                <p className="text-sm text-gray-600 mb-1">40% off (one-time only)</p>
                <p className="text-lg font-semibold text-black">Code: PIPEDPEONY40</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6 text-center italic">Exclusions apply*</p>

            <a 
              href="https://whipzi.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-[#D4A771] hover:bg-[#C99860] text-white">
                Visit
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* The Butterfly Cake Shop */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-[#D4A771]" />
              <h3 className="text-2xl font-serif text-black mb-6">The Butterfly Cake Shop</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-[#FBF9F6] rounded-md p-4 border-l-4 border-[#D4A771]">
                <p className="text-sm text-gray-600 mb-1">10% off</p>
                <p className="text-lg font-semibold text-black">Code: PIPEDPEONY10</p>
              </div>
            </div>

            <div className="h-[72px]"></div> {/* Spacer to match Whipzi height */}

            <a 
              href="https://thebutterflycakeshop.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-[#D4A771] hover:bg-[#C99860] text-white">
                Visit
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-4">*Whipzi Exclusions</h3>
          
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>20% Exclusion:</strong> This discount code is not applicable for the purchase of Blueberry flavors, 
              as all Blueberry flavor proceeds benefit the Brodie Blueberry Charity.
            </p>
            <p>
              <strong>40% Exclusions:</strong> This discount code is good for a one-time purchase. Additionally, 
              this code is not applicable for the purchase of Blueberry flavors, as all Blueberry flavor proceeds 
              benefit the Brodie Blueberry Charity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
