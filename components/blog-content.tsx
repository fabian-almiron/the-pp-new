'use client';

import { useEffect, useState } from "react";
import { sanitizeHTML } from "@/lib/sanitize";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only run sanitization in the browser
    setIsMounted(true);
    setSanitizedContent(sanitizeHTML(content));
  }, [content]);

  // Show loading state during SSR/ISR
  if (!isMounted) {
    return <div className={className}>Loading...</div>;
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

