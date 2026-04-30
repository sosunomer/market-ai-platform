"use client";

import { useState, useEffect } from "react";

/**
 * Debounce hook'u.
 * Arama girişi gibi hızlı değişen değerleri geciktirmek için kullanılır.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
