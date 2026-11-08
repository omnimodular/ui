export interface Oklch { l: number; c: number; h: number }

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;
export function hueDistance(a: number, b: number): number {
  const difference = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(difference, 360 - difference);
}

export function hexToOklch(hex: string): Oklch {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`[brand-rgb] Expected an opaque six-digit hex color, received "${hex}".`);
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(match[1]!.slice(offset, offset + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) as [number, number, number];
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(l), mRoot = Math.cbrt(m), sRoot = Math.cbrt(s);
  const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bAxis = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  return { l: lightness, c: Math.hypot(a, bAxis), h: normalizeHue(Math.atan2(bAxis, a) * 180 / Math.PI) };
}

function inSrgb(color: Oklch): boolean {
  const a = color.c * Math.cos(color.h * Math.PI / 180);
  const b = color.c * Math.sin(color.h * Math.PI / 180);
  const l = (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return channels.every((channel) => channel >= -0.00001 && channel <= 1.00001);
}

/** Reduces chroma rather than clipping RGB channels, preserving OKLCH lightness and hue. */
export function oklchToHex(input: Oklch): string {
  const color = { ...input, l: clamp(input.l), h: normalizeHue(input.h) };
  if (!inSrgb({ ...color, c: 0 })) throw new Error('[brand-rgb] Lightness cannot be represented in sRGB.');
  let low = 0, high = Math.max(0, color.c);
  if (inSrgb(color)) low = high;
  else {
    for (let iteration = 0; iteration < 24; iteration += 1) {
      const middle = (low + high) / 2;
      if (inSrgb({ ...color, c: middle })) low = middle;
      else high = middle;
    }
  }
  const a = low * Math.cos(color.h * Math.PI / 180);
  const b = low * Math.sin(color.h * Math.PI / 180);
  const l = (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((linear) => {
    const value = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
    return Math.round(clamp(value) * 255).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

export function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`[brand-rgb] Cannot measure luminance of "${hex}".`);
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(match[1]!.slice(offset, offset + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (values[0] + 0.05) / (values[1] + 0.05);
}

/** Finds the nearest OKLCH lightness that meets every required pair. */
export function fitContrast(color: Oklch, backgrounds: string[], threshold: number): string {
  if (backgrounds.every((background) => contrast(oklchToHex(color), background) >= threshold)) return oklchToHex(color);
  let best: { hex: string; distance: number } | null = null;
  for (let step = 0; step <= 500; step += 1) {
    const candidate = { ...color, l: step / 500 };
    const hex = oklchToHex(candidate);
    if (!backgrounds.every((background) => contrast(hex, background) >= threshold)) continue;
    const distance = Math.abs(candidate.l - color.l);
    if (!best || distance < best.distance) best = { hex, distance };
  }
  if (!best) throw new Error(`[brand-rgb] No sRGB color can reach ${threshold}:1 against ${backgrounds.join(', ')}.`);
  return best.hex;
}
