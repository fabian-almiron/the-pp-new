"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const [orderCleared, setOrderCleared] = useState(false)

  useEffect(() => {
    // Clear the cart after successful checkout (only once)
    if (sessionId && !orderCleared) {
      clearCart()
      setOrderCleared(true)
    }
  }, [sessionId, clearCart, orderCleared])

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: '#f6f5f3',
        backgroundImage: 'url(/background_peony-petals.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow-sm border border-gray-200 rounded-none p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-gray-600 mb-2">
            Your payment was successful.
          </p>
          
          {sessionId && (
            <p className="text-sm text-gray-500 mb-6">
              Order Reference: {sessionId.slice(0, 20)}...
            </p>
          )}
          
          <p className="text-gray-700 mb-8">
            You will receive an email confirmation shortly with your order details and tracking information.
          </p>
          
          <div className="space-y-4">
            <Link href="/shop">
              <Button 
                text="Continue Shopping" 
                className="!bg-[#D4A771] !text-white !border-[#D4A771] hover:!bg-transparent hover:!text-[#D4A771] hover:!border-[#D4A771]"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

