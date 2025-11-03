"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sanitizeHTML } from "@/lib/sanitize";

interface CourseTabsProps {
  aboutContent: string;
  whatYouNeedContent: string;
}

export function CourseTabs({ aboutContent, whatYouNeedContent }: CourseTabsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="what-you-need">What You'll Need</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="mt-4">
          <div className="p-4 border border-gray-200 rounded-b-md">
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(aboutContent) }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="what-you-need" className="mt-4">
          <div className="p-4 border border-gray-200 rounded-b-md">
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(whatYouNeedContent) }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
