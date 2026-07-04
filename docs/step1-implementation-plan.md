# Step 1 — Custom Chart & Grid Implementation Plan

A reference plan for building real chart and grid features **from scratch** (no
charting/grid libraries) into the Step 1 "Custom" components. The goal is to
feel where hand-rolling these features gets hard and flaky — which is exactly
the contrast Step 2 (AG Grid / AG Charts) then pays off.

## Guiding principles

1. **Generic, config-driven components — not hardcoded for the CO₂ dataset.**
   Build a reusable `<Chart>` and `<DataGrid>` the way you would design a
   greenfield library. `CustomChart.tsx` / `CustomGrid.tsx` become thin wrappers
   that feed dataset-specific config in.
2. **From scratch.** No `d3`, `react-table`, etc. Inline SVG for the chart, plain
   DOM for the grid. The friction is the point.
3. **Keep the data layer untouched.** Read from `useCO2Data()`
   (`rows` for the grid, `chartData` — one series per country — for the chart).
4. **Match the existing look.** Reuse the CSS variables in `src/index.css`
   (`--surface`, `--border`, `--text-muted`, `--accent`, `--accent-bg`,
   `--hover`, `--radius`, `--shadow`).

## Target features

**Chart:** title & subtitle · clickable legend (show/hide series) · a secondary
(right) y-axis for the World cumulative CO₂ series · hover tooltips.

**Grid:** column resizing · column reordering · per-column filtering ·
row virtualization · sorting · multi-row selection with checkboxes.

---

## Part A — Chart (`src/pages/Step1/components/custom-chart/`)

The existing `chart/` helpers (`scales.ts`, `path.ts`, `Axes`, `Lines`,
`Legend`, `useElementSize`) are a solid base — generalize them around a config
object instead of a hardcoded country list + single metric.

### A1. Config API — `chart/types.ts`

```ts
interface Point { date: Date; value: number | null } // null = gap in the line
type AxisId = 'left' | 'right';

interface SeriesDef {
  id: string; name: string; color: string; points: Point[];
  axis?: AxisId;        // default 'left'
  hidden?: boolean;     // legend toggle
  dashed?: boolean; strokeWidth?: number; // distinguish a secondary series
}

interface AxisDef { label?: string; format?: (v: number) => string }

interface ChartConfig {
  title?: string; subtitle?: string;
  series: SeriesDef[];
  leftAxis?: AxisDef;
  rightAxis?: AxisDef;  // presence enables the secondary axis
}
```

### A2. Per-axis scales — `chart/scales.ts`

- `timeScale(domain, width)` and `linearScale(max, height)` as before.
- `dateExtent(series)` and `maxValue(series, axis)` must **skip hidden series**
  and `maxValue` must filter to the requested axis, so each axis scales
  independently from only the series bound to it.

### A3. Dual axes — `chart/Axes.tsx`

- Left y-axis draws gridlines + labels (as today).
- When a right scale is supplied, draw its tick labels at `x = innerWidth + 10`
  using the **right** axis's formatter, plus optional rotated axis titles on
  both sides. Gridlines come from the left axis only.

### A4. Clickable legend — `chart/Legend.tsx`

- Each item is interactive (`role="button"`, `tabIndex`, Enter/Space handlers)
  and calls `onToggle(id)`.
- Hidden series render dimmed: greyed swatch + line-through label.

### A5. Axis-aware lines — `chart/Lines.tsx`

- Skip `hidden` series. Pick `yRight` when `axis === 'right'`, else `yLeft`.
- Honour `dashed` (`strokeDasharray`) and `strokeWidth`.

### A6. Hover tooltip — `chart/HoverLayer.tsx` (new)

- One transparent `<rect>` over the plot captures `mousemove`.
- On move, find the **nearest visible point** across all series by pixel
  distance (within a hit radius, e.g. 30px). Efficient and gives per-point
  hover semantics without a hit-target per point.
- Emit a `HoverTarget` (`{ seriesId, name, color, date, value, cx, cy, axis }`);
  draw an emphasized dot at `(cx, cy)`.

### A7. Generic renderer — `chart/Chart.tsx` (new)

- `useElementSize()` for responsive width/height; compute margins (extra top for
  title/subtitle/legend, extra right when `rightAxis` is set).
- Own two pieces of state: `hidden: Set<string>` (legend) and
  `hover: HoverTarget | null`.
- Render: title/subtitle `<text>`, `<Legend onToggle=…>`, `<Axes>`, `<Lines>`,
  `<HoverLayer>`, and an **HTML tooltip div** absolutely positioned at
  `(MARGIN.left + cx, MARGIN.top + cy)`, formatted with the hovered series'
  axis formatter.

### A8. CO₂ wrapper — `CustomChart.tsx`

- Build `SeriesDef[]`: the 5 countries' `co2_per_capita` on the **left** axis,
  plus the **`World`** series' `cumulative_co2` on the **right** axis (dashed,
  thicker) — its magnitude dwarfs per-capita, which is why it needs its own
  scale.
- Provide title, subtitle, and `leftAxis`/`rightAxis` formatters. Render
  `<Chart config={…} />`.

---

## Part B — Grid (`src/pages/Step1/components/custom-grid/`)

Replace the single HTML `<table>` with a generic virtualized `<DataGrid>` under
a new `grid/` folder. Use **explicit pixel widths** and `display: flex` rows
(not a `<table>`) so a sticky header, virtualized body, resizing, and reordering
all stay aligned.

### B1. Column API — `grid/types.ts`

```ts
type CellValue = string | number | Date | null;

interface ColumnDef<T> {
  id: string; header: string;
  value: (row: T) => CellValue;          // raw comparable for sort/filter
  format?: (v: CellValue, row: T) => string;  // display; default String(v)
  render?: (row: T) => ReactNode;        // overrides format
  align?: 'left' | 'right';
  width?: number;                        // default 150
  sortable?: boolean;                    // default true
  filter?: 'text' | 'number' | false;    // omitted → inferred from value type
}

interface SortState { columnId: string; dir: 'asc' | 'desc' }
type FilterState = Record<string, string>;
type SelectionMode = 'none' | 'single' | 'multiple';
```

### B2. Column state — `grid/useColumnState.ts`

- State: `order: string[]` and `widths: Record<id, number>`.
- `setWidth(id, w)` clamps to a min (e.g. 60). `reorder(dragId, targetId)` moves
  `dragId` immediately before `targetId`.
- Return `orderedColumns` (columns already in display order) + the mutators.

### B3. Filter + sort — `grid/useGridData.ts`

- `resolveFilterType(column, sampleRow)` — explicit `filter`, else infer
  `'number'` when `value()` is a number, else `'text'`.
- Text filter: case-insensitive substring on `String(value)`.
- Number filter: parse a leading operator (`>`, `<`, `>=`, `<=`, `=`); otherwise
  fall back to substring.
- Sort: single column, comparator by value type (number diff / date time /
  `localeCompare`); **nulls always last** regardless of direction.
- Memoize filter and sort separately.

### B4. Virtualization — `grid/useVirtualRows.ts`

- Fixed `rowHeight`. Track `scrollTop` (via `onScroll`) and viewport height (via
  a `ResizeObserver` on a callback ref).
- Compute `[start, end)` with a small overscan; expose `totalHeight` and the
  `viewportRef` / `onScroll` to wire up. Render only rows in the window,
  absolutely positioned at `top = index * rowHeight`.

### B5. Row selection — `grid/useRowSelection.ts`

- `selected: Set<string>` of row ids. `toggle(id, index, shift)`:
  - `single` → replace selection;
  - `multiple` → toggle, or select the range from the last clicked index when
    `shift` is held (resolved against the current displayed order).
- Tri-state `toggleAll` / `allSelected` / `someSelected` for the header
  checkbox, computed against the currently displayed ids.

### B6. Header cell — `grid/HeaderCell.tsx`

- Label + sort caret (click cycles asc → desc → unsorted); `aria-sort`.
- **Resize:** a handle on the right edge; `mousedown` starts a window-level
  `mousemove`/`mouseup` drag updating width. `preventDefault` on the handle so it
  doesn't also start a native drag; `stopPropagation` on its click so it doesn't
  sort.
- **Reorder:** the cell is `draggable`; `dragstart` stashes the column id in
  `dataTransfer`, `drop` calls `reorder(draggedId, thisId)`; show a drag-over
  style.

### B7. Filter row — `grid/FilterRow.tsx`

- A permanent second header row: one `<input>` per filterable column (plus a
  spacer aligning with the selection checkbox column). Number columns get a
  `>, <, =…` placeholder. Emits `onChange(id, value)`.

### B8. Composition — `grid/DataGrid.tsx`

Props: `rowData`, `columns`, `getRowId`, `selection?`, `rowHeight?`.

- Wire `useColumnState`, `filters`/`sort` state, `useGridData`,
  `useRowSelection` (over the displayed row ids), `useVirtualRows`.
- Layout: a scroll **viewport** containing a **sticky head** (header row +
  filter row) and a **body** of `totalHeight` with absolutely-positioned rows.
  Set every row / header / cell to explicit widths and `flex-shrink: 0` so
  columns line up and horizontal scroll works. Add a status bar
  (`N rows · M selected`).
- Checkbox column (width ~44px) when `selection !== 'none'`; header shows the
  tri-state select-all. Row click toggles selection (with `shiftKey`).

### B9. CO₂ wrapper — `CustomGrid.tsx`

- Define `ColumnDef<EmissionsRow>[]` (Country/Continent/Date text + numeric
  metrics with `toLocaleString` formatters; Date formatted `YYYY-MM-DD`).
- `getRowId = r => \`${r.country}|${r.date.getTime()}\``.
- Render `<DataGrid rowData={rows} columns={…} getRowId={…} selection="multiple" />`.

---

## Part C — Styling (`src/App.css`)

Add scoped styles (reusing the CSS variables):

- **Chart:** `.chart-root` (position relative), `.chart-legend-item` (cursor +
  focus ring), `.chart-tooltip` (absolute, `pointer-events:none`, positioned
  above the point via `transform: translate(-50%, calc(-100% - 12px))`), swatch
  / name / meta.
- **Grid:** `.dg-root`, `.dg-viewport` (`overflow:auto`), `.dg-head`
  (`position:sticky; top:0`), `.dg-header-row`, `.dg-th` (+ `--select`,
  `--dragover`), `.dg-th-caret`, `.dg-th-resize` (`cursor:col-resize`),
  `.dg-filter-row` / `.dg-filter-input`, `.dg-body`, `.dg-row` (+ `:hover`,
  `--selected`), `.dg-cell`, `.dg-status`, and `body.dg-resizing`. Give
  `.dg-th` / `.dg-cell` `flex-shrink: 0`.

---

## Verification

Run `npm run dev` and drive each feature:

- **Chart:** toggle legend items (line hides, left axis rescales); hover a line
  (tooltip with date + value); confirm the World cumulative series tracks the
  **right** axis independently.
- **Grid:** click headers to sort (asc → desc → none); type in the filter row
  (incl. numeric `>`/`<`); drag a header edge to resize; drag a header onto
  another to reorder; scroll a large dataset (Monthly) — only visible rows are
  in the DOM; checkbox / shift-click / select-all update the status bar.

Then `npx tsc -b` (or `npm run build`) for a clean typecheck.

## Files touched

```
src/pages/Step1/components/custom-chart/
  CustomChart.tsx            (wrapper)
  chart/types.ts scales.ts Axes.tsx Legend.tsx Lines.tsx  (generalized)
  chart/Chart.tsx HoverLayer.tsx                          (new)
src/pages/Step1/components/custom-grid/
  CustomGrid.tsx             (wrapper)
  grid/types.ts useColumnState.ts useGridData.ts useVirtualRows.ts
  grid/useRowSelection.ts HeaderCell.tsx FilterRow.tsx DataGrid.tsx  (new)
src/App.css                  (chart + grid styles)
```
