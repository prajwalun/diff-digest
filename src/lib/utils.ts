// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format dates in a relative format like "2 days ago"
export function formatDateRelative(date: string): string {
  if (!date) return 'Unknown date'
  
  try {
    const dateObj = new Date(date)
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return 'Invalid date'
  }
}

// Copy text to clipboard (optional utility)
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}