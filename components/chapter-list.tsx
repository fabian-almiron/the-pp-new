"use client";

import { Chapter } from "@/data/types";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: string;
  onSelectChapter: (chapter: Chapter) => void;
}

export function ChapterList({ chapters, activeChapterId, onSelectChapter }: ChapterListProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Video Chapters</h2>
      
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
                    <span className="text-sm text-gray-500 font-medium min-w-[2rem]">
                      {index + 1}.
                    </span>
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
