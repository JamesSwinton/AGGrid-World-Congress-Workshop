import type { SeriesDef, XScale, YScale } from './types';

export interface HoverTarget {
  seriesId: string;
  name: string;
  color: string;
  date: Date;
  value: number;
  /** Pixel position within the inner (margin-translated) plot area. */
  cx: number;
  cy: number;
  axis: 'left' | 'right';
}

interface HoverLayerProps {
  series: SeriesDef[];
  x: XScale;
  yLeft: YScale;
  yRight?: YScale;
  innerWidth: number;
  innerHeight: number;
  hover: HoverTarget | null;
  onHover: (target: HoverTarget | null) => void;
}

// Only snap to a point when the cursor is reasonably close to it (px).
const HIT_RADIUS = 30;

export default function HoverLayer({
  series,
  x,
  yLeft,
  yRight,
  innerWidth,
  innerHeight,
  hover,
  onHover,
}: HoverLayerProps) {
  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let best: HoverTarget | null = null;
    let bestDist = HIT_RADIUS * HIT_RADIUS;

    for (const s of series) {
      if (s.hidden) continue;
      const axis = (s.axis ?? 'left') as 'left' | 'right';
      const y = axis === 'right' && yRight ? yRight : yLeft;
      for (const p of s.points) {
        if (p.value == null) continue;
        const px = x(p.date);
        const py = y(p.value);
        const dx = px - mx;
        const dy = py - my;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          best = {
            seriesId: s.id,
            name: s.name,
            color: s.color,
            date: p.date,
            value: p.value,
            cx: px,
            cy: py,
            axis,
          };
        }
      }
    }

    // Avoid redundant state churn when still on the same point.
    if (best?.seriesId !== hover?.seriesId || best?.cx !== hover?.cx) {
      onHover(best);
    }
  }

  return (
    <g>
      {hover && (
        <circle
          cx={hover.cx}
          cy={hover.cy}
          r={4}
          fill={hover.color}
          stroke="var(--surface)"
          strokeWidth={1.5}
          pointerEvents="none"
        />
      )}
      <rect
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={() => onHover(null)}
      />
    </g>
  );
}
