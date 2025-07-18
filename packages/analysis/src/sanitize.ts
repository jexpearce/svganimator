import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitizes an SVG string to remove potentially malicious content
 */
export function sanitizeSvg(raw: string): string {
  // Configure DOMPurify for SVG sanitization
  const clean = purify.sanitize(raw, {
    USE_PROFILES: { svg: true },
    ADD_TAGS: ['svg'],
    ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror']
  });
  
  return clean;
} 