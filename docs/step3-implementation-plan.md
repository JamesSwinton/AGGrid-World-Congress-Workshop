# Step 3 — AG Studio Embedded Analytics Implementation Plan

A reference plan for wiring the CO₂ dataset into **AG Studio**, the embedded
analytics builder. Where Step 1 hand-rolls a grid and chart and Step 2 turns on
AG Grid / AG Charts feature-by-feature, Step 3 hands the _end user_ a full
report builder: they drag fields onto a canvas and assemble grids, charts and
tables themselves. Our job is small but specific — **describe the data well** and
hand it to `<AgStudio>`. Studio does the rest.

Step 3 is an **instructor-led demo**. The prompt builds a _complete, working_
report for you: the component ships with the data wired in (Part A/B) **and a
pre-built dashboard** that opens automatically via `initialState` (Part C). In
the session the instructor then throws that report away and **rebuilds it by
hand**, live, to show how an end user assembles the same thing from an empty
canvas — the finished `initialState` is the "here's one we made earlier" target.

## Context & prerequisites

- **Packages:** `ag-studio-react` ^2 (the React wrapper — exports `AgStudio`)
  and `ag-studio` ^2 (the core — exports `studioTheme` and all the types). Both
  are already in `package.json`; no module registration is required (unlike AG
  Grid in Step 2, Studio has no `ModuleRegistry` step).
- **Component:** everything lives in
  [`src/pages/Step3/components/AGStudio/AGStudio.tsx`](../src/pages/Step3/components/AGStudio/AGStudio.tsx),
  which is currently a placeholder that renders an empty `<AgStudio>` with no
  data. `Studio.tsx` wraps it in a `.page-studio` container — leave that
  untouched.
- **Data:** read from `useCO2Data()` — use **`rows`** (flat records, countries
  only; aggregate entries like `World`/continents are already filtered out by
  `DataProvider`). Studio is happiest with a flat, tidy table, so `rows` is
  exactly the right shape. Do **not** change `DataProvider`.
- **Row shape** (`EmissionsRow`): `continent` (string), `country` (string),
  `date` (a JS `Date`, period start), and the nullable numerics `co2`,
  `co2_per_capita`, `cumulative_co2`, `share_global_co2`, `population`.
- **Theme:** `studioTheme.withParams({ ... })` recolours Studio to match the
  app's dark palette. Enterprise features run in dev with a console notice
  without a license key — fine for the workshop.

---

## Part A — Feed the data in (`AGStudio.tsx`)

Studio takes its data through the `data` prop, an `AgDataSourcesDefinition`: one
or more **sources**, each of which is a table plus its **field definitions**. For
a dataset that's already loaded in memory we use a `AgSimpleDataSourceDefinition`
(the `data`-array variant) — no async `getData` callback needed.

### A1. Field definitions

Each field maps a row property to a **format** (`textFormat`, `integerFormat`,
`decimalFormat`, `percentageFormat`, `dateFormat`, …). The format drives display
formatting, which chart/aggregation roles the field can take (`category`,
`temporal`, `numeric`), and how values serialize into saved state. If you omit
`fields`, Studio infers them from the data — but explicit fields give clean
names, correct number formatting and better AI-assistant context, so define
them.

```tsx
import type { AgFieldDefinition } from 'ag-studio';

const fields: AgFieldDefinition[] = [
  { id: 'country',          name: 'Country',            format: 'textFormat' },
  { id: 'continent',        name: 'Continent',          format: 'textFormat' },
  { id: 'date',             name: 'Year',               format: 'dateFormat' },
  { id: 'co2',              name: 'CO₂ (Mt)',           format: 'decimalFormat' },
  { id: 'co2_per_capita',   name: 'CO₂ per capita (t)', format: 'decimalFormat' },
  { id: 'cumulative_co2',   name: 'Cumulative CO₂ (Mt)',format: 'integerFormat' },
  { id: 'share_global_co2', name: 'Share of global CO₂',format: 'percentageFormat' },
  { id: 'population',       name: 'Population',          format: 'integerFormat' },
];
```

Notes:

- `id` defaults to the row-property key. When they differ (or the value is
  derived), add an `accessor` — `accessor: (row) => …` or a property key.
- `share_global_co2` is stored as a **percent value** (e.g. `3.4` = 3.4 %). If
  `percentageFormat` renders it ×100, switch it to `decimalFormat` with a `%`
  suffix, or divide in an `accessor`. Confirm against the live display in the
  demo and pick whichever reads correctly.
- `date` is already a JS `Date`, which is what `dateFormat` expects — no parsing.

### A2. The data source + the `data` prop

Wrap the fields and rows into one source. `description` is optional but feeds the
AI assistant a plain-English summary of the table.

```tsx
import type { AgDataSourcesDefinition } from 'ag-studio';

const data: AgDataSourcesDefinition = {
  sources: [
    {
      id: 'emissions',
      name: 'CO₂ Emissions',
      description:
        'Per-country annual CO₂ emissions and population. One row per ' +
        'country per period; aggregate regions are excluded.',
      data: rows,
      fields,
    },
  ],
};
```

`rows` changes when the user switches datasets (decades / yearly / …) via the
navbar. Per the API, Studio processes updates to **synchronous** data on an
already-declared source, so passing the fresh `rows` array straight through is
correct; structural changes (adding/removing sources or fields) are read once at
init.

### A3. Wire it onto `<AgStudio>`

```tsx
import { useCO2Data } from '../../../../data/DataProvider';
import { AgStudio } from 'ag-studio-react';
import { studioTheme } from 'ag-studio';
import type {
  AgDataSourcesDefinition,
  AgFieldDefinition,
  AgStudioStateUpdatedEvent,
} from 'ag-studio';

const myTheme = studioTheme.withParams({
  backgroundColor: '#0e0f13',
  textColor: '#e0e0e0',
  studioCanvasBackgroundColor: '#0e0f13',
  studioWidgetBackgroundColor: '#16181d',
});

export default function AGStudio() {
  const { rows, status } = useCO2Data();

  const data: AgDataSourcesDefinition = { sources: [ /* A2 */ ] };

  if (status !== 'ready') return null; // wait for rows before mounting Studio

  return (
    <AgStudio
      mode="edit"
      data={data}
      theme={myTheme}
      initialState={initialReport} // the pre-built dashboard — see Part C
      dataOptions={{ maxExportRows: -1 }}
      onStateUpdated={(e: AgStudioStateUpdatedEvent) => console.log(e)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
```

- **`mode="edit"`** shows the full builder (field panel + edit panels). Switch to
  `"view"` to present a finished report read-only.
- **`dataOptions.maxExportRows: -1`** removes the 1,000-row CSV/Excel export cap
  so demo exports aren't truncated.
- Gate on `status === 'ready'` so Studio mounts with a populated `rows` array
  rather than an empty one on first paint.

---

## Part B — Optional polish (pick per demo)

Each of these is a single extra prop — reach for them only if the demo calls for
it. All are keys on `<AgStudio>` / `AgStudioProperties`.

### B1. Persist the user's work — `onStateUpdated` + `api.setState()`

`onStateUpdated` fires on every edit; stash `e.state` (or `api.getState()`) in
`localStorage` and hydrate it back through `initialState` on reload for a
save/restore loop. `api.getState()` is also how you _author_ the Part C report:
build it once in the UI, log the state, and paste it in as a constant.

### B2. Calculated columns — `expressions`

Add `expressions` to the `AgDataSourcesDefinition` to expose derived fields (e.g.
CO₂ per million people) the raw data doesn't carry, without touching
`DataProvider`.

### B3. AI assistant — `ai`

Studio's experimental natural-language assistant ("show CO₂ per capita by
continent over time") is configured via the `ai` prop. Behaviour varies by LLM;
treat as a demo flourish, not a core feature.

---

## Part C — Ship a pre-built report via `initialState`

The whole point of Step 3 is that the component opens on a **finished dashboard**,
not a blank canvas — so the instructor has a concrete target to rebuild live. A
report is just a serialisable `AgReportState`: pages, each holding a map of
**widgets** (keyed by an id you choose) plus a **`widgetLayout`** that positions
each one on a 24-column grid. Pass it as `initialState` (read once at init).

Each widget is a `type` + a `dataMapping`. The two shapes you need:

- **Grid** (`type: 'grid'`) → `dataMapping: { cols: [{ id, aggregation? }] }`
- **Charts** (`'column-chart-grouped'`, `'line-chart'`, …) →
  `dataMapping: { categoryKey: [...], valueKey: [{ id, aggregation }], legendKey? }`
- **KPI** (`type: 'value'`) → `dataMapping: { value: [{ id, aggregation }] }`

`aggregation` is one of `sum | avg | min | max | count | countd | first | last`.
Field `id`s must match the ids you defined in A1. Build a three-widget overview —
a KPI, a grid, and two charts:

```tsx
import type { AgReportState } from 'ag-studio';

const initialReport: AgReportState = {
  selectedPageId: 'overview',
  pages: [
    {
      id: 'overview',
      widgets: {
        totalCo2: {
          type: 'value',
          dataMapping: { value: [{ id: 'co2', aggregation: 'sum' }] },
          format: { title: { text: 'Total CO₂ (Mt)', enabled: true } },
        },
        byCountry: {
          type: 'grid',
          dataMapping: {
            cols: [
              { id: 'continent' },
              { id: 'country' },
              { id: 'co2', aggregation: 'sum' },
              { id: 'population', aggregation: 'sum' },
            ],
          },
          format: { title: { text: 'Emissions by country', enabled: true } },
        },
        byContinent: {
          type: 'column-chart-grouped',
          dataMapping: {
            categoryKey: [{ id: 'continent' }],
            valueKey: [{ id: 'co2', aggregation: 'sum' }],
          },
          format: { title: { text: 'CO₂ by continent', enabled: true } },
        },
        perCapitaTrend: {
          type: 'line-chart',
          dataMapping: {
            categoryKey: [{ id: 'date' }],
            valueKey: [{ id: 'co2_per_capita', aggregation: 'avg' }],
          },
          format: { title: { text: 'CO₂ per capita over time', enabled: true } },
        },
      },
      widgetLayout: {
        totalCo2:       { xTrack: 0,  yTrack: 0, xSpan: 24, ySpan: 4 },
        byCountry:      { xTrack: 0,  yTrack: 4, xSpan: 12, ySpan: 10 },
        byContinent:    { xTrack: 12, yTrack: 4, xSpan: 12, ySpan: 5 },
        perCapitaTrend: { xTrack: 12, yTrack: 9, xSpan: 12, ySpan: 5 },
      },
    },
  ],
};
```

Notes:

- **Authoring shortcut.** Rather than hand-write the state, build the layout once
  in the running app, then read it back with `api.getState()` (B1) and paste the
  result in — that's the ground-truth shape for the installed Studio version and
  saves you guessing at every optional key.
- `widgetLayout` tracks are a 24-column grid by default (`studioCanvasColumnsScale`),
  so `xSpan: 12` is a half-width widget; `ySpan` is in row-height units. Adjust to
  taste — Studio clamps/reflows anything that doesn't fit.
- Keep the ids stable between `widgets` and `widgetLayout` — a layout entry with no
  matching widget (or vice-versa) is ignored.

---

## Verification

Run `npm run dev`, open the **Studio** page, and confirm:

- Studio mounts with the dark theme and **opens directly on the pre-built
  overview** — the KPI, the "Emissions by country" grid, and the two charts —
  rather than an empty canvas.
- The **CO₂ Emissions** table is listed in the field panel with all eight fields
  named as in A1; dragging fields onto the canvas builds new widgets and numbers
  render with their formats.
- Deleting the widgets and rebuilding them by hand reproduces the shipped report
  (this is the live-demo path).
- Switching datasets in the navbar re-populates the widgets with the new rows.
- Export produces a full (un-truncated) file.

Then `npm run build` for a clean typecheck.

> Types (`AgDataSourcesDefinition`, `AgFieldDefinition`, `AgReportState`,
> `AgStudioStateUpdatedEvent`, `AgStudioProperties`) all come from `ag-studio`; the
> `AgStudio` component and its React props come from `ag-studio-react`. See the
> product page:
> [ag-grid.com/studio](https://www.ag-grid.com/studio).
