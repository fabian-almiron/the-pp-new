"use client";

import { Chapter } from "@/data/types";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: string;
  onSelectChapter: (chapter: Chapter) => void;
  onPlayVideo?: () => void;
}

export function ChapterList({ chapters, activeChapterId, onSelectChapter, onPlayVideo }: ChapterListProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Video Chapters</h2>
        <button 
          onClick={onPlayVideo}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                onClick={() => onSelectChapter(chapter)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50 transition-colors",
                  "flex items-center justify-between group",
                  {
                    "bg-gray-100 font-semibold border-l-4 border-black": 
                      chapter.id === activeChapterId
                  }
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[2rem]">
                      <span className="text-sm text-gray-500 font-medium">
                        {index + 1}.
                      </span>
                      {/* Play icon - visible on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg 
                          className="w-6 h-6 text-gray-600" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm",
                      chapter.id === activeChapterId ? "font-semibold" : "font-medium"
                    )}>
                      {chapter.title}
                    </span>
                  </div>
                </div>
                
                <span className="text-xs text-gray-400 ml-4">
                  {formatDuration(chapter.duration)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
