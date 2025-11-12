"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface VimeoThumbnailProps {
  videoId: string;
  alt: string;
  fallbackUrl?: string;
  className?: string;
}

export function VimeoThumbnail({ 
  videoId, 
  alt,
  fallbackUrl = '/placeholder_peony.jpg',
  className = ""
}: VimeoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Fetch Vimeo thumbnail
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch thumbnail');
        return res.json();
      })
      .then(data => {
        if (data.thumbnail_url) {
          // Get the larger thumbnail by replacing the size parameter
          const largerThumbnail = data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720');
          setThumbnailUrl(largerThumbnail);
        } else {
          setError(true);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Vimeo thumbnail:', err);
        setError(true);
        setIsLoading(false);
      });
  }, [videoId]);

  if (isLoading) {
    return (
      <div className={`relative bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <Image
        src={fallbackUrl}
        alt={alt}
        fill
        className={className}
      />
    );
  }

  return (
    <Image
      src={thumbnailUrl}
      alt={alt}
      fill
      className={className}
      unoptimized
    />
  );
}

