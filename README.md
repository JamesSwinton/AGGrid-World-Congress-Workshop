# AG Grid World Congress Workshop Repo

A hands-on workshop, built for the WeAreDevelopers World Congress, on the real
cost of building data grids and charts from scratch — and how much of it
disappears when you reach for AG Grid, AG Charts, and AG Studio.

You start with deliberately basic, hand-rolled grid and chart components, use a
pre-built prompt to bring them up to something that looks genuinely good, then
work with AI on your own to push them further — until the seams start to show.
From there you swap in AG Grid / AG Charts to feel the same features arrive as a
few lines of config, and finish with AG Studio, where the _end user_ builds their
own reports.

## Overview

The app renders the same CO₂ emissions dataset three ways — one per workshop
stage — switchable from the sidebar:

- **Custom** (Step 1) — a grid and chart written from scratch, no data libraries.
- **Primatives** (Step 2) — the same features rebuilt on AG Grid and AG Charts.
- **Studio** (Step 3) — AG Studio, an embedded analytics builder.

The arc is deliberate: extend the custom components until hand-rolling gets hard
and flaky, see how little code the same features take with AG Grid / AG Charts,
then hand report-building to the user with AG Studio.

## Setup

Prerequisites: **Node 18+** and npm.

```bash
git clone <repo-url>
cd WorldCongressWorkshopAgGrid
npm install
npm run dev
```

Vite serves the app at http://localhost:5173. It opens on the **Custom** page
(Step 1); switch pages from the sidebar and datasets from the toggle in the top
bar. `npm run build` runs a full TypeScript typecheck + production build.

### AG Grid / AG Charts / AG Studio license

Steps 2 and 3 use Enterprise features (grouping, pivoting, integrated charts,
Studio). They run out of the box in development — AG Grid logs a console
watermark and the charts show a small overlay, but everything works, so you can
do the entire workshop without a key.

To clear the watermark, grab a free trial key from
[ag-grid.com/license-pricing](https://www.ag-grid.com/license-pricing/) and set
it before the app renders. Each product registers **its own** license through its
own manager — AG Grid and AG Charts share one Enterprise key, while **AG Studio
is a separately-licensed product** and needs its own key. `src/main.tsx` already
has an env-guarded registration block; just supply the keys via a gitignored
`.env.local` (covered by `*.local` in `.gitignore`):

```bash
# .env.local
VITE_AG_GRID_LICENSE_KEY=your-grid-and-charts-trial-key
VITE_AG_STUDIO_LICENSE_KEY=your-studio-trial-key
```

The registration itself lives at the top of `src/main.tsx`, before
`ModuleRegistry.registerModules(...)`:

```ts
import { LicenseManager } from 'ag-grid-enterprise';
import { LicenseManager as ChartsLicenseManager } from 'ag-charts-enterprise';
import { AgStudioLicenseManager } from 'ag-studio';

const gridKey = import.meta.env.VITE_AG_GRID_LICENSE_KEY;
const studioKey = import.meta.env.VITE_AG_STUDIO_LICENSE_KEY;

if (gridKey) {
  LicenseManager.setLicenseKey(gridKey);       // AG Grid + integrated charts
  ChartsLicenseManager.setLicenseKey(gridKey); // standalone AG Charts (Step 2)
}
if (studioKey) AgStudioLicenseManager.setLicenseKey(studioKey); // AG Studio (Step 3)
```

Leaving either key unset just falls back to the trial watermark for that product,
so the app still runs with no keys at all.

## Repo structure

```
public/data/           # the CO₂ dataset, one folder per granularity
  {decades,yearly,quarterly,monthly}/co2.json
src/
  main.tsx             # entry — registers AG Grid/Charts enterprise modules
  App.tsx              # routes: /custom, /primatives, /studio
  index.css            # shared CSS variables (surface, border, accent, …)
  data/                # dataset registry + provider — the single source of data
    datasets.ts        # the four datasets and the default
    DataProvider.tsx   # fetches the active dataset, exposes useCO2Data()
    types.ts           # EmissionsRow / CountrySeries
  navigation/          # sidebar, top bar, dataset toggle
  pages/
    Step1/             # "Custom" — from-scratch chart + grid
      components/custom-chart/   # inline-SVG chart built from primitives
      components/custom-grid/    # plain-DOM grid
    Step2/             # "Primatives" — AGCharts + AGGrid components
    Step3/             # "Studio" — AGStudio component
docs/                  # the reference implementation plans (one per step)
```

Every component reads its data from `useCO2Data()` (`rows` for grids, `chartData`
— one series per country — for charts). No component fetches or reshapes data
itself; `DataProvider` owns that.

## Workshop stages

The workshop runs in three stages, mirrored by the three sidebar pages:

1. **Step 1 — Custom.** Turn skeleton components into a real grid and chart with a
   pre-built prompt, then (**Step 1.1**) pick further features to build _with AI,
   on your own_ — feeling where hand-rolling gets hard.
2. **Step 2 — Primatives.** Rebuild the same advanced feature set on AG Grid and
   AG Charts and watch it collapse into configuration.
3. **Step 3 — Studio.** An instructor-led demo of AG Studio, where the end user
   assembles reports themselves.

### A note on the dataset selector

The toggle in the top bar switches how much data flows into the components —
from **Decades** (~2.7k rows) up through **Yearly** (~26k), **Quarterly**
(~104k), and **Monthly** (~312k rows / 67 MB).

The Step 1 **Custom** components render every row into the DOM with no
virtualization, so they only cope with the smallest dataset. Before you implement
the Step 1 features, selecting **Quarterly** or **Monthly** (and possibly
**Yearly**, depending on your hardware) will lock up or crash the browser tab.
That is intentional — it is the first place hand-rolling bites, and row
virtualization (part of the Step 1 grid work, and free in AG Grid at Step 2) is
what fixes it. **Stay on Decades until your components handle it.** The Step 2 and
Step 3 pages virtualize by default and take every dataset in stride.

### Step 1

Implement basic data grid and charts features using the following prompt. It
references the reference implementation plan in
[`docs/step1-implementation-plan.md`](docs/step1-implementation-plan.md):

> Implement real chart and grid features into the Step 1 custom components,
> following the plan in `docs/step1-implementation-plan.md`. Build them as
> generic, config-driven, from-scratch components (no charting/grid libraries) —
> `CustomChart.tsx` and `CustomGrid.tsx` should become thin wrappers that feed
> the CO₂ dataset in.
>
> Chart (`src/pages/Step1/components/custom-chart/`): title & subtitle, a
> clickable legend that shows/hides series, a secondary (right) y-axis for the
> World cumulative CO₂ series, and hover tooltips.
>
> Grid (`src/pages/Step1/components/custom-grid/`): column resizing, column
> reordering, per-column filtering, row virtualization, sorting, and multi-row
> selection with checkboxes.
>
> Read from `useCO2Data()` and reuse the CSS variables in `src/index.css`. When
> you're done, run `npm run dev` and drive each feature to verify it works, then
> `npm run build` for a clean typecheck.

### Step 1.1

The components with basic functionality work well — now let's introduce
complexity. This is the **self-guided** part: pick one or more features below and
build them into the custom components _with AI_, on your own. Each is a real AG
Grid / AG Charts feature you'll re-encounter (as config) in Step 2 — the point is
to feel what it costs to hand-roll first.

Difficulty is rated for a **from-scratch** implementation (no libraries): 🟢 Easy
(an afternoon-sized addition), 🟡 Medium (real geometry or state to manage), 🔴
Hard (a small subsystem of its own).

**Chart** (`src/pages/Step1/components/custom-chart/`)

| Feature              | What it is / what you'll build                                                                                          | Difficulty |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| Range buttons        | Preset buttons (e.g. _10y / 50y / All_) that set the visible x-domain from the data extent.                             | 🟢 Easy    |
| Legend interactivity | Extend the click-to-toggle legend with hover-to-highlight (dim the other series) and keyboard focus.                    | 🟢 Easy    |
| Tooltip              | On hover, find the nearest data point along x and float a values box beside the pointer; hide on leave.                 | 🟡 Medium  |
| Download as image    | Serialize the SVG to a `<canvas>` and trigger a PNG download — watch out for fonts and CSS not carrying over.           | 🟡 Medium  |
| Scrolling / panning  | Once zoomed, drag to shift the visible x-window; clamp to the data extent.                                              | 🟡 Medium  |
| Zooming              | Scroll / drag-select to shrink the x- (and optionally y-) domain and recompute every scale from the zoom window.        | 🔴 Hard    |
| Navigation bar       | A mini overview chart under the main one with a draggable window that drives the zoom range, kept in sync both ways.    | 🔴 Hard    |
| Accessibility        | Focusable series/points, ARIA roles + labels, keyboard navigation, and screen-reader-friendly descriptions of the data. | 🔴 Hard    |

**Grid** (`src/pages/Step1/components/custom-grid/`)

| Feature                     | What it is / what you'll build                                                                                          | Difficulty |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| Cell selection              | Excel-style range selection: click-drag a rectangular block, tracking an anchor + focus cell, and style the range.      | 🟡 Medium  |
| Aggregations                | Sum / average a column across all rows (or per group) into a footer or group row, recomputed on filter/group changes.   | 🟡 Medium  |
| Tool panel                  | A side panel to toggle column visibility, reorder columns, and manage active groups.                                    | 🟡 Medium  |
| Integrated charting         | Feed the selected cell range into your Step 1 chart component to chart a slice of the grid.                             | 🟡 Medium  |
| Grouping with row group bar | Group rows by a column (e.g. continent) with expand/collapse group rows, plus a drag-target bar to choose the grouping. | 🔴 Hard    |
| Pivoting                    | Turn a column's distinct values into columns and aggregate at each intersection — a full reshape of the row model.      | 🔴 Hard    |

Hints & best practices:

- **Keep it config-driven.** Add each feature as an option on the existing
  config, not a bespoke branch — the same discipline that keeps `CustomChart` /
  `CustomGrid` thin wrappers. If a feature forces a special case, that's a signal.
- **Derive everything from the data domain.** Reuse the existing scale/geometry
  helpers (`scales.ts`, `path.ts`) rather than hardcoding pixel values, so
  zooming, panning and range buttons all fall out of changing one domain.
- **Virtualize before you scale the data.** Row virtualization is the unlock that
  lets the grid survive the larger datasets — build it before you stress-test
  with the toggle, don't fight the crash.
- **Let AI draft, but verify in the browser.** Drive each feature by hand on the
  largest dataset your components can handle, then resize the window — pointer
  math, event cleanup and stale closures are where from-scratch features get
  flaky, and they rarely show up in a quick glance at the code.
- **Notice the cost.** Keep a mental tally of how much code and edge-case handling
  each feature took. Step 2 turns most of them on in a line or two.

### Step 2

Implement advanced AG Grid and AG Charts features:
Charts:

- Zooming,
- Scrolling,
- Navigation bar
- Legend interactivity
- Tooltip
- Download as image
- Accessibility
- Range buttons

Grid:

- Virtualisation
- Filtering
- Sorting
- Grouping
- Aggregations
- Tool panel
- Advanced filtering
- Pivoting
- Integrated charts

Implement the advanced features using the following prompt. It references the
reference implementation plan in
[`docs/step2-implementation-plan.md`](docs/step2-implementation-plan.md), which
breaks each feature down into a focused config snippet with a link to the
relevant AG Grid / AG Charts docs:

> Turn on the advanced AG Grid and AG Charts features in the Step 2 primitives,
> following the plan in `docs/step2-implementation-plan.md`. Work through the
> plan feature by feature, adding each snippet to the right place in the two
> components (a key on the chart's `options`, a column def, a grid prop, or the
> `onFirstDataRendered` handler), and verify each against the linked docs.
>
> Chart (`src/pages/Step2/components/AGCharts/AGCharts.tsx`): a secondary right
> y-axis for World cumulative CO₂, a shared pointer-anchored tooltip, zoom
> (scroll / drag-select / alt-pan), a navigator with mini chart, an x-axis
> crosshair, and the right-click context menu (download as image).
>
> Grid (`src/pages/Step2/components/AGGrid/AGGrid.tsx`): row grouping (continent
> → country) with the row-group panel, aggregations, set/date/number column
> filters, the Columns/Filters side bar, a status bar, a pivot panel, cell
> (range) selection, multi-row selection with a header checkbox, value
> formatting, and an integrated treemap chart built via `createRangeChart` in
> `onFirstDataRendered`.
>
> Read from `useCO2Data()` and leave `DataProvider` unchanged. Enterprise modules
> are already registered in `src/main.tsx`. When you're done, run `npm run dev`,
> open the Primatives page and drive each feature, then `npm run build` for a
> clean typecheck.

Hints & best practices:

- **The plan is a map, not a script.** Work through
  [`docs/step2-implementation-plan.md`](docs/step2-implementation-plan.md) feature
  by feature — each snippet lists exactly where it goes (a chart `options` key, a
  column def, a grid prop, or `onFirstDataRendered`) and links the relevant doc.
- **Compare the effort to Step 1.** The features you may have hand-rolled — zoom,
  navigator, tooltips, grouping, aggregation — are now a single option each.
  That contrast is the whole point of the stage.
- **Read from the same `useCO2Data()`** and leave `DataProvider` untouched;
  Enterprise modules are already registered in `src/main.tsx`, so no module setup
  is needed.
- **Everything scales.** Unlike Step 1, drive the advanced datasets from the
  toggle — grouping, filtering and virtualization all hold up at Monthly.

### Step 3

Step 3 is an instructor-led demo of **AG Studio** — the embedded analytics
builder. Where Steps 1 and 2 hand you finished components, Studio hands the _end
user_ a report builder: they drag fields onto a canvas and assemble grids,
charts and dashboards themselves. The work is to describe the CO₂ dataset well
and pass it to `<AgStudio>`.

The prompt below builds the whole thing — the data wiring _and_ a finished
dashboard that opens automatically — so the component ships working. In the
session the instructor will build the report live from an empty
canvas to demo how an end user assembles it. It references the reference
implementation plan in
[`docs/step3-implementation-plan.md`](docs/step3-implementation-plan.md), which
covers the data-source/field definitions, theming, and the pre-built report:

> Wire the CO₂ dataset into AG Studio in the Step 3 component and ship a pre-built
> dashboard, following the plan in `docs/step3-implementation-plan.md`. Turn the
> placeholder `src/pages/Step3/components/AGStudio/AGStudio.tsx` into a working
> embedded analytics builder that opens on a finished report.
>
> Build an `AgDataSourcesDefinition` with a single in-memory
> `AgSimpleDataSourceDefinition` (`id: 'emissions'`) whose `data` is `rows` from
> `useCO2Data()` and whose `fields` give each column a name and a `format`
> (`textFormat` for country/continent, `dateFormat` for date, `decimalFormat` /
> `integerFormat` / `percentageFormat` for the numerics).
>
> Also build an `initialState` (`AgReportState`) with one `overview` page holding
> four widgets — a `value` KPI of total CO₂, a `grid` of emissions by
> continent/country, a `column-chart-grouped` of CO₂ by continent, and a
> `line-chart` of CO₂ per capita over time — positioned via `widgetLayout` on the
> 24-column grid. Field ids in each `dataMapping` must match the field ids above.
>
> Pass both to `<AgStudio>` along with `mode="edit"`, the dark
> `studioTheme.withParams(...)`, `dataOptions={{ maxExportRows: -1 }}`, and an
> `onStateUpdated` handler. Gate the mount on `status === 'ready'` so rows are
> populated first.
>
> Read from `useCO2Data()` (use `rows` — countries only) and leave `DataProvider`
> and `Studio.tsx` unchanged. No module registration is needed. When you're done,
> run `npm run dev`, open the Studio page and confirm it opens on the pre-built
> report and that dragging fields onto the canvas builds new widgets, then
> `npm run build` for a clean typecheck.

Hints & best practices:

- **Describe the data well and Studio does the rest.** The work is the field
  definitions (names + formats) and the pre-built report — see
  [`docs/step3-implementation-plan.md`](docs/step3-implementation-plan.md).
- **Author the report in the UI, then capture it.** Rather than hand-writing the
  `initialState`, build the dashboard live and read it back with
  `api.getState()` — that's the exact shape for the installed version.
- **Follow the demo arc.** Ship the finished report, then delete the widgets and
  rebuild them by hand to show how an end user assembles the same thing from an
  empty canvas — no code.

## Solution

Reference implementations for each stage live on their own branches. Check one
out to compare against your work, to catch up if you fall behind, or to see the
finished result:

| Branch                             | Stage                                                        |
| ---------------------------------- | ------------------------------------------------------------ |
| `step-1-core-features`             | Step 1 — the from-scratch chart & grid, features implemented |
| `step-2-grid-&-charts-primatives`  | Step 2 — the AG Grid / AG Charts primitives                  |
| `step-3-embedded-analytics-studio` | Step 3 — the AG Studio component                             |

```bash
git checkout step-1-core-features      # see the finished Step 1
```

Each branch pairs with the matching plan in [`docs/`](docs/). To compare your work
against a solution without switching branches, diff against it — e.g.
`git diff step-1-core-features -- src/pages/Step1`.

## AG Grid, Charts, Studio

The three products this workshop is built on — all free to try, with Enterprise
features running in dev without a key:

- **[AG Grid](https://www.ag-grid.com/)** — the datagrid you hand-rolled in Step 1
  and configured in Step 2: sorting, filtering, grouping, pivoting, aggregation,
  range selection, integrated charts and row virtualization, in every major
  framework. Community edition is free and MIT-licensed; Enterprise adds the
  advanced features used here.
- **[AG Charts](https://www.ag-charts.com/)** — the charting library behind Step
  2 and AG Grid's integrated charts: cartesian, financial, hierarchical and more,
  with zoom, navigator, crosshairs and animations. Community edition is free;
  Enterprise adds the advanced series and interactions.
- **[AG Studio](https://www.ag-grid.com/studio/)** — the embedded analytics
  builder from Step 3: hand your users a canvas and let them assemble their own
  grids, charts and dashboards on top of your data.
