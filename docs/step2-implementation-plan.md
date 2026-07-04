# Step 2 — AG Grid & AG Charts Implementation Plan

A reference plan for replacing the _basic_ Step 2 primitives with the **advanced
AG Grid and AG Charts** feature set. Where Step 1 hand-rolls everything, Step 2
turns the same features on with configuration — this plan is the config, broken
down one feature at a time.

Each feature below is a focused snippet you add to the relevant place in the
component (a key on the chart's `options` object, a column def, a grid prop, or
the `onFirstDataRendered` handler). Assemble the pieces into the two files;
none of the snippets is a full component on its own.

## Context & prerequisites

- **Versions:** `ag-grid-enterprise` ^36, `ag-charts-enterprise` ^14,
  `ag-grid-react` / `ag-charts-react`.
- **Enterprise modules are already registered** in `src/main.tsx` — do **not**
  add module registration:
  ```tsx
  ModuleRegistry.registerModules([
    AllEnterpriseModule.with(AgChartsEnterpriseModule),
  ]);
  ```
  `AllEnterpriseModule` unlocks grouping, aggregation, side bar, set/date/number
  filters, pivoting, cell (range) selection, integrated charts and context
  menus; `AgChartsEnterpriseModule` powers integrated charts + the standalone
  chart's navigator/zoom/context-menu.
- **Data:** read from `useCO2Data()` — `rows` (flat records) for the grid and
  `chartData` (one series per country) for the chart. Do **not** change
  `DataProvider`. Note `rows`/`chartData` include aggregate entries (`World`,
  continents, income groups) whose `continent` is `null`; the grid's treemap
  snapshot filters those out (see §B11).
- No custom CSS is needed — AG Grid themes itself via the Theming API and AG
  Charts via its theme. Enterprise features run in dev with a console notice
  without a license key — fine for the workshop.

---

## Part A — AG Charts (`AGCharts/AGCharts.tsx`)

The chart is a single `AgCartesianChartOptions` object passed to `<AgCharts>`.
Start from the existing basic options (title, subtitle, legend, line series,
x/y axes) and layer on the keys below. The chart needs a bounded height, so
wrap it in a flex column:

```tsx
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
```

### A1. Secondary (right) y-axis for World cumulative CO₂

Add a third axis keyed `ySecondary` on the right, and bind each series to an axis
with `yKeyAxis`. Split the series into the per-capita countries (left, `y`) and
the `World` aggregate (right, `ySecondary`).
Docs: [Axes](https://www.ag-charts.com/react/axes/)

```tsx
const selected = chartData.filter((s) => COUNTRIES.includes(s.country));
const world = chartData.filter((s) => s.country === 'World');

// options.series
series: [
  ...selected.map((s) => ({
    type: 'line' as const,
    data: s.data, xKey: 'date', yKey: 'co2_per_capita', yName: s.country,
    yKeyAxis: 'y',
    marker: { enabled: true, shape: 'circle' as const, size: 1 },
  })),
  ...world.map((s) => ({ /* see A7 */ })),
],

// options.axes
axes: {
  x: { type: 'time', position: 'bottom', nice: false /* + crosshair, see A6 */ },
  y: {
    type: 'number', position: 'left',
    title: { text: 'CO₂ per capita (Mt)' },
    label: { formatter: (v) => `${v.value} Mt` },
  },
  ySecondary: {
    type: 'number', position: 'right',
    title: { text: 'Cumulative CO₂ (all countries)' },
    label: { formatter: (v) => `${v.value.toLocaleString()} Mt` },
  },
},
```

### A2. Shared tooltip, anchored to the pointer

Docs: [Tooltips](https://www.ag-charts.com/react/tooltips/)

```tsx
tooltip: {
  enabled: true,
  mode: 'shared',
  position: { anchorTo: 'pointer' },
},
```

### A3. Zoom — scroll, drag-select, alt-pan

Docs: [Zoom](https://www.ag-charts.com/react/zoom/)

```tsx
zoom: {
  enabled: true,
  enableScrolling: true,
  enableSelecting: true,
  enablePanning: true,
  panKey: 'alt',
  anchorPointX: 'pointer',
  anchorPointY: 'pointer',
},
```

### A4. Navigator with mini chart

Docs: [Navigator](https://www.ag-charts.com/react/navigator/)

```tsx
navigator: {
  enabled: true,
  height: 25,
  miniChart: { enabled: true },
},
```

### A5. Context menu (right-click → download as image)

Docs: [Context menu](https://www.ag-charts.com/react/context-menu/)

```tsx
contextMenu: { enabled: true },
```

### A6. Crosshair on the x-axis

A vertical guide that follows the pointer. Add `crosshair` to the x-axis (see A1).
Docs: [Crosshairs](https://www.ag-charts.com/react/crosshairs/)

```tsx
x: {
  type: 'time', position: 'bottom', nice: false,
  crosshair: { enabled: true, snap: false },
},
```

### A7. Dashed, marker-less overlay series (the World line)

The `world` series from A1, styled to read as a secondary reference line.
Docs: [Line series](https://www.ag-charts.com/react/line-series/)

```tsx
...world.map((s) => ({
  type: 'line' as const,
  data: s.data, xKey: 'date', yKey: 'cumulative_co2', yName: s.country,
  yKeyAxis: 'ySecondary',
  lineDash: [4, 2],
  strokeOpacity: 0.8,
  stroke: '#929292',
  marker: { enabled: false },
})),
```

### A8. Built-in theme

Docs: [Themes](https://www.ag-charts.com/react/themes/)

```tsx
theme: {
  baseTheme: 'ag-polychroma-dark',
  overrides: { common: { background: { fill: 'transparent' } } },
},
```

> **Legend interactivity** (click a legend item to show/hide its series) is on by
> default — no option required. **Download as image** and **reset zoom** live in
> the right-click context menu (A5), so no custom toolbar buttons are needed.
>
> `chartRef` is a `useRef<AgChartInstance | null>(null)` — keep it if you plan to
> call the imperative chart API; it is otherwise optional.

---

## Part B — AG Grid (`AGGrid/AGGrid.tsx`)

Pieces live in four places: module-level constants (`myTheme`, `defaultColDef`,
`sideBar`, `statusBar`, formatters), the `columnDefs` array, the `<AgGridReact>`
props, and the `onFirstDataRendered` callback.

### B1. Custom theme

Docs: [Theming API](https://www.ag-grid.com/react-data-grid/theming/)

```tsx
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
// <AgGridReact theme={myTheme} ... />
```

### B2. Sorting, resizing & filtering defaults

Applied to every column via `defaultColDef`.
Docs: [Row sorting](https://www.ag-grid.com/react-data-grid/row-sorting/) ·
[Column sizing](https://www.ag-grid.com/react-data-grid/column-sizing/)

```tsx
const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 110,
  sortable: true,
  filter: true,
  enableRowGroup: true,
  resizable: true,
};
```

### B3. Per-type column filters (set / date / number)

Set the right filter per column in `columnDefs`.
Docs: [Set](https://www.ag-grid.com/react-data-grid/filter-set/) ·
[Date](https://www.ag-grid.com/react-data-grid/filter-date/) ·
[Number](https://www.ag-grid.com/react-data-grid/filter-number/)

```tsx
{ field: 'country',   filter: 'agSetColumnFilter',    /* ... */ },
{ field: 'date',      filter: 'agDateColumnFilter', cellDataType: 'date', /* ... */ },
{ field: 'co2',       filter: 'agNumberColumnFilter',  /* ... */ },
```

### B4. Row grouping + row-group panel

Group by `continent` then `country` using `rowGroupIndex`; hide the raw
continent column and show a pinned auto group column. `rowGroupPanelShow` adds
the drag-to-group bar.
Docs: [Row grouping](https://www.ag-grid.com/react-data-grid/grouping/)

```tsx
// columnDefs
{ field: 'continent', rowGroup: true, rowGroupIndex: 0, hide: true, chartDataType: 'category', filter: 'agSetColumnFilter' },
{ field: 'country',   rowGroup: true, rowGroupIndex: 1, minWidth: 160, chartDataType: 'category', filter: 'agSetColumnFilter' },

// <AgGridReact> props
rowGroupPanelShow="always"
groupDefaultExpanded={1}
autoGroupColumnDef={{ headerName: 'Continent', minWidth: 220, pinned: 'left' }}
```

### B5. Aggregations + value formatting

`aggFunc` + `enableValue` aggregate grouped rows; `suppressAggFuncInHeader`
keeps headers clean; `valueFormatter` + `type: 'rightAligned'` format numbers.
Docs: [Aggregation](https://www.ag-grid.com/react-data-grid/aggregation/) ·
[Value formatters](https://www.ag-grid.com/react-data-grid/value-formatters/)

```tsx
const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const num = (fmt: Intl.NumberFormat) => (p: ValueFormatterParams) =>
  p.value == null ? '' : fmt.format(p.value);

// a numeric column
{
  field: 'co2', headerName: 'CO₂ (Mt)',
  filter: 'agNumberColumnFilter',
  aggFunc: 'sum',            // 'avg' for co2_per_capita / share_global_co2
  enableValue: true,
  chartDataType: 'series',
  type: 'rightAligned',
  valueFormatter: num(decFmt),  // num(intFmt) for population
},

// <AgGridReact> prop
suppressAggFuncInHeader
```

### B6. Tool panel (Columns + Filters side bar)

Docs: [Side bar](https://www.ag-grid.com/react-data-grid/side-bar/)

```tsx
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
// <AgGridReact sideBar={sideBar} ... />
```

### B7. Status bar (counts + aggregation)

Docs: [Status bar](https://www.ag-grid.com/react-data-grid/status-bar/)

```tsx
const statusBar: GridOptions['statusBar'] = {
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agSelectedRowCountComponent' },
    { statusPanel: 'agAggregationComponent', align: 'right' },
  ],
};
// <AgGridReact statusBar={statusBar} ... />
```

### B8. Pivot panel

Docs: [Pivoting](https://www.ag-grid.com/react-data-grid/pivoting/)

```tsx
pivotPanelShow = 'always';
```

### B9. Cell (range) selection

Excel-like range selection across cells.
Docs: [Cell selection](https://www.ag-grid.com/react-data-grid/cell-selection/)

```tsx
cellSelection;
```

### B10. Row selection (multi-row, header checkbox)

The v32.2+ object API: select-all header checkbox, no per-row checkbox column.
Docs: [Row selection](https://www.ag-grid.com/react-data-grid/row-selection/)

```tsx
rowSelection={{
  mode: 'multiRow',
  checkboxes: false,
  headerCheckbox: true,
}}
```

### B11. Integrated charts (floating treemap via API)

`enableCharts` turns the feature on; build a chart once in `onFirstDataRendered`
with `createRangeChart`. `chartDataType` on the columns (B4/B5) tells Integrated
Charts which fields are categories vs. series. The `unlinkChart: true` snapshot
is taken while aggregate continents are filtered out (they have a null
`continent`), then the filter is cleared so the grid still shows every row.
Docs: [Integrated charts](https://www.ag-grid.com/react-data-grid/integrated-charts/) ·
[Range chart API](https://www.ag-grid.com/react-data-grid/integrated-charts-api-range-chart/)

```tsx
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
          title: { enabled: true, text: 'Cumulative CO₂ by continent' },
        },
        pie: { series: { calloutLabel: { enabled: false } } },
      },
    });

    await api.setColumnFilterModel('continent', null);
    api.onFilterChanged();
  },
  [rows],
);

// <AgGridReact
//   enableCharts
//   onFirstDataRendered={onFirstDataRendered}
//   chartThemes={['ag-polychroma-dark']}
//   chartThemeOverrides={{ common: { background: { fill: '#0e0f13' } } }}
// />
```

### B12. Context menu with Ctrl, and row animation

Docs: [Context menu](https://www.ag-grid.com/react-data-grid/context-menu/) ·
[Row animation](https://www.ag-grid.com/react-data-grid/grid-animation/)

```tsx
allowContextMenuWithControlKey;
animateRows;
```

---

## Verification

Run `npm run dev`, open the **Primatives** page, and confirm:

- **Chart:** hover shows a shared tooltip; scroll/drag zooms and the navigator
  reflects it; right-click offers _Download_; the World series tracks the right
  axis; the legend toggles series.
- **Grid:** rows are grouped by continent → country with aggregated numbers;
  the side bar (Columns/Filters) opens; set/date/number filters work; the status
  bar shows counts + aggregations; a floating treemap of cumulative CO₂ appears;
  drag columns into the group/pivot panels; range-select cells.

Then `npm run build` for a clean typecheck.

> Doc links point at the current AG Grid (`react-data-grid`) and AG Charts
> (`react`) sites; exact slugs can shift between major versions — search the site
> for the option name if a link 404s.
