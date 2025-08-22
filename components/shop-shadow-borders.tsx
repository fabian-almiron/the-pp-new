"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Component for rendering shadow borders only on shop pages
export function ShopShadowBorders() {
  const pathname = usePathname();
  const isShopPage = pathname === "/shop" || pathname.startsWith("/shop/");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only proceed if mounted and on shop page
    if (!mounted || !isShopPage) {
      return;
    }

    // Function to create shadow borders for product cards
    const createShadowBorders = () => {
      // Remove any existing shadow borders first
      const existingShadows = document.querySelectorAll('.shop-shadow-border');
      existingShadows.forEach(shadow => shadow.remove());

      // Find all product cards
      const productCards = document.querySelectorAll('.product-card-double-border');
      
      productCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Create shadow border element that only shows on bottom and right sides
        const shadowBorder = document.createElement('div');
        shadowBorder.className = 'shop-shadow-border';
        shadowBorder.style.cssText = `
          position: absolute;
          top: ${rect.top + scrollTop + 12 + 6}px;
          left: ${rect.left + scrollLeft + 12 + 6}px;
          width: ${rect.width - 24}px;
          height: ${rect.height - 24}px;
          border-right: 1px solid #000000;
          border-bottom: 1px solid #000000;
          border-top: none;
          border-left: none;
          background-color: transparent;
          z-index: 0;
          pointer-events: none;
          border-radius: 0;
          box-sizing: border-box;
        `;
        
        // Create horizontal connecting line at TOP-RIGHT - from end of inner border's top line to start of shadow border's top line
        const topRightConnector = document.createElement('div');
        topRightConnector.className = 'shop-shadow-border';
        topRightConnector.style.cssText = `
          position: absolute;
          top: ${rect.top + scrollTop + 12 + 6}px;
          left: ${rect.left + scrollLeft + rect.width - 12}px;
          width: 6px;
          height: 1px;
          background-color: #000000;
          z-index: 0;
          pointer-events: none;
        `;
        
        // Create vertical connecting line at BOTTOM-LEFT - from end of inner border's left line to start of shadow border's left line
        const bottomLeftConnector = document.createElement('div');
        bottomLeftConnector.className = 'shop-shadow-border';
        bottomLeftConnector.style.cssText = `
          position: absolute;
          top: ${rect.top + scrollTop + rect.height - 12}px;
          left: ${rect.left + scrollLeft + 12 + 6}px;
          width: 1px;
          height: 6px;
          background-color: #000000;
          z-index: 0;
          pointer-events: none;
        `;
        
        document.body.appendChild(shadowBorder);
        document.body.appendChild(topRightConnector);
        document.body.appendChild(bottomLeftConnector);
      });
    };

    // Create shadows initially
    createShadowBorders();

    // Recreate shadows on scroll and resize
    const handleUpdate = () => {
      createShadowBorders();
    };

    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      const existingShadows = document.querySelectorAll('.shop-shadow-border');
      existingShadows.forEach(shadow => shadow.remove());
    };
  }, [mounted, isShopPage, pathname]);

  return null; // This component doesn't render anything directly
}
