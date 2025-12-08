"use client"

import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

const EBOOK_PRODUCTS = {
  'the-ultimate-tip-guide': {
    productId: 'prod_SP1bz7J9np1Elf',
    names: ['the ultimate tip guide', 'ultimate tip guide'],
    fileName: 'the-ultimate-tip-guide.pdf',
    displayName: 'The Ultimate Tip Guide',
    description: 'Your complete guide to piping tips and techniques',
  },
  'the-caddy-book-set': {
    productId: 'prod_SGCInU8ZdnTmuW',
    names: ['the caddy & book set', 'the caddy book set', 'caddy book set', 'caddy book', 'caddy'],
    fileName: 'the-caddy-book-set.pdf',
    displayName: 'The Caddy Book Set',
    description: 'Essential reference for your baking caddy',
  },
}

interface PurchasedEbook {
  slug: string
  displayName: string
  description: string
  fileName: string
}

export default function DigitalDownloads() {
  const [purchasedEbooks, setPurchasedEbooks] = useState<PurchasedEbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null)

  useEffect(() => {
    checkPurchasedEbooks()
  }, [])

  const checkPurchasedEbooks = async () => {
    try {
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        console.error('Failed to fetch orders')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const orders = data.orders || []
      
      // Track which ebooks the user has purchased
      const purchasedSlugs = new Set<string>()
      
      // Check all order items
      for (const order of orders) {
        for (const item of order.items) {
          const itemName = item.name.toLowerCase()
          
          // Check if item matches any ebook product
          for (const [slug, config] of Object.entries(EBOOK_PRODUCTS)) {
            if (config.names.some(name => itemName.includes(name.toLowerCase()))) {
              purchasedSlugs.add(slug)
            }
          }
        }
      }
      
      // Convert to array of ebook objects
      const ebooks: PurchasedEbook[] = Array.from(purchasedSlugs).map(slug => {
        const config = EBOOK_PRODUCTS[slug as keyof typeof EBOOK_PRODUCTS]
        return {
          slug,
          displayName: config.displayName,
          description: config.description,
          fileName: config.fileName,
        }
      })
      
      setPurchasedEbooks(ebooks)
    } catch (error) {
      console.error('Error checking purchased ebooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (slug: string) => {
    setDownloadingSlug(slug)
    
    try {
      const response = await fetch(`/api/download-ebook?ebook=${slug}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('You must purchase this ebook to download it.')
        } else {
          alert('Failed to download ebook. Please try again.')
        }
        return
      }

      // Get the file blob
      const blob = await response.blob()
      const config = EBOOK_PRODUCTS[slug as keyof typeof EBOOK_PRODUCTS]
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = config.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading ebook:', error)
      alert('Failed to download ebook. Please try again.')
    } finally {
      setDownloadingSlug(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
        <h3 className="text-xl font-serif text-gray-900 mb-6">Digital Downloads</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A771] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your downloads...</p>
        </div>
      </div>
    )
  }

  if (purchasedEbooks.length === 0) {
    return null // Don't show section if no ebooks purchased
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif text-gray-900">Digital Downloads</h3>
        <span className="text-sm text-gray-500">
          {purchasedEbooks.length} {purchasedEbooks.length === 1 ? 'ebook' : 'ebooks'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {purchasedEbooks.map((ebook) => (
          <div
            key={ebook.slug}
            className="border border-gray-200 rounded-lg p-6 hover:border-[#D4A771] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#f1eae6] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-[#D4A771]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">
                  {ebook.displayName}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {ebook.description}
                </p>
                <Button
                  onClick={() => handleDownload(ebook.slug)}
                  disabled={downloadingSlug === ebook.slug}
                  size="sm"
                  className="!bg-[#D4A771] !text-white hover:!bg-[#C69963] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {downloadingSlug === ebook.slug ? 'Downloading...' : 'Download PDF'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Your downloads are available anytime. The PDF file is 18MB.
      </p>
    </div>
  )
}

