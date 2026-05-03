import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// hex → HSL (h: 0..360, s/l: 0..1)
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

// circular hue distance, 0..180
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Considers two hex colors "same family" within hue tol; neutrals matched by lightness
export function colorFamilyMatch(hexA: string, hexB: string, hueTol = 35): boolean {
  const A = hexToHsl(hexA);
  const B = hexToHsl(hexB);
  if (!A || !B) return false;
  const neutralA = A.s < 0.15;
  const neutralB = B.s < 0.15;
  if (neutralA && neutralB) return Math.abs(A.l - B.l) < 0.25;
  if (neutralA !== neutralB) return false;
  return hueDistance(A.h, B.h) <= hueTol;
}
