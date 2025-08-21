# Shopping Cart System

This document describes the shopping cart functionality implemented for The Piped Peony website.

## Features

### Cart Context (`contexts/cart-context.tsx`)
- **State Management**: Uses React Context with useReducer for cart state
- **Persistence**: Automatically saves cart to localStorage
- **Item Management**: Add, remove, update quantity, clear cart
- **Variant Support**: Handles product variants (hand preference, size, color)
- **Duplicate Prevention**: Combines identical items with same variants

### Cart Page (`app/cart/page.tsx`)
- **Responsive Design**: Adapts to different screen sizes using Tailwind CSS
- **Table Layout**: Clean table showing product details, price, quantity, and total
- **Quantity Controls**: +/- buttons and direct input for quantity adjustment
- **Remove Items**: Red X button to remove individual items
- **Cart Actions**: Update cart and proceed to checkout buttons
- **Empty State**: Shows "Continue Shopping" when cart is empty

### Integration Points
- **Item Pages**: ADD TO CART button adds items with selected variants
- **Header**: Shopping cart icon with item count badge
- **Navigation**: Cart accessible from header and shop page

## Usage

### Adding Items to Cart
1. Navigate to a product page (`/shop/item/[slug]`)
2. Select any variants (hand preference, size, color)
3. Choose quantity
4. Click "ADD TO CART" button
5. Item is added to cart with selected options

### Managing Cart
1. Click cart icon in header to view cart
2. Adjust quantities using +/- buttons or direct input
3. Remove items using the red X button
4. Click "Update Cart" to apply changes
5. Click "Proceed to Checkout" to continue

### Cart Persistence
- Cart items are automatically saved to browser localStorage
- Cart state persists across page refreshes and browser sessions
- Cart is cleared when "Clear Cart" is called (not currently exposed in UI)

## Technical Details

### State Structure
```typescript
interface CartItem {
  id: number
  slug: string
  name: string
  price: number
  quantity: number
  image: string
  selectedHand?: string
  selectedSize?: string
  selectedColor?: string
}
```

### Key Functions
- `addItem(product, quantity, options)`: Add product to cart
- `removeItem(id)`: Remove item by ID
- `updateQuantity(id, quantity)`: Update item quantity
- `clearCart()`: Remove all items
- `getItemCount()`: Get total number of items

### Styling
- Uses Tailwind CSS for responsive design
- Maintains font styles from `globals.css`
- Follows the design aesthetic shown in the reference image
- Decorative flower illustrations in background

## Future Enhancements
- Toast notifications for cart actions
- Cart summary in header dropdown
- Save cart for later functionality
- Guest checkout process
- Integration with payment processing
