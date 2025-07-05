import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clean HTML entities from titles and content
export function cleanTitle(title: string): string {
  return title
    .replace(/&#8217;/g, "'") // Right single quotation mark
    .replace(/&#8216;/g, "'") // Left single quotation mark
    .replace(/&#8220;/g, '"') // Left double quotation mark
    .replace(/&#8221;/g, '"') // Right double quotation mark
    .replace(/&#8211;/g, "–") // En dash
    .replace(/&#8212;/g, "—") // Em dash
    .replace(/&#8230;/g, "…") // Horizontal ellipsis
    .replace(/&#038;/g, "&") // Ampersand
    .replace(/&amp;/g, "&") // Ampersand
    .replace(/&lt;/g, "<") // Less than
    .replace(/&gt;/g, ">") // Greater than
    .replace(/&quot;/g, '"') // Quotation mark
    .replace(/&#039;/g, "'") // Apostrophe
    .replace(/&nbsp;/g, " ") // Non-breaking space
    .replace(/&hellip;/g, "…") // Horizontal ellipsis
    .replace(/&ndash;/g, "–") // En dash
    .replace(/&mdash;/g, "—") // Em dash
    .replace(/&lsquo;/g, "'") // Left single quotation mark
    .replace(/&rsquo;/g, "'") // Right single quotation mark
    .replace(/&ldquo;/g, '"') // Left double quotation mark
    .replace(/&rdquo;/g, '"') // Right double quotation mark
    .trim();
}

// Format date consistently
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Extract plain text from HTML
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
