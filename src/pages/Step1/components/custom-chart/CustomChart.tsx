import { useMemo } from 'react';
import { useCO2Data } from '../../../../data/DataProvider';
import type { EmissionsRow } from '../../../../data/types';
import Chart from './chart/Chart';
import type { ChartConfig, SeriesDef } from './chart/types';

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

// A single aggregate series shown against the secondary (right) axis. Its
// magnitude dwarfs the per-capita lines, which is exactly why it needs its own
// scale.
const WORLD = 'World';
const WORLD_COLOR = '#8a94a6';

export default function CustomChart() {
  const { chartData, rows, status } = useCO2Data();

  const config = useMemo<ChartConfig>(() => {
    const series: SeriesDef[] = COUNTRIES.map((country, i) => {
      const source = chartData.find((s) => s.country === country);
      const points = (source?.data ?? []).map((r) => ({
        date: r.date,
        value: r[METRIC] as number | null,
      }));
      return { id: country, name: country, color: COLORS[i % COLORS.length], points };
    });

    const world = chartData.find((s) => s.country === WORLD);
    if (world) {
      series.push({
        id: WORLD,
        name: 'World cumulative CO₂',
        color: WORLD_COLOR,
        axis: 'right',
        dashed: true,
        strokeWidth: 2,
        points: world.data.map((r) => ({ date: r.date, value: r.cumulative_co2 })),
      });
    }

    return {
      title: 'CO₂ emissions',
      subtitle: `Per-capita emissions by country vs. world cumulative — ${chartData.length} countries, ${rows.length.toLocaleString()} rows.`,
      series,
      leftAxis: {
        label: 'CO₂ per capita (t)',
        format: (v) => `${v.toFixed(1)}`,
      },
      rightAxis: {
        label: 'World cumulative CO₂ (Gt)',
        format: (v) => `${(v / 1000).toFixed(0)}k`,
      },
    };
  }, [chartData, rows.length]);

  if (status !== 'ready') {
    return <div className="chart-panel">Chart — {status}</div>;
  }

  return <Chart config={config} />;
}
