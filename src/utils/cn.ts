import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * TailwindCSS class birleştirme yardımcısı.
 * clsx ile koşullu class'ları birleştirir, tailwind-merge ile çakışmaları çözer.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
