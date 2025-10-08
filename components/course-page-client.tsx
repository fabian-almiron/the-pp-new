"use client";

import { useState, useRef } from "react";
import { Course, Chapter, CarouselItem } from "@/data/types";
import { VideoPlayer, VideoPlayerRef } from "@/components/video-player";
import { ChapterList } from "@/components/chapter-list";
import { CourseTabs } from "@/components/course-tabs";
import { ContentCarousel } from "@/components/content-carousel";

interface CoursePageClientProps {
  course: Course;
  relatedCourses: CarouselItem[];
}

export function CoursePageClient({ course, relatedCourses }: CoursePageClientProps) {
  const [activeChapter, setActiveChapter] = useState<Chapter>(course.chapters[0]);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const handlePlayVideo = () => {
    videoPlayerRef.current?.playVideo();
  };

  return (
    <main>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-16">
          {/* Left Column - Video Player and Course Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-4xl font-serif font-bold text-gray-900">
                {course.title}
              </h1>
              <p className="text-lg text-gray-500 mt-1">
                {course.series}
              </p>
            </div>
            
            <div className="sticky top-4">
              <VideoPlayer ref={videoPlayerRef} chapter={activeChapter} />
              
              <CourseTabs 
                aboutContent={course.aboutContent}
                whatYouNeedContent={course.whatYouNeedContent}
              />
            </div>
          </div>
          
          {/* Right Column - Chapter List */}
          <div>
            <ChapterList
              chapters={course.chapters}
              activeChapterId={activeChapter.id}
              onSelectChapter={setActiveChapter}
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
