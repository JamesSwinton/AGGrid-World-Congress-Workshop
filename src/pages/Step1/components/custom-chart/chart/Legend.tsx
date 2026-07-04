import type { PlottedSeries } from './types';

interface LegendProps {
  series: PlottedSeries[];
  x: number;
  y: number;
}

// Rough per-item advance; good enough for a fixed set of short country names.
function itemWidth(country: string): number {
  return 26 + country.length * 7;
}

export default function Legend({ series, x, y }: LegendProps) {
  let offset = 0;
  return (
    <g transform={`translate(${x},${y})`}>
      {series.map((s) => {
        const gx = offset;
        offset += itemWidth(s.country);
        return (
          <g key={s.country} transform={`translate(${gx},0)`}>
            <rect y={-9} width={12} height={12} rx={2} fill={s.color} />
            <text x={18} fontSize={12} fill="var(--text)">
              {s.country}
            </text>
          </g>
        );
      })}
    </g>
  );
}
