import { useMemo, useRef } from 'react';
import { AgCharts } from 'ag-charts-react';
import type {
  AgCartesianChartOptions,
  AgChartInstance,
} from 'ag-charts-community';
import { useCO2Data } from '../../../../data/DataProvider';

// Edit this list to change which countries are plotted.
const COUNTRIES = [
  'United States',
  'China',
  'Germany',
  'United Kingdom',
  'South Africa',
];

export default function AGCharts() {
  const { rows, chartData, status } = useCO2Data();
  const chartRef = useRef<AgChartInstance | null>(null);

  const options = useMemo<AgCartesianChartOptions>(() => {
    const selected = chartData.filter((s) => COUNTRIES.includes(s.country));
    const world = chartData.filter((s) => s.country === 'World');
    return {
      title: { text: 'CO₂ emissions', textAlign: 'left' },
      subtitle: {
        text: `Per capita CO2 emissions between 1750–2020: ${chartData.length} countries, ${rows.length.toLocaleString()} rows.`,
        textAlign: 'left',
      },
      legend: { position: 'top-left' },
      theme: {
        baseTheme: 'ag-polychroma-dark',
        overrides: {
          common: {
            background: { fill: 'transparent' },
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'shared',
        position: {
          anchorTo: 'pointer',
        },
      },
      zoom: {
        enabled: true,
        enableScrolling: true,
        enableSelecting: true,
        enablePanning: true,
        panKey: 'alt',
        anchorPointX: 'pointer',
        anchorPointY: 'pointer',
      },
      navigator: {
        enabled: true,
        height: 25,
        miniChart: { enabled: true },
      },
      contextMenu: { enabled: true },
      series: [
        ...selected.map((s) => ({
          type: 'line' as const,
          data: s.data,
          xKey: 'date',
          yKey: 'co2_per_capita',
          yName: s.country,
          yKeyAxis: 'y',
          marker: { enabled: true, shape: 'circle' as const, size: 1 },
        })),
        ...world.map((s) => ({
          type: 'line' as const,
          data: s.data,
          xKey: 'date',
          yKey: 'cumulative_co2',
          yName: s.country,
          yKeyAxis: 'ySecondary',
          lineDash: [4, 2],
          strokeOpacity: 0.8,
          stroke: '#929292',
          marker: { enabled: false },
        })),
      ],
      axes: {
        x: {
          type: 'time',
          position: 'bottom',
          nice: false,
          crosshair: { enabled: true, snap: false },
        },
        y: {
          type: 'number',
          position: 'left',
          title: { text: 'CO₂ per capita (Mt)' },
          label: { formatter: (v) => `${v.value} Mt` },
          crosshair: { enabled: false, snap: false },
        },
        ySecondary: {
          type: 'number',
          position: 'right',
          title: { text: 'Cumulative CO₂ (all countries)' },
          label: { formatter: (v) => `${v.value.toLocaleString()} Mt` },
          crosshair: { enabled: false, snap: false },
        },
      },
    };
  }, [chartData, rows.length]);

  if (status !== 'ready') {
    return <div className="chart-panel">Chart — {status}</div>;
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <AgCharts
          ref={chartRef}
          options={options}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
