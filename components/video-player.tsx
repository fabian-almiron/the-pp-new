"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Chapter } from "@/data/types";

interface VideoPlayerProps {
  chapter: Chapter;
}

export interface VideoPlayerRef {
  playVideo: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ chapter }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract video ID and timestamp from Vimeo URL
  const parseVimeoUrl = (url: string) => {
    if (!url) return { videoId: null, timestamp: 0 };
    
    // Handle URLs like: https://player.vimeo.com/video/818412860#t=00.00.01
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    const timestampMatch = url.match(/#t=([^&]*)/);
    
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    let timestamp = 0;
    
    if (timestampMatch) {
      const timeStr = timestampMatch[1];
      // Parse timestamp format like "00.00.01" (hours.minutes.seconds)
      const timeParts = timeStr.split('.');
      if (timeParts.length === 3) {
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        const seconds = parseInt(timeParts[2]) || 0;
        timestamp = hours * 3600 + minutes * 60 + seconds;
      }
    }
    
    return { videoId, timestamp };
  };

  const { videoId, timestamp } = parseVimeoUrl(chapter.videoSrc);

  // Expose playVideo method to parent component
  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (player && typeof player.play === 'function') {
        // First ensure the video is unmuted, then play it
        Promise.resolve()
          .then(() => {
            // Get current muted state
            if (typeof player.getMuted === 'function') {
              return player.getMuted();
            }
            return false;
          })
          .then((isMuted) => {
            // If muted, unmute it
            if (isMuted && typeof player.setMuted === 'function') {
              return player.setMuted(false);
            }
          })
          .then(() => {
            // Set volume to 100% (unmuted)
            if (typeof player.setVolume === 'function') {
              return player.setVolume(1);
            }
          })
          .then(() => {
            // Then play the video
            return player.play();
          })
          .catch((error: any) => {
            console.error('Error playing/unmuting video:', error);
            // Try to play anyway, even if unmuting failed
            if (player && typeof player.play === 'function') {
              player.play().catch((e: any) => {
                console.error('Final play attempt failed:', e);
              });
            }
          });
      }
    }
  }), [player]);

  // Load Vimeo Player API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Vimeo Player API is already loaded
    if (window.Vimeo) {
      initializePlayer();
      return;
    }

    // Load Vimeo Player API script
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => {
      initializePlayer();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Initialize Vimeo player when video changes
  useEffect(() => {
    if (window.Vimeo && videoId && containerRef.current) {
      initializePlayer();
    }
  }, [videoId, chapter.videoSrc]);

  const initializePlayer = () => {
    if (!videoId || !containerRef.current || !window.Vimeo) return;

    setIsLoading(true);

    // Destroy existing player if it exists
    if (player) {
      try {
        player.destroy();
      } catch (error) {
        console.log('Player already destroyed or invalid');
      }
      setPlayer(null);
    }

    // Clear the container
    containerRef.current.innerHTML = '';

    // Detect if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Create new Vimeo player
    const newPlayer = new window.Vimeo.Player(containerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      responsive: true,
      muted: false, // Explicitly set to unmuted
      autopause: false,
    });

    // Set up event listeners
    newPlayer.ready().then(() => {
      setIsLoading(false);
      setPlayer(newPlayer);
      
      // Ensure video is unmuted
      return Promise.resolve()
        .then(() => {
          if (typeof newPlayer.setMuted === 'function') {
            return newPlayer.setMuted(false);
          }
        })
        .then(() => {
          // Set volume to 100%
          return newPlayer.setVolume(1);
        })
        .then(() => {
          // Jump to timestamp if specified (after player is set)
          if (timestamp > 0) {
            return newPlayer.setCurrentTime(timestamp).then(() => {
              // Only auto-play on desktop, not on mobile
              if (!isMobile) {
                return newPlayer.play();
              }
            });
          } else if (!isMobile) {
            // Auto-play on desktop only
            return newPlayer.play();
          }
        });
    }).catch((error: any) => {
      console.error('Error loading Vimeo player:', error);
      setIsLoading(false);
    });
  };

  // Jump to timestamp when chapter changes (but not on initial load)
  useEffect(() => {
    if (player && timestamp > 0) {
      // Use a timeout to avoid rapid successive calls
      const timeoutId = setTimeout(() => {
        // Check if player is still valid before proceeding
        if (!player || typeof player.setCurrentTime !== 'function') {
          console.log('Player not available for timestamp jump');
          return;
        }

        // Detect if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        player.setCurrentTime(timestamp).then(() => {
          // Ensure video is unmuted
          if (typeof player.setMuted === 'function') {
            return player.setMuted(false);
          }
        }).then(() => {
          // Set volume to 100% (unmuted)
          if (typeof player.setVolume === 'function') {
            return player.setVolume(1);
          }
        }).then(() => {
          // Only auto-play on desktop, not on mobile
          if (!isMobile && player && typeof player.play === 'function') {
            return player.play();
          }
        }).catch((error: any) => {
          console.error('Error setting timestamp, unmuting, or playing video:', error);
        });
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [player, timestamp]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.log('Player cleanup: already destroyed');
        }
      }
    };
  }, [player]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="relative mt-4 aspect-video bg-gray-100 rounded-md flex items-center justify-center">
        <p className="text-gray-500">No video available for this chapter</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mt-4 aspect-video bg-black rounded-md overflow-hidden shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
