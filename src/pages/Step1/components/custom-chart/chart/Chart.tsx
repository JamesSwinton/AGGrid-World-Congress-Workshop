import { useMemo, useState } from 'react';
import Axes from './Axes';
import HoverLayer from './HoverLayer';
import type { HoverTarget } from './HoverLayer';
import Legend from './Legend';
import Lines from './Lines';
import { dateExtent, linearScale, maxValue, timeScale } from './scales';
import type { ChartConfig, SeriesDef } from './types';
import { useElementSize } from './useElementSize';

interface ChartProps {
  config: ChartConfig;
}

function margins(config: ChartConfig) {
  const top = config.title ? (config.subtitle ? 74 : 60) : 40;
  const right = config.rightAxis ? 64 : 24;
  return { top, right, bottom: 40, left: 56 };
}

/**
 * Generic, config-driven line chart rendered as inline SVG. Supports a title /
 * subtitle, a clickable legend (show/hide series), an optional secondary
 * (right) y-axis, and per-point hover tooltips. Not tied to any dataset —
 * feed it a {@link ChartConfig}.
 */
export default function Chart({ config }: ChartProps) {
  const [ref, { width, height }] = useElementSize();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<HoverTarget | null>(null);

  const MARGIN = margins(config);
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Apply the hidden set on top of the config's series.
  const series = useMemo<SeriesDef[]>(
    () => config.series.map((s) => ({ ...s, hidden: s.hidden || hidden.has(s.id) })),
    [config.series, hidden],
  );

  const { x, yLeft, yRight, xDomain, leftMax, rightMax } = useMemo(() => {
    const domain = dateExtent(series);
    const lMax = maxValue(series, 'left');
    const rMax = maxValue(series, 'right');
    return {
      x: timeScale(domain, innerWidth),
      yLeft: linearScale(lMax, innerHeight),
      yRight: config.rightAxis ? linearScale(rMax, innerHeight) : undefined,
      xDomain: domain,
      leftMax: lMax,
      rightMax: rMax,
    };
  }, [series, innerWidth, innerHeight, config.rightAxis]);

  function toggle(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setHover(null);
  }

  const ready = innerWidth > 0 && innerHeight > 0;

  const hoverFormat =
    hover?.axis === 'right'
      ? config.rightAxis?.format
      : config.leftAxis?.format;

  return (
    <div ref={ref} className="chart-root">
      {ready && (
        <svg width={width} height={height} role="img" aria-label={config.title}>
          {config.title && (
            <text
              x={MARGIN.left}
              y={24}
              fontSize={16}
              fontWeight={600}
              fill="var(--text)"
            >
              {config.title}
            </text>
          )}
          {config.subtitle && (
            <text x={MARGIN.left} y={config.title ? 44 : 24} fontSize={12} fill="var(--text-muted)">
              {config.subtitle}
            </text>
          )}
          <Legend
            series={series}
            x={MARGIN.left}
            y={MARGIN.top - 12}
            onToggle={toggle}
          />
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <Axes
              x={x}
              yLeft={yLeft}
              leftMax={leftMax}
              leftAxis={config.leftAxis}
              yRight={yRight}
              rightMax={rightMax}
              rightAxis={config.rightAxis}
              xDomain={xDomain}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
            />
            <Lines series={series} x={x} yLeft={yLeft} yRight={yRight} />
            <HoverLayer
              series={series}
              x={x}
              yLeft={yLeft}
              yRight={yRight}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              hover={hover}
              onHover={setHover}
            />
          </g>
        </svg>
      )}

      {ready && hover && (
        <div
          className="chart-tooltip"
          style={{
            left: MARGIN.left + hover.cx,
            top: MARGIN.top + hover.cy,
          }}
        >
          <span className="chart-tooltip-swatch" style={{ background: hover.color }} />
          <div>
            <div className="chart-tooltip-name">{hover.name}</div>
            <div className="chart-tooltip-meta">
              {hover.date.toISOString().slice(0, 10)}
              {' · '}
              <strong>
                {(hoverFormat ?? ((v: number) => v.toLocaleString()))(hover.value)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
