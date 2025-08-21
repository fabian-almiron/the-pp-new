"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Product } from '@/data/types'

export interface CartItem {
  id: number
  slug: string
  name: string
  price: number
  quantity: number
  image: string
  selectedHand?: string
  selectedSize?: string
  selectedColor?: string
  cartKey: string // Unique key for cart operations
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string } // Now uses cartKey
  | { type: 'UPDATE_QUANTITY'; payload: { cartKey: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SYNC_FROM_STORAGE'; payload: CartItem[] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.cartKey === action.payload.cartKey
      )

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      } else {
        const newItems = [...state.items, action.payload]
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      }
    }
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.cartKey !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.cartKey === action.payload.cartKey
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      )
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0
      }
    case 'LOAD_CART':
    case 'SYNC_FROM_STORAGE':
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (product: Product, quantity: number, options?: { hand?: string; size?: string; color?: string }) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
} | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper function to create a unique cart key
const createCartKey = (id: number, options: { hand?: string; size?: string; color?: string }) => {
  return `${id}-${options.hand || 'none'}-${options.size || 'none'}-${options.color || 'none'}`
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Migrate old cart items that don't have cartKey
        const migratedCart = parsedCart.map((item: any) => {
          if (!item.cartKey) {
            return {
              ...item,
              cartKey: createCartKey(item.id, {
                hand: item.selectedHand,
                size: item.selectedSize,
                color: item.selectedColor
              })
            }
          }
          return item
        })
        dispatch({ type: 'LOAD_CART', payload: migratedCart })
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
      }
    }
  }, [])

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue) {
        try {
          const parsedCart = JSON.parse(e.newValue)
          dispatch({ type: 'SYNC_FROM_STORAGE', payload: parsedCart })
        } catch (error) {
          console.error('Failed to sync cart from storage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product, quantity: number, options: { hand?: string; size?: string; color?: string } = {}) => {
    const cartKey = createCartKey(product.id, options)
    const cartItem: CartItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]?.src || '',
      selectedHand: options.hand,
      selectedSize: options.size,
      selectedColor: options.color,
      cartKey
    }
    dispatch({ type: 'ADD_ITEM', payload: cartItem })
  }

  const removeItem = (cartKey: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartKey })
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartKey, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}
