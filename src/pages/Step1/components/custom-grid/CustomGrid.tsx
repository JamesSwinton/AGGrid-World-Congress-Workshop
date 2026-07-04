import { useMemo } from 'react';
import { useCO2Data } from '../../../../data/DataProvider';
import type { EmissionsRow } from '../../../../data/types';
import DataGrid from './grid/DataGrid';
import type { ColumnDef } from './grid/types';

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtNum = (n: number | string | Date | null) =>
  typeof n === 'number' ? n.toLocaleString() : '';

const columns: ColumnDef<EmissionsRow>[] = [
  { id: 'country', header: 'Country', value: (r) => r.country, width: 160 },
  { id: 'continent', header: 'Continent', value: (r) => r.continent, width: 130 },
  {
    id: 'date',
    header: 'Date',
    value: (r) => r.date,
    format: (v) => (v instanceof Date ? fmtDate(v) : ''),
    filter: 'text',
  },
  { id: 'co2', header: 'CO₂', value: (r) => r.co2, format: fmtNum, align: 'right' },
  {
    id: 'co2_per_capita',
    header: 'CO₂ per capita',
    value: (r) => r.co2_per_capita,
    format: fmtNum,
    align: 'right',
    width: 140,
  },
  {
    id: 'cumulative_co2',
    header: 'Cumulative CO₂',
    value: (r) => r.cumulative_co2,
    format: fmtNum,
    align: 'right',
    width: 150,
  },
  {
    id: 'share_global_co2',
    header: 'Share global CO₂',
    value: (r) => r.share_global_co2,
    format: fmtNum,
    align: 'right',
    width: 150,
  },
  { id: 'population', header: 'Population', value: (r) => r.population, format: fmtNum, align: 'right' },
];

export default function CustomGrid() {
  const { rows, status } = useCO2Data();

  // Stable id per row: country + period start uniquely identifies a record.
  const getRowId = useMemo(
    () => (r: EmissionsRow) => `${r.country}|${r.date.getTime()}`,
    [],
  );

  if (status !== 'ready') {
    return <div className="grid-panel">Grid — {status}</div>;
  }

  return (
    <DataGrid
      rowData={rows}
      columns={columns}
      getRowId={getRowId}
      selection="multiple"
    />
  );
}
