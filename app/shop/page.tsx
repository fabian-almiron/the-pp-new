import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const products = [
    { id: 1, name: "Beginner's Piping Tip Set", price: 24.99, image: "/placeholder.svg?width=400&height=400" },
    { id: 2, name: "Blooming Buttercream™ Mix", price: 18.50, image: "/placeholder.svg?width=400&height=400" },
    { id: 3, name: "Reusable Silicone Piping Bags", price: 15.99, image: "/placeholder.svg?width=400&height=400" },
    { id: 4, name: "Artisan Food Coloring Gels", price: 29.99, image: "/placeholder.svg?width=400&height=400" },
    { id: 5, name: "Cake Turntable Stand", price: 35.00, image: "/placeholder.svg?width=400&height=400" },
    { id: 6, name: "Offset Spatula Set", price: 12.99, image: "/placeholder.svg?width=400&height=400" },
    { id: 7, name: "The Peony Masterclass eBook", price: 49.99, image: "/placeholder.svg?width=400&height=400" },
    { id: 8, name: "Flower Nail & Lifter Set", price: 9.99, image: "/placeholder.svg?width=400&height=400" },
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-800">Shop Our Tools & Supplies</h1>
          <p className="text-gray-600 mt-2">Everything you need to start your buttercream flower journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {products.map((product) => (
            <div key={product.id} className="group text-center product-card-double-border p-8 bg-white">
              <Link href={`/shop/product/${product.id}`}>
                <div className="block overflow-hidden rounded-lg mb-6 aspect-video">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-serif text-2xl text-gray-800 mb-3 leading-tight">{product.name}</h3>
                <p className="text-base text-gray-600">${product.price.toFixed(2)}</p>
              </Link>
              <Button variant="clean" className="mt-4">
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
