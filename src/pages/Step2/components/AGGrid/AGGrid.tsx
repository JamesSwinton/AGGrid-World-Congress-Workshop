import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { useCO2Data } from '../../../../data/DataProvider';
import {
  themeQuartz,
  colorSchemeDarkBlue,
  iconSetMaterial,
} from 'ag-grid-community';

const myTheme = themeQuartz
  .withPart(iconSetMaterial)
  .withPart(colorSchemeDarkBlue);

const defaultColDef: ColDef = { flex: 1, minWidth: 100 };

export default function AGGrid() {
  const { rows, status } = useCO2Data();

  const columnDefs: ColDef[] = [
    { field: 'country' },
    { field: 'continent' },
    { field: 'date' },
    { field: 'co2' },
    { field: 'co2_per_capita' },
    { field: 'cumulative_co2' },
    { field: 'share_global_co2' },
    { field: 'population' },
  ];

  if (status !== 'ready') {
    return <div className="grid-panel">Grid — {status}</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={myTheme}
      />
    </div>
  );
}
