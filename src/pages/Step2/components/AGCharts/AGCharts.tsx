import { useMemo } from 'react';
import { AgCharts } from 'ag-charts-react';
import type { AgCartesianChartOptions } from 'ag-charts-community';
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

  const options = useMemo<AgCartesianChartOptions>(() => {
    const selected = chartData.filter((s) => COUNTRIES.includes(s.country));
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
      series: selected.map((s) => ({
        type: 'line' as const,
        data: s.data,
        xKey: 'date',
        yKey: 'co2_per_capita',
        yName: s.country,
        marker: { shape: 'circle' as const, size: 1 },
      })),
      axes: {
        x: { type: 'time' },
        y: {
          type: 'number',
          title: { text: 'CO₂ per capita (Mt)' },
          label: { formatter: (v) => `${v.value} Mt` },
        },
      },
    };
  }, [chartData]);

  if (status !== 'ready') {
    return <div className="chart-panel">Chart — {status}</div>;
  }

  return (
    <AgCharts options={options} style={{ height: '100%', width: '100%' }} />
  );
}
