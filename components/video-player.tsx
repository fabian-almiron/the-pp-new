"use client";

import { useEffect, useRef } from "react";
import { Chapter } from "@/data/types";

interface VideoPlayerProps {
  chapter: Chapter;
}

export function VideoPlayer({ chapter }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && chapter.videoSrc) {
      videoRef.current.src = chapter.videoSrc;
      videoRef.current.load();
      // Auto-play when chapter changes (you may want to remove this for better UX)
      videoRef.current.play().catch(() => {
        // Handle autoplay policy restrictions
        console.log("Autoplay prevented by browser policy");
      });
    }
  }, [chapter.videoSrc]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-gray-900">
        {chapter.title}
      </h1>
      <p className="text-lg text-gray-500 mt-1">
        Duration: {formatDuration(chapter.duration)}
      </p>
      
      <div className="relative mt-4 aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full rounded-md shadow-lg bg-black"
          controls
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
