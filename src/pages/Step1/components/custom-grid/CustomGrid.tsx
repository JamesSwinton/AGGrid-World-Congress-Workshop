import { useCO2Data } from '../../../../data/DataProvider';
import type { EmissionsRow } from '../../../../data/types';

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtNum = (n: number | null) => (n == null ? '' : n.toLocaleString());

const columns: {
  header: string;
  value: (row: EmissionsRow) => string;
  align?: 'left' | 'right';
}[] = [
  { header: 'Country', value: (r) => r.country },
  { header: 'Continent', value: (r) => r.continent },
  { header: 'Date', value: (r) => fmtDate(r.date) },
  { header: 'CO₂', value: (r) => fmtNum(r.co2), align: 'right' },
  { header: 'CO₂ per capita', value: (r) => fmtNum(r.co2_per_capita), align: 'right' },
  { header: 'Cumulative CO₂', value: (r) => fmtNum(r.cumulative_co2), align: 'right' },
  { header: 'Share global CO₂', value: (r) => fmtNum(r.share_global_co2), align: 'right' },
  { header: 'Population', value: (r) => fmtNum(r.population), align: 'right' },
];

export default function CustomGrid() {
  const { rows, status } = useCO2Data();

  if (status !== 'ready') {
    return <div className="grid-panel">Grid — {status}</div>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} style={{ textAlign: c.align ?? 'left' }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.header} style={{ textAlign: c.align ?? 'left' }}>
                  {c.value(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
