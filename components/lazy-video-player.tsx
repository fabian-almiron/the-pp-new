"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LazyVideoPlayerProps {
  videoId: string;
  thumbnailUrl?: string;
  title?: string;
}

export function LazyVideoPlayer({ 
  videoId, 
  thumbnailUrl,
  title = "Video" 
}: LazyVideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [vimeoThumbnail, setVimeoThumbnail] = useState<string | null>(null);

  // Fetch Vimeo thumbnail if no custom thumbnail provided
  useEffect(() => {
    if (!thumbnailUrl && videoId) {
      fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
        .then(res => res.json())
        .then(data => {
          if (data.thumbnail_url) {
            // Get the larger thumbnail by replacing the size parameter
            const largerThumbnail = data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720');
            setVimeoThumbnail(largerThumbnail);
          }
        })
        .catch(err => {
          console.error('Error fetching Vimeo thumbnail:', err);
        });
    }
  }, [videoId, thumbnailUrl]);

  const handlePlayClick = () => {
    setIsLoaded(true);
  };

  const displayThumbnail = thumbnailUrl || vimeoThumbnail;

  if (!isLoaded) {
    return (
      <div className="relative aspect-video bg-black rounded-md overflow-hidden shadow-lg cursor-pointer group">
        {/* Thumbnail Image */}
        {displayThumbnail ? (
          <div className="absolute inset-0">
            <Image
              src={displayThumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              unoptimized={!thumbnailUrl} // Use unoptimized for external Vimeo URLs
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="animate-pulse text-white">Loading thumbnail...</div>
          </div>
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
        
        {/* Play Button */}
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center z-10"
          aria-label="Play video"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-lg">
            <svg 
              className="w-8 h-8 ml-1" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-md overflow-hidden shadow-lg">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        title={title}
        loading="lazy"
      />
    </div>
  );
}

