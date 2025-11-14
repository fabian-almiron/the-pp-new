"use client"

import { sanitizeHTML } from "@/lib/sanitize";

interface SanitizedHTMLProps {
  html: string | undefined | null;
  className?: string;
}

export function SanitizedHTML({ html, className }: SanitizedHTMLProps) {
  if (!html) return null;
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  );
}

