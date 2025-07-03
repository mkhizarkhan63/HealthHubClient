import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatPhoneNumber(phone: string): string {
  // Australian phone number formatting
  if (phone.startsWith('+61')) {
    return phone.replace(/(\+61)(\d)(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function highlightKeywords(text: string, keywords: string[] = []): string {
  if (!keywords.length) return text;
  
  let highlightedText = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<mark class="transcript-highlight">$&</mark>`);
  });
  
  return highlightedText;
} 