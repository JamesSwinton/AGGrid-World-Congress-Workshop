import { ticks } from './scales';
import type { XScale, YScale } from './types';

interface AxesProps {
  x: XScale;
  y: YScale;
  xDomain: [number, number];
  yMax: number;
  innerWidth: number;
  innerHeight: number;
}

function formatValue(v: number): string {
  return Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1);
}

export default function Axes({
  x,
  y,
  xDomain,
  yMax,
  innerWidth,
  innerHeight,
}: AxesProps) {
  const yTicks = ticks(0, yMax, 5);
  const xTicks = ticks(xDomain[0], xDomain[1], 6).map((ms) => new Date(ms));

  return (
    <g>
      {/* Horizontal gridlines + y labels */}
      {yTicks.map((v) => (
        <g key={v} transform={`translate(0,${y(v)})`}>
          <line
            x1={0}
            x2={innerWidth}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={-10}
            dy="0.32em"
            textAnchor="end"
            fontSize={12}
            fill="var(--text-muted)"
          >
            {formatValue(v)}
          </text>
        </g>
      ))}

      {/* Baseline */}
      <line
        x1={0}
        y1={innerHeight}
        x2={innerWidth}
        y2={innerHeight}
        stroke="var(--text-muted)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* x labels (years) */}
      {xTicks.map((d) => (
        <text
          key={d.getTime()}
          x={x(d)}
          y={innerHeight + 22}
          textAnchor="middle"
          fontSize={12}
          fill="var(--text-muted)"
        >
          {d.getUTCFullYear()}
        </text>
      ))}
    </g>
  );
}
