import { ticks } from './scales';
import type { AxisDef, XScale, YScale } from './types';

interface AxesProps {
  x: XScale;
  yLeft: YScale;
  leftMax: number;
  leftAxis?: AxisDef;
  yRight?: YScale;
  rightMax?: number;
  rightAxis?: AxisDef;
  xDomain: [number, number];
  innerWidth: number;
  innerHeight: number;
}

function defaultFormat(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return abs >= 10 ? v.toFixed(0) : v.toFixed(1);
}

export default function Axes({
  x,
  yLeft,
  leftMax,
  leftAxis,
  yRight,
  rightMax,
  rightAxis,
  xDomain,
  innerWidth,
  innerHeight,
}: AxesProps) {
  const leftTicks = ticks(0, leftMax, 5);
  const rightTicks = yRight ? ticks(0, rightMax ?? 0, 5) : [];
  const xTicks = ticks(xDomain[0], xDomain[1], 6).map((ms) => new Date(ms));
  const fmtLeft = leftAxis?.format ?? defaultFormat;
  const fmtRight = rightAxis?.format ?? defaultFormat;

  return (
    <g>
      {/* Horizontal gridlines + left y labels */}
      {leftTicks.map((v) => (
        <g key={v} transform={`translate(0,${yLeft(v)})`}>
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
            {fmtLeft(v)}
          </text>
        </g>
      ))}

      {/* Right y labels (secondary axis) */}
      {yRight &&
        rightTicks.map((v) => (
          <text
            key={v}
            x={innerWidth + 10}
            y={yRight(v)}
            dy="0.32em"
            textAnchor="start"
            fontSize={12}
            fill="var(--text-muted)"
          >
            {fmtRight(v)}
          </text>
        ))}

      {/* Left axis title */}
      {leftAxis?.label && (
        <text
          transform={`translate(${-44},${innerHeight / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={11}
          fill="var(--text-muted)"
        >
          {leftAxis.label}
        </text>
      )}

      {/* Right axis title */}
      {yRight && rightAxis?.label && (
        <text
          transform={`translate(${innerWidth + 48},${innerHeight / 2}) rotate(90)`}
          textAnchor="middle"
          fontSize={11}
          fill="var(--text-muted)"
        >
          {rightAxis.label}
        </text>
      )}

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
