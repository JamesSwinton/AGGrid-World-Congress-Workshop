import type { SeriesDef } from './types';

interface LegendProps {
  series: SeriesDef[];
  x: number;
  y: number;
  /** Called with a series id when its legend item is clicked. */
  onToggle: (id: string) => void;
}

// Rough per-item advance; good enough for a fixed set of short names.
function itemWidth(name: string): number {
  return 26 + name.length * 7;
}

export default function Legend({ series, x, y, onToggle }: LegendProps) {
  let offset = 0;
  return (
    <g transform={`translate(${x},${y})`}>
      {series.map((s) => {
        const gx = offset;
        offset += itemWidth(s.name);
        return (
          <g
            key={s.id}
            transform={`translate(${gx},0)`}
            className="chart-legend-item"
            role="button"
            tabIndex={0}
            aria-pressed={!s.hidden}
            opacity={s.hidden ? 0.4 : 1}
            onClick={() => onToggle(s.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(s.id);
              }
            }}
          >
            <rect
              y={-9}
              width={12}
              height={12}
              rx={2}
              fill={s.hidden ? 'var(--text-muted)' : s.color}
            />
            <text
              x={18}
              fontSize={12}
              fill="var(--text)"
              style={{
                textDecoration: s.hidden ? 'line-through' : 'none',
              }}
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
