"use client"

import { sanitizeHTML } from "@/lib/sanitize";

interface InlineHTMLProps {
  html: string | undefined | null;
}

export function InlineHTML({ html }: InlineHTMLProps) {
  if (!html) return null;
  
  return <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />;
}

