"use client"

import { useEffect, useState } from 'react'
import { Package, Calendar, DollarSign, MapPin, ChevronDown, ChevronUp, CreditCard, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItem {
  name: string
  quantity: number | null
  amount: number
}

interface Order {
  id: string
  date: string
  total: number
  currency: string
  status: string
  items: OrderItem[]
  shipping?: {
    address: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      state?: string | null
      postal_code?: string | null
      country?: string | null
    }
  } | null
  paymentMethod?: {
    brand: string
    last4: string
  } | null
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAddress = (shipping: Order['shipping']) => {
    if (!shipping?.address) return null

    const { line1, line2, city, state, postal_code, country } = shipping.address
    const parts = [
      line1,
      line2,
      [city, state].filter(Boolean).join(', '),
      postal_code,
      country
    ].filter(Boolean)

    return parts.join(', ')
  }

  const formatCardBrand = (brand: string) => {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay',
    }
    return brandMap[brand.toLowerCase()] || brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  const isEbook = (itemName: string): boolean => {
    const name = itemName.toLowerCase()
    return name.includes('the ultimate tip guide') || 
           name.includes('ultimate tip guide') || 
           name.includes('ebook')
  }

  const handleDownloadEbook = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing order when clicking download
    
    try {
      const response = await fetch('/api/download-ebook')
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('You must purchase the ebook to download it.')
        } else {
          alert('Failed to download ebook. Please try again.')
        }
        return
      }

      // Get the file blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'peony-masterclass-ebook.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading ebook:', error)
      alert('Failed to download ebook. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
        <h3 className="text-xl font-serif text-gray-900 mb-6">Order History</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A771] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
        <h3 className="text-xl font-serif text-gray-900 mb-6">Order History</h3>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading orders: {error}</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
        <h3 className="text-xl font-serif text-gray-900 mb-6">Order History</h3>
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <a href="/shop" className="text-[#D4A771] hover:underline">
            Start shopping →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif text-gray-900">Order History</h3>
        <span className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id)
          
          return (
            <div 
              key={order.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#D4A771] transition-colors"
            >
              {/* Order Header */}
              <div 
                className="p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleOrderExpanded(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#f1eae6] rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-[#D4A771]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${order.total.toFixed(2)} {order.currency}
                        </span>
                        {order.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {formatCardBrand(order.paymentMethod.brand)} ••••{order.paymentMethod.last4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => {
                        const itemIsEbook = isEbook(item.name)
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-start text-sm">
                              <div className="flex-1">
                                <span className="text-gray-700">
                                  {item.name} {item.quantity && `x${item.quantity}`}
                                </span>
                              </div>
                              <span className="text-gray-900 font-medium">
                                ${item.amount.toFixed(2)}
                              </span>
                            </div>
                            {itemIsEbook && (
                              <div className="mt-1">
                                <Button
                                  onClick={(e) => handleDownloadEbook(e)}
                                  size="sm"
                                  className="!bg-[#D4A771] !text-white hover:!bg-[#C69963] flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Ebook
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatAddress(order.shipping)}
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="text-lg font-serif text-gray-900">
                        ${order.total.toFixed(2)} {order.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
