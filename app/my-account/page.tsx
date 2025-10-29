"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, LogOut, ShoppingBag, BookOpen, Crown, Star } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useRole } from "@/hooks/use-role"
import OrderHistory from "@/components/order-history"

export default function MyAccountPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { role, roleDisplayName, roleBadgeColor, roleDescription, isSubscriber } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login?redirect_url=/my-account')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn || !user) {
    return null
  }

  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'N/A'

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">My Account</h1>
          <p className="text-gray-600">Manage your profile and account settings</p>
        </div>

        {/* Account Info Card */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-8 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#D4A771] to-[#C69963] p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#D4A771] text-3xl font-serif">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-serif">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${roleBadgeColor}`}>
                    {isSubscriber ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                    {roleDisplayName}
                  </span>
                </div>
                <p className="text-white/90 mb-1">{user.primaryEmailAddress?.emailAddress}</p>
                <p className="text-white/75 text-sm">{roleDescription}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-[#D4A771]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-900 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#D4A771]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-900 font-medium">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  {user.primaryEmailAddress?.verification?.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#D4A771]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-900 font-medium">{joinedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-[#D4A771]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Type</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border ${roleBadgeColor}`}>
                      {isSubscriber ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                      {roleDisplayName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{roleDescription}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-[#D4A771]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Authentication</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.externalAccounts?.map((account) => (
                      <span key={account.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {account.provider === 'oauth_google' && '🔵 Google'}
                        {account.provider === 'oauth_facebook' && '📘 Facebook'}
                        {account.provider === 'oauth_apple' && '🍎 Apple'}
                        {account.provider === 'oauth_github' && '🐙 GitHub'}
                      </span>
                    ))}
                    {(!user.externalAccounts || user.externalAccounts.length === 0) && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        📧 Email/Password
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/video-library" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center group-hover:bg-[#D4A771] transition-colors">
                  <BookOpen className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Video Library</h3>
                  <p className="text-sm text-gray-600">Access your courses</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/cart" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center group-hover:bg-[#D4A771] transition-colors">
                  <ShoppingBag className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Shopping Cart</h3>
                  <p className="text-sm text-gray-600">View your cart</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/shop" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center group-hover:bg-[#D4A771] transition-colors">
                  <ShoppingBag className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Shop</h3>
                  <p className="text-sm text-gray-600">Browse products</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Order History */}
        <OrderHistory />

        {/* Account Management */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mt-8">
          <h3 className="text-xl font-serif text-gray-900 mb-6">Account Management</h3>
          
          <div className="space-y-4">
            {!isSubscriber && (
              <Link href="/upgrade">
                <Button className="w-full md:w-auto flex items-center gap-2 !bg-[#D4A771] !text-white hover:!bg-[#C69963] mb-4">
                  <Crown className="h-4 w-4" />
                  Upgrade to Subscriber
                </Button>
              </Link>
            )}
            
            <Button
              onClick={() => window.location.href = '/api/auth/signout'}
              variant="outline"
              className="w-full md:w-auto flex items-center gap-2 !border-red-300 !text-red-600 hover:!bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Need help? Contact us at <a href="mailto:support@pipedpeony.com" className="text-[#D4A771] hover:underline">support@pipedpeony.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

