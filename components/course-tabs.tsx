"use client";

import { useId } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sanitizeHTML } from "@/lib/sanitize";
import { RecipeLink } from "@/data/types";
import Link from "next/link";

interface CourseTabsProps {
  aboutContent: string;
  whatYouNeedContent: string;
  recipeLinks?: RecipeLink[];
}

export function CourseTabs({ aboutContent, whatYouNeedContent, recipeLinks }: CourseTabsProps) {
  const tabsId = useId();
  
  return (
    <div className="mt-8">
      <Tabs defaultValue="about" className="w-full" id={tabsId}>
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
            {recipeLinks && recipeLinks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                {recipeLinks.map((recipe, index) => (
                  <Link 
                    key={index}
                    href={recipe.link}
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    {recipe.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
