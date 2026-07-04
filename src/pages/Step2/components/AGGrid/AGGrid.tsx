import { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  FirstDataRenderedEvent,
  GridOptions,
  SideBarDef,
  ValueFormatterParams,
} from 'ag-grid-community';
import { useCO2Data } from '../../../../data/DataProvider';
import {
  themeQuartz,
  colorSchemeDarkBlue,
  iconSetMaterial,
} from 'ag-grid-community';

const myTheme = themeQuartz
  .withPart(iconSetMaterial)
  .withPart(colorSchemeDarkBlue)
  .withParams({
    backgroundColor: '#0e0f13',
    headerBackgroundColor: '#16181d',
  });

const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const num = (fmt: Intl.NumberFormat) => (p: ValueFormatterParams) =>
  p.value == null ? '' : fmt.format(p.value);

const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 110,
  sortable: true,
  filter: true,
  enableRowGroup: true,
  resizable: true,
};

const sideBar: SideBarDef = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
    },
  ],
  defaultToolPanel: '',
};

const statusBar: GridOptions['statusBar'] = {
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agSelectedRowCountComponent' },
    { statusPanel: 'agAggregationComponent', align: 'right' },
  ],
};

export default function AGGrid() {
  const { rows, status } = useCO2Data();

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'country',
        filter: 'agSetColumnFilter',
        chartDataType: 'category',
        rowGroup: true,
        rowGroupIndex: 1,
        minWidth: 160,
      },
      {
        field: 'continent',
        filter: 'agSetColumnFilter',
        rowGroup: true,
        hide: true,
        chartDataType: 'category',
        rowGroupIndex: 0,
      },
      {
        field: 'date',
        headerName: 'Date',
        cellDataType: 'date',
        filter: 'agDateColumnFilter',
        enableRowGroup: true,
        minWidth: 130,
        groupHierarchy: ['year', 'quarter', 'formattedMonth'],
      },
      {
        field: 'co2',
        headerName: 'CO₂ (Mt)',
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
        enableValue: true,
        chartDataType: 'series',
        type: 'rightAligned',
        valueFormatter: num(decFmt),
      },
      {
        field: 'co2_per_capita',
        headerName: 'CO₂ / capita',
        filter: 'agNumberColumnFilter',
        aggFunc: 'avg',
        enableValue: true,
        chartDataType: 'series',
        type: 'rightAligned',
        valueFormatter: num(decFmt),
      },
      {
        field: 'cumulative_co2',
        headerName: 'Cumulative CO₂',
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
        enableValue: true,
        chartDataType: 'series',
        type: 'rightAligned',
        valueFormatter: num(decFmt),
      },
      {
        field: 'share_global_co2',
        headerName: 'Share global %',
        filter: 'agNumberColumnFilter',
        aggFunc: 'avg',
        enableValue: true,
        chartDataType: 'series',
        type: 'rightAligned',
        valueFormatter: num(decFmt),
      },
      {
        field: 'population',
        headerName: 'Population',
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
        enableValue: true,
        chartDataType: 'series',
        type: 'rightAligned',
        valueFormatter: num(intFmt),
      },
    ],
    [],
  );

  // Build a pie via the grid's Integrated Charts API. Omitting `chartContainer`
  // makes it open in a floating chart window above the grid. The blank/null
  // continent rows (aggregate entities like "World"/"EU") are excluded by
  // charting an *unlinked* snapshot taken while they're filtered out, then
  // restoring the grid so it still shows every row.
  const onFirstDataRendered = useCallback(
    async (params: FirstDataRenderedEvent) => {
      const { api } = params;
      const continents = Array.from(
        new Set(rows.map((r) => r.continent).filter((c): c is string => !!c)),
      );

      await api.setColumnFilterModel('continent', {
        filterType: 'set',
        values: continents,
      });
      api.onFilterChanged();

      api.createRangeChart({
        chartType: 'treemap',
        cellRange: { columns: ['country', 'cumulative_co2'] },
        useGroupColumnAsCategory: true,
        aggFunc: 'sum',
        suppressChartRanges: true,
        unlinkChart: true,
        chartThemeName: 'ag-polychroma-dark',
        chartThemeOverrides: {
          common: {
            title: {
              enabled: true,
              text: 'Cumulative CO₂ by continent',
            },
          },
          pie: {
            series: {
              calloutLabel: { enabled: false },
            },
          },
        },
      });

      await api.setColumnFilterModel('continent', null);
      api.onFilterChanged();
    },
    [rows],
  );

  if (status !== 'ready') {
    return <div className="grid-panel">Grid — {status}</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        onFirstDataRendered={onFirstDataRendered}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={myTheme}
        suppressAggFuncInHeader
        rowGroupPanelShow="always"
        groupDefaultExpanded={1}
        autoGroupColumnDef={{
          headerName: 'Continent',
          minWidth: 220,
          pinned: 'left',
        }}
        pivotPanelShow="always"
        sideBar={sideBar}
        statusBar={statusBar}
        cellSelection
        enableCharts
        rowSelection={{
          mode: 'multiRow',
          checkboxes: false,
          headerCheckbox: true,
        }}
        allowContextMenuWithControlKey
        animateRows
        chartThemes={['ag-polychroma-dark']}
        chartThemeOverrides={{
          common: {
            background: { fill: '#0e0f13' },
          },
        }}
      />
    </div>
  );
}
