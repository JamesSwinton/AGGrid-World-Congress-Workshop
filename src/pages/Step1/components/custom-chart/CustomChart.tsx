import { useMemo } from 'react';
import { useCO2Data } from '../../../../data/DataProvider';
import type { EmissionsRow } from '../../../../data/types';
import Axes from './chart/Axes';
import Lines from './chart/Lines';
import Legend from './chart/Legend';
import { dateExtent, linearScale, maxValue, timeScale } from './chart/scales';
import type { PlottedSeries } from './chart/types';
import { useElementSize } from './chart/useElementSize';

// Edit this list to change which countries are plotted (mirrors AGCharts).
const COUNTRIES = [
  'United States',
  'China',
  'Germany',
  'United Kingdom',
  'South Africa',
];
const METRIC: keyof EmissionsRow = 'co2_per_capita';
const COLORS = ['#5a8fd6', '#e15759', '#59a14f', '#f28e2b', '#b07aa1'];

const MARGIN = { top: 40, right: 24, bottom: 40, left: 56 };

export default function CustomChart() {
  const { chartData, status } = useCO2Data();
  const [ref, { width, height }] = useElementSize();

  const series = useMemo<PlottedSeries[]>(
    () =>
      COUNTRIES.map((country, i) => {
        const source = chartData.find((s) => s.country === country);
        const points = (source?.data ?? []).map((r) => ({
          date: r.date,
          value: r[METRIC] as number | null,
        }));
        return { country, color: COLORS[i % COLORS.length], points };
      }),
    [chartData],
  );

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const { x, y, xDomain, yMax } = useMemo(() => {
    const domain = dateExtent(series);
    const top = maxValue(series);
    return {
      x: timeScale(domain, innerWidth),
      y: linearScale(top, innerHeight),
      xDomain: domain,
      yMax: top,
    };
  }, [series, innerWidth, innerHeight]);

  const ready = status === 'ready' && innerWidth > 0 && innerHeight > 0;

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {ready ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="CO₂ per capita by country"
        >
          <Legend series={series} x={MARGIN.left} y={22} />
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <Axes
              x={x}
              y={y}
              xDomain={xDomain}
              yMax={yMax}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
            />
            <Lines series={series} x={x} y={y} />
          </g>
        </svg>
      ) : (
        <div className="chart-panel">Chart — {status}</div>
      )}
    </div>
  );
}
