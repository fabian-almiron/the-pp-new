'use client';

import { sanitizeHTML } from "@/lib/sanitize";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
    />
  );
}

