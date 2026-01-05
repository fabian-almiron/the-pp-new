"use client";

import { useState, useRef } from "react";
import { Course, Chapter, CarouselItem } from "@/data/types";
import { VideoPlayer, VideoPlayerRef } from "@/components/video-player";
import { ChapterList } from "@/components/chapter-list";
import { CourseTabs } from "@/components/course-tabs";
import { ContentCarousel } from "@/components/content-carousel";
import { useRole } from "@/hooks/use-role";

interface CoursePageClientProps {
  course: Course;
  relatedCourses: CarouselItem[];
}

export function CoursePageClient({ course, relatedCourses }: CoursePageClientProps) {
  const [activeChapter, setActiveChapter] = useState<Chapter>(course.chapters[0]);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isSubscriber } = useRole();

  const handlePlayVideo = () => {
    videoPlayerRef.current?.playVideo();
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setActiveChapter(chapter);
    
    // Scroll to video player on mobile
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Give a small delay for the video to load, then play it
    setTimeout(() => {
      videoPlayerRef.current?.playVideo();
    }, 300);
  };

  return (
    <main>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-16">
          {/* Left Column - Video Player and Course Info */}
          <div className="lg:col-span-2" ref={videoContainerRef}>
            <div className="mb-6">
              <h1 className="text-4xl font-serif font-bold text-gray-900">
                {course.title}
              </h1>
              <p className="text-lg text-gray-500 mt-1">
                {course.series}
              </p>
            </div>
            
            <div className="sticky top-4">
              <VideoPlayer 
                ref={videoPlayerRef} 
                chapter={activeChapter} 
                isSignedIn={isSignedIn}
                isSubscriber={isSubscriber}
              />
              
              <CourseTabs 
                aboutContent={course.aboutContent}
                whatYouNeedContent={course.whatYouNeedContent}
                recipeLinks={course.recipeLinks}
              />
            </div>
          </div>
          
          {/* Right Column - Chapter List */}
          <div>
            <ChapterList
              chapters={course.chapters}
              activeChapterId={activeChapter.id}
              onSelectChapter={handleSelectChapter}
              onPlayVideo={handlePlayVideo}
            />
          </div>
        </div>
        
        {/* Related Courses Carousel */}
        <ContentCarousel items={relatedCourses} />
      </div>
    </main>
  );
}
