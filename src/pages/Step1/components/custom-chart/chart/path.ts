import type { Point, XScale, YScale } from './types';

export function linePath(points: Point[], x: XScale, y: YScale): string {
  let d = '';
  let penDown = false;
  for (const p of points) {
    if (p.value == null) {
      penDown = false;
      continue;
    }
    const command = penDown ? 'L' : 'M';
    d += `${command}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)} `;
    penDown = true;
  }
  return d.trim();
}
