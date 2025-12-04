"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, LogOut, ShoppingBag, BookOpen, Crown, Star, AlertTriangle, Edit2, Save, X, CreditCard } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRole } from "@/hooks/use-role"
import { useStripeCustomer } from "@/hooks/use-stripe-customer"
import { useNameSync } from "@/hooks/use-name-sync"
import OrderHistory from "@/components/order-history"

export default function MyAccountPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const { role, roleDisplayName, roleBadgeColor, roleDescription, isSubscriber } = useRole()
  const { isLinked: isStripeLinked } = useStripeCustomer() // Auto-link Stripe customer
  useNameSync() // Auto-sync name from Stripe if missing
  const router = useRouter()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false)
  
  // Account editing states
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login?redirect_url=/my-account')
    }
  }, [isLoaded, isSignedIn, router])

  // Initialize form fields with current user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setNewEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [user])

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    setCancelError(null)

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setCancelSuccess(true)
        setShowCancelDialog(false)
        // Reload user data to get updated subscription status
        if (user) {
          await user.reload()
        }
      } else {
        setCancelError(data.error || 'Failed to cancel subscription')
      }
    } catch (error: any) {
      setCancelError(error.message || 'An error occurred')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUpdateName = async () => {
    if (!user) return
    
    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    try {
      await user.update({
        firstName: firstName,
        lastName: lastName,
      })
      
      setUpdateSuccess("Name updated successfully!")
      setIsEditingName(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(null), 3000)
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update name')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!user) return
    
    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    try {
      // Add new email address
      await user.createEmailAddress({ email: newEmail })
      
      // Note: User will need to verify the new email
      setUpdateSuccess("Verification email sent! Please check your inbox to verify your new email address.")
      setIsEditingEmail(false)
      
      // Clear success message after 5 seconds
      setTimeout(() => setUpdateSuccess(null), 5000)
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update email')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user) return
    
    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setUpdateError("New passwords don't match")
      setIsUpdating(false)
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      setUpdateError("Password must be at least 8 characters long")
      setIsUpdating(false)
      return
    }

    try {
      await user.updatePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
      })
      
      setUpdateSuccess("Password updated successfully!")
      setIsEditingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(null), 3000)
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update password')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = (type: 'name' | 'email' | 'password') => {
    setUpdateError(null)
    setUpdateSuccess(null)
    
    if (type === 'name') {
      setIsEditingName(false)
      setFirstName(user?.firstName || "")
      setLastName(user?.lastName || "")
    } else if (type === 'email') {
      setIsEditingEmail(false)
      setNewEmail(user?.primaryEmailAddress?.emailAddress || "")
    } else if (type === 'password') {
      setIsEditingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  const handleManageBilling = async () => {
    setIsLoadingBillingPortal(true)
    
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe billing portal
        window.location.href = data.url
      } else {
        setUpdateError(data.error || 'Failed to open billing portal')
        setTimeout(() => setUpdateError(null), 5000)
      }
    } catch (error: any) {
      setUpdateError(error.message || 'An error occurred')
      setTimeout(() => setUpdateError(null), 5000)
    } finally {
      setIsLoadingBillingPortal(false)
    }
  }

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
        backgroundImage: 'url(/background_peony-petals.webp)',
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

              <div className="flex items-start gap-4 md:col-span-2">
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

        {/* Edit Account Settings */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-8 p-8">
          <h3 className="text-xl font-serif text-gray-900 mb-6">Account Settings</h3>
          
          {/* Success/Error Messages */}
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">{updateSuccess}</p>
              </div>
            </div>
          )}
          
          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{updateError}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Edit Name Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#D4A771]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    {!isEditingName && (
                      <p className="text-gray-900 font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                  </div>
                </div>
                {!isEditingName && (
                  <Button
                    onClick={() => setIsEditingName(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingName && (
                <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="flex items-center gap-2 !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
                    >
                      <Save className="h-4 w-4" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => handleCancelEdit('name')}
                      disabled={isUpdating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Email Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#D4A771]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    {!isEditingEmail && (
                      <div>
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
                    )}
                  </div>
                </div>
                {!isEditingEmail && (
                  <Button
                    onClick={() => setIsEditingEmail(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingEmail && (
                <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      You'll receive a verification email at the new address.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={isUpdating}
                      className="flex items-center gap-2 !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
                    >
                      <Save className="h-4 w-4" />
                      {isUpdating ? 'Updating...' : 'Update Email'}
                    </Button>
                    <Button
                      onClick={() => handleCancelEdit('email')}
                      disabled={isUpdating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Password Section - Only show if user uses email/password auth */}
            {(!user.externalAccounts || user.externalAccounts.length === 0) && (
              <div className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#D4A771]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      {!isEditingPassword && (
                        <p className="text-gray-900 font-medium">••••••••</p>
                      )}
                    </div>
                  </div>
                  {!isEditingPassword && (
                    <Button
                      onClick={() => setIsEditingPassword(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Change
                    </Button>
                  )}
                </div>
                
                {isEditingPassword && (
                  <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={isUpdating}
                        className="flex items-center gap-2 !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
                      >
                        <Save className="h-4 w-4" />
                        {isUpdating ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        onClick={() => handleCancelEdit('password')}
                        disabled={isUpdating}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/video-library" className="group">
            <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-full flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A771] transition-colors">
                  <BookOpen className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-medium text-gray-900 mb-0.5">Video Library</h3>
                  <p className="text-sm text-gray-600 mb-0">Access your courses</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/cart" className="group">
            <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-full flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A771] transition-colors">
                  <ShoppingBag className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-medium text-gray-900 mb-0.5">Shopping Cart</h3>
                  <p className="text-sm text-gray-600 mb-0">View your cart</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/shop" className="group">
            <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-full flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A771] transition-colors">
                  <ShoppingBag className="h-6 w-6 text-[#D4A771] group-hover:text-white transition-colors" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-medium text-gray-900 mb-0.5">Shop</h3>
                  <p className="text-sm text-gray-600 mb-0">Browse products</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Order History */}
        <OrderHistory />

        {/* Account Management */}
        <div className="mt-8">
          <h3 className="text-2xl font-serif text-gray-900 mb-6">Account Management</h3>
          
          {/* Success Message */}
          {cancelSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-900">Subscription Cancelled</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your subscription has been cancelled. You'll continue to have access until the end of your current billing period.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upgrade/Cancel Subscription Card */}
            {!isSubscriber ? (
              <Link href="/upgrade" className="group">
                <div className="bg-white border-2 border-[#D4A771] rounded-lg p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4A771] to-[#C69963] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Subscriber</h4>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Get unlimited access to all courses, recipes, and exclusive content
                    </p>
                    <div className="flex items-center text-[#D4A771] font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <button onClick={() => setShowCancelDialog(true)} className="group text-left">
                <div className="bg-white border border-orange-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-orange-300">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                      <AlertTriangle className="h-7 w-7 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription</h4>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Cancel your subscription anytime. You'll keep access until the end of your billing period
                    </p>
                    <div className="flex items-center text-orange-600 font-medium text-sm">
                      <span>Manage Subscription</span>
                    </div>
                  </div>
                </div>
              </button>
            )}
            
            {/* Manage Billing Card */}
            {(isStripeLinked || isSubscriber) && (
              <button 
                onClick={handleManageBilling}
                disabled={isLoadingBillingPortal}
                className="group text-left"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-[#D4A771] disabled:opacity-50 disabled:cursor-not-allowed h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-[#f1eae6] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#D4A771] transition-colors">
                      <CreditCard className="h-7 w-7 text-[#D4A771] group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {isLoadingBillingPortal ? 'Loading...' : 'Manage Billing'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Update payment methods, view invoices, and manage billing information
                    </p>
                    <div className="flex items-center text-[#D4A771] font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Open Billing Portal</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            )}
            
            {/* Sign Out Card */}
            <button 
              onClick={() => signOut(() => router.push('/'))}
              className="group text-left"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-red-300 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                    <LogOut className="h-7 w-7 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h4>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    Securely sign out of your account
                  </p>
                  <div className="flex items-center text-red-600 font-medium text-sm">
                    <span>Sign Out Now</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:mel@thepipedpeony.com" className="text-[#D4A771] hover:underline font-medium">
                mel@thepipedpeony.com
              </a>
            </p>
          </div>
        </div>

        {/* Cancel Subscription Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-serif text-gray-900">Cancel Subscription?</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your subscription? You'll continue to have access to all premium content until the end of your current billing period.
              </p>

              {cancelError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">{cancelError}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCancelDialog(false)
                    setCancelError(null)
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isCancelling}
                >
                  Keep Subscription
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 !bg-orange-600 !text-white hover:!bg-orange-700"
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

