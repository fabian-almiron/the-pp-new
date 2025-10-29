"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

/**
 * Site-Wide Migration Banner
 * 
 * Optional component to display a migration notice across all pages.
 * Shows at the top of the page to notify users about the authentication upgrade.
 * 
 * Usage:
 * Add to app/layout.tsx or any page where you want to show the notice.
 * 
 * Example:
 * import MigrationBanner from '@/components/migration-banner';
 * 
 * <MigrationBanner 
 *   showBanner={true}
 *   autoHideAfterDays={21}
 *   launchDate="2025-11-15"
 * />
 */

interface MigrationBannerProps {
  // Whether to show the banner (can be controlled by env variable)
  showBanner?: boolean;
  
  // Automatically hide after X days from launch date
  autoHideAfterDays?: number;
  
  // Launch date (format: YYYY-MM-DD)
  launchDate?: string;
  
  // Custom message (optional)
  customMessage?: string;
}

export default function MigrationBanner({
  showBanner = true,
  autoHideAfterDays = 21,
  launchDate,
  customMessage
}: MigrationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the banner
    const dismissed = localStorage.getItem('migration-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    // Check if we should show based on date
    if (launchDate && autoHideAfterDays) {
      const launch = new Date(launchDate);
      const hideAfter = new Date(launch);
      hideAfter.setDate(hideAfter.getDate() + autoHideAfterDays);
      
      const now = new Date();
      if (now < launch || now > hideAfter) {
        setIsVisible(false);
        return;
      }
    }

    // Show the banner
    setIsVisible(showBanner);
  }, [showBanner, launchDate, autoHideAfterDays]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('migration-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="migration-site-banner">
      <div className="migration-site-banner-content">
        <div className="migration-site-banner-text">
          <strong>Improved Login System</strong>
          {customMessage ? (
            <span> {customMessage}</span>
          ) : (
            <span> We've upgraded to a more secure authentication system. Next time you log in, use social login or reset your password.</span>
          )}
          <Link href="/login" className="migration-site-banner-link">
            Learn More
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="migration-site-banner-close"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Add this CSS to your globals.css:
 * 
 * .migration-site-banner {
 *   background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
 *   color: white;
 *   padding: 0.75rem 1rem;
 *   position: sticky;
 *   top: 0;
 *   z-index: 50;
 *   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
 * }
 * 
 * .migration-site-banner-content {
 *   max-width: 1200px;
 *   margin: 0 auto;
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   gap: 1rem;
 * }
 * 
 * .migration-site-banner-text {
 *   font-size: 0.9rem;
 *   line-height: 1.4;
 *   display: flex;
 *   align-items: center;
 *   gap: 0.5rem;
 *   flex-wrap: wrap;
 * }
 * 
 * .migration-site-banner-text strong {
 *   font-weight: 600;
 * }
 * 
 * .migration-site-banner-link {
 *   color: white;
 *   text-decoration: underline;
 *   font-weight: 500;
 *   white-space: nowrap;
 * }
 * 
 * .migration-site-banner-link:hover {
 *   opacity: 0.9;
 * }
 * 
 * .migration-site-banner-close {
 *   background: rgba(255, 255, 255, 0.2);
 *   border: none;
 *   color: white;
 *   padding: 0.25rem;
 *   border-radius: 4px;
 *   cursor: pointer;
 *   transition: background 0.2s;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   flex-shrink: 0;
 * }
 * 
 * .migration-site-banner-close:hover {
 *   background: rgba(255, 255, 255, 0.3);
 * }
 * 
 * @media (max-width: 640px) {
 *   .migration-site-banner {
 *     padding: 0.5rem;
 *   }
 *   
 *   .migration-site-banner-text {
 *     font-size: 0.85rem;
 *   }
 * }
 */

