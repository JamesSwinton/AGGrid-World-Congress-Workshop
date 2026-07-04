import type { SeriesDef, XScale, YScale } from './types';

/** Time domain [minMs, maxMs] → [0, width] pixels. */
export function timeScale(domain: [number, number], width: number): XScale {
  const [min, max] = domain;
  const span = max - min || 1;
  return (date) => ((date.getTime() - min) / span) * width;
}

/** Value domain [0, max] → [height, 0] pixels (inverted, so 0 is at the bottom). */
export function linearScale(max: number, height: number): YScale {
  const m = max || 1;
  return (value) => height - (value / m) * height;
}

/** Min/max timestamp across every point in every (visible) series. */
export function dateExtent(series: SeriesDef[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const s of series) {
    if (s.hidden) continue;
    for (const p of s.points) {
      const t = p.date.getTime();
      if (t < min) min = t;
      if (t > max) max = t;
    }
  }
  return Number.isFinite(min) ? [min, max] : [0, 1];
}

/**
 * Largest non-null value across the series bound to a given axis. Series on
 * the other axis are ignored so each axis scales independently.
 */
export function maxValue(series: SeriesDef[], axis: 'left' | 'right'): number {
  let max = 0;
  for (const s of series) {
    if (s.hidden) continue;
    if ((s.axis ?? 'left') !== axis) continue;
    for (const p of s.points) {
      if (p.value != null && p.value > max) max = p.value;
    }
  }
  return max;
}

/** `count` evenly spaced values from min to max, inclusive. */
export function ticks(min: number, max: number, count: number): number[] {
  if (count < 2) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}
