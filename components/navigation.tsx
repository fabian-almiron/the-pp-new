"use client"

import Link from 'next/link';
import { Menu, MenuItem } from '@/lib/strapi-api';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface NavigationProps {
  menuSlug: string;
  className?: string;
  onLinkClick?: () => void;
}

interface MenuItemComponentProps {
  item: MenuItem;
  className?: string;
}

// Helper function to filter menu items based on relationType and login status
function filterMenuItemsByRelationType(items: MenuItem[], isSignedIn: boolean): MenuItem[] {
  return items
    .filter(item => {
      const relationType = item.relationType || 'View All';
      // "View All" items are shown to everyone
      if (relationType === 'View All') return true;
      // "Logged In" items are only shown to authenticated users
      if (relationType === 'Logged In') return isSignedIn;
      // "Logged Out" items are only shown to non-authenticated users
      if (relationType === 'Logged Out') return !isSignedIn;
      return true; // Default to showing the item
    })
    .map(item => ({
      ...item,
      // Recursively filter children
      children: item.children ? filterMenuItemsByRelationType(item.children, isSignedIn) : undefined,
    }));
}

function MenuItemComponent({ item, className = "", showArrow = false, arrowDirection = "right", onLinkClick }: MenuItemComponentProps & { showArrow?: boolean; arrowDirection?: "down" | "right"; onLinkClick?: () => void }) {
  const linkProps = {
    href: item.url,
    target: item.target,
    className: `${className} ${item.cssClass || ''}`.trim(),
  };

  const arrowIcon = arrowDirection === "down" ? "▾" : "▸";

  const content = (
    <>
      {item.icon && <span className={`icon ${item.icon}`} />}
      {item.title}
      {showArrow && <span className="ml-1">{arrowIcon}</span>}
    </>
  );

  // External links
  if (item.isExternal) {
    return (
      <a {...linkProps} rel="noopener noreferrer" onClick={onLinkClick}>
        {content}
      </a>
    );
  }

  // Internal links
  return (
    <Link {...linkProps} onClick={onLinkClick}>
      {content}
    </Link>
  );
}

// Collapsible mobile menu item component
function CollapsibleMenuItem({ item, level = 0, onLinkClick }: { item: MenuItem; level?: number; onLinkClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
  const textSizes = [
    "text-base font-medium text-gray-700 hover:text-[#D4A771]", // level 0
    "text-sm text-gray-600 hover:text-[#D4A771]", // level 1
    "text-sm text-gray-500 hover:text-[#D4A771]" // level 2
  ];
  
  const paddingClasses = [
    "px-4 py-3 rounded-lg hover:bg-[#FBF9F6]", // level 0
    "px-3 py-2 rounded-md hover:bg-gray-50", // level 1
    "px-3 py-2 rounded-md hover:bg-gray-50" // level 2
  ];

  const className = `block ${textSizes[level]} ${paddingClasses[level]} transition-all`;

  if (!hasChildren) {
    return (
      <MenuItemComponent 
        item={item} 
        className={className}
        onLinkClick={onLinkClick}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full ${className} text-left`}
      >
        <span>{item.title}</span>
        {hasChildren && (
          isOpen ? 
            <ChevronDown className="h-4 w-4 text-[#D4A771]" /> : 
            <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      {hasChildren && isOpen && (
        <ul className={`pl-3 mt-1 space-y-1`}>
          {item.children?.filter(child => child).map((child) => (
            <li key={child.id}>
              <CollapsibleMenuItem item={child} level={level + 1} onLinkClick={onLinkClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Navigation({ menuSlug, className = "", onLinkClick }: NavigationProps) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check localStorage cache first (client-side only)
    const cached = localStorage.getItem(`menu_${menuSlug}`);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache is valid for 10 seconds during development
        if (Date.now() - timestamp < 10000) {
          setMenu(data);
          setLoading(false);
          return; // Use cached data, don't fetch
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch from API route if no valid cache
    async function loadMenu() {
      try {
        const response = await fetch(`/api/menu?slug=${menuSlug}`);
        const result = await response.json();
        
        if (!response.ok || result.error || !result.data) {
          setError(result.error || 'Menu not found');
        } else {
          setMenu(result.data);
          // Cache the menu data
          localStorage.setItem(`menu_${menuSlug}`, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    loadMenu();
  }, [menuSlug, mounted]);

  if (loading || !userLoaded) {
    return null; // Or a skeleton loader
  }

  if (error || !menu || !menu.menuItems || !Array.isArray(menu.menuItems)) {
    console.warn(`Menu "${menuSlug}" not found or invalid:`, error);
    return null;
  }

  // Filter menu items based on relationType and login status
  const filteredMenuItems = filterMenuItemsByRelationType(menu.menuItems, isSignedIn || false);

  // Check if this is a header navigation (has header-nav class)
  const isHeaderNav = className?.includes('header-nav');
  
  return (
    <nav className={className}>
      {isHeaderNav ? (
        // Header navigation layout - render only top-level items
        <>
          {filteredMenuItems.filter(item => item).map((item) => (
              <div key={item.id} className="relative group">
                <MenuItemComponent 
                  item={item} 
                  className="header-nav-link"
                  showArrow={item.children && item.children.length > 0}
                  arrowDirection="down"
                  onLinkClick={onLinkClick}
                />
                
                {/* Dropdown for children */}
                {item.children && Array.isArray(item.children) && item.children.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.children.filter(child => child).map((child) => (
                      <div key={child.id} className="relative group/nested">
                        <MenuItemComponent 
                          item={child} 
                          className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                          showArrow={child.children && child.children.length > 0}
                          onLinkClick={onLinkClick}
                        />
                        
                        {/* Nested dropdown for grandchildren (3rd level) */}
                        {child.children && Array.isArray(child.children) && child.children.length > 0 && (
                          <div className="absolute left-full top-0 ml-1 bg-white shadow-lg rounded-md py-2 min-w-48 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 z-50">
                            {child.children.filter(grandchild => grandchild).map((grandchild) => (
                              <MenuItemComponent 
                                key={grandchild.id}
                                item={grandchild} 
                                className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                                onLinkClick={onLinkClick}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </>
      ) : (
        // Default navigation layout (mobile/sidebar) - collapsible
        <ul className="flex flex-col space-y-2">
          {filteredMenuItems.filter(item => item).map((item) => (
              <li key={item.id}>
                <CollapsibleMenuItem item={item} level={0} onLinkClick={onLinkClick} />
              </li>
            ))}
        </ul>
      )}
    </nav>
  );
}
