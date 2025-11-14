"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Plus, Minus, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { state, removeItem, updateQuantity } = useCart()
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityChange = (cartKey: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(cartKey, newQuantity)
  }

  const handleRemoveItem = (cartKey: string) => {
    removeItem(cartKey)
  }

  const handleCheckout = async () => {
    // Check if user is signed in
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      // Redirect to login page with return URL
      router.push('/login?redirect_url=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsProcessing(true)

    try {
      // Call your API to create a Stripe Checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Modern approach: Direct redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Failed to initiate checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div 
        className="min-h-screen"
        style={{
          backgroundColor: '#f6f5f3',
          backgroundImage: 'url(/background_peony-petals.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white shadow-sm border border-gray-200 rounded-none p-8 text-center">
            <h1 className="text-3xl font-serif text-gray-900 mb-4">Your Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <Link href="/shop">
              <Button 
                text="Continue Shopping" 
                className="!bg-[#D4A771] !text-white !border-[#D4A771] hover:!bg-transparent hover:!text-[#D4A771] hover:!border-[#D4A771]"
              />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: '#f6f5f3',
        backgroundImage: 'url(/background_peony-petals.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow-sm border border-gray-200 rounded-none p-6 sm:p-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-8 text-center">Your Cart</h1>
          
          {/* Cart Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-2 font-medium text-gray-900">Product</th>
                  <th className="text-center py-4 px-2 font-medium text-gray-900">Price</th>
                  <th className="text-center py-4 px-2 font-medium text-gray-900">Quantity</th>
                  <th className="text-center py-4 px-2 font-medium text-gray-900">Total</th>
                </tr>
              </thead>
                             <tbody className="divide-y divide-gray-200">
                 {state.items.map((item) => (
                   <tr key={item.cartKey}>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-4">
                        <Link href={`/shop/item/${item.slug}`} className="w-16 h-16 bg-gray-100 rounded-none overflow-hidden flex-shrink-0 hover:opacity-80 hover:shadow-md transition-all cursor-pointer">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/shop/item/${item.slug}`} className="hover:text-blue-600 hover:underline transition-all cursor-pointer">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                              {item.selectedHand && (
                                <span className="text-gray-500 ml-2">({item.selectedHand})</span>
                              )}
                              {item.selectedSize && (
                                <span className="text-gray-500 ml-2">({item.selectedSize})</span>
                              )}
                              {item.selectedColor && (
                                <span className="text-gray-500 ml-2">({item.selectedColor})</span>
                              )}
                            </p>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-900">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                                               <button
                         onClick={() => handleQuantityChange(item.cartKey, item.quantity - 1)}
                         className="p-1 hover:bg-gray-100 transition-colors rounded"
                         disabled={item.quantity <= 1}
                       >
                         <Minus className="h-3 w-3" />
                       </button>
                       <input
                         type="number"
                         min="1"
                         value={item.quantity}
                         onChange={(e) => handleQuantityChange(item.cartKey, parseInt(e.target.value) || 1)}
                         className="w-16 text-center border border-gray-300 rounded-none px-2 py-1 text-sm"
                       />
                       <button
                         onClick={() => handleQuantityChange(item.cartKey, item.quantity + 1)}
                         className="p-1 hover:bg-gray-100 transition-colors rounded"
                       >
                         <Plus className="h-3 w-3" />
                       </button>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                                               <button
                         onClick={() => handleRemoveItem(item.cartKey)}
                         className="text-red-500 hover:text-red-700 transition-colors p-1"
                         aria-label="Remove item"
                       >
                         <X className="h-4 w-4" />
                       </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                     {/* Cart Actions */}
           <div className="flex justify-start mt-8">
             <Link href="/shop">
               <span className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                 Continue Shopping
               </span>
             </Link>
           </div>

          {/* Cart Total */}
          <div className="mt-8 text-right">
            <div className="text-2xl font-serif text-gray-900 mb-4">
              Cart Total: ${state.total.toFixed(2)}
            </div>
            {!isSignedIn && isLoaded && (
              <p className="text-sm text-gray-600 mb-3">
                Please <Link href="/login?redirect_url=/cart" className="text-blue-600 hover:underline">sign in</Link> to proceed with checkout
              </p>
            )}
            <Button
              text={isProcessing ? "Processing..." : (isSignedIn ? "Proceed to Checkout" : "Sign In to Checkout")}
              className="!bg-white !text-black !border-black hover:!bg-black hover:!text-white"
              onClick={handleCheckout}
              disabled={isProcessing || !isLoaded}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
