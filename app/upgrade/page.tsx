"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Star, Crown } from "lucide-react"
import Link from "next/link"
import { useRole } from "@/hooks/use-role"
import { useSubscription } from "@/hooks/use-subscription"
import { Suspense, useState } from "react"

function UpgradeContent() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect_url') || '/shop'
  const { role, roleDisplayName, isSubscriber } = useRole()
  const { availableSubscriptions, createSubscriptionCheckout } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  if (isSubscriber) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Crown className="w-16 h-16 text-[#D4A771] mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-gray-900 mb-4">You're Already a Subscriber!</h1>
          <p className="text-gray-600 mb-6">You have full access to all premium content.</p>
          <Link href={redirectPath}>
            <Button className="!bg-[#D4A771] !text-white hover:!bg-[#C69963]">
              Continue to Content
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: '#f6f5f3',
        backgroundImage: 'url(/background_peony-petals.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Upgrade to Subscriber
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Unlock premium content and advanced tutorials
          </p>
          <p className="text-sm text-gray-500">
            Current plan: <span className="font-medium">{roleDisplayName}</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Current Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif text-gray-900 mb-2">Customer</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">Free</div>
              <p className="text-gray-600">Your current plan</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Browse and purchase products</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Access to free content</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Shopping cart and checkout</span>
              </li>
            </ul>
            
            <Button 
              variant="outline" 
              className="w-full !border-gray-300 !text-gray-700"
              disabled
            >
              Current Plan
            </Button>
          </div>

          {/* Subscriber Plan */}
          <div className="bg-white border-2 border-[#D4A771] rounded-lg p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#D4A771] text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </span>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 text-[#D4A771]" />
                <h3 className="text-2xl font-serif text-gray-900">Subscriber</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {availableSubscriptions.length > 0 
                  ? `$${availableSubscriptions[0].subscriptionPrice}`
                  : '$29'
                }
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">
                {availableSubscriptions.length > 0 && availableSubscriptions[0].freeTrialDays > 0
                  ? `${availableSubscriptions[0].freeTrialDays} days free trial`
                  : 'Full access to everything'
                }
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Everything in Customer plan</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Full video library access</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Academy courses and tutorials</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Color and recipe libraries</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Premium category content</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>
            
            <Button 
              className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
              onClick={async () => {
                if (availableSubscriptions.length > 0) {
                  setIsLoading(true)
                  try {
                    const checkoutUrl = await createSubscriptionCheckout(availableSubscriptions[0].documentId)
                    window.location.href = checkoutUrl
                  } catch (error) {
                    console.error('Subscription error:', error)
                    alert('Failed to start subscription process. Please try again.')
                  } finally {
                    setIsLoading(false)
                  }
                }
              }}
              disabled={isLoading || availableSubscriptions.length === 0}
            >
              {isLoading ? 'Processing...' : 'Upgrade Now'}
            </Button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href={redirectPath} className="text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to {redirectPath === '/shop' ? 'Shop' : 'Previous Page'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
