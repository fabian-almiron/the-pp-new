'use client';

import DOMPurify from 'dompurify';

// Initialize DOMPurify with window on client-side
let purify: typeof DOMPurify | null = null;

if (typeof window !== 'undefined') {
  purify = DOMPurify(window);
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify with a strict allowlist of safe tags and attributes
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(html: string | undefined | null): string {
  if (!html) return '';
  if (!purify) return html; // Fallback if DOMPurify isn't initialized
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'sup', 'sub', 'del', 'ins'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 
      'class', 'id', 'width', 'height', 'style'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Sanitizes HTML for JSON-LD structured data
 * More restrictive - removes all HTML tags
 * 
 * @param html - The HTML string to sanitize
 * @returns Plain text string with HTML tags removed
 */
export function sanitizeForStructuredData(html: string | undefined | null): string {
  if (!html) return '';
  if (!purify) return html.replace(/<[^>]*>/g, ''); // Simple tag stripping fallback
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

