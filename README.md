# AG Grid World Congress Workshop Repo

Intro

## Overview

Extend a custom grid and chart component to see where it gets hard and flaky, then implement AG Grid/Charts to see the comparison.

## Setup

TODO

## Repo structure

TODO

## Workshop stages

TODO

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

The components with basic functionality work well - let's introduce complexity.

Choose from the following features to implement:

Charts

- Zooming,
- Scrolling,
- Navigation bar
- Legend interactivity
- Tooltip
- Download as image
- Accessibility
- Range buttons

Grid:

- Grouping with row group bar
- Cell selection
- Pivoting
- Integrated charting
- Aggregations
- Tool panel

Hints & best practices:

TODO: Best practices for implementing features from scratch

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

TODO: Prompt that clearly tells an LLM how to implement all of the advanced features into AG Grid and AG Charts, with references to documentation where relevant and a more detailed plan.

Hints & Best practices: todo

### Step 3

Step 3 is an instructor led demo of AG Studio

## Solution

TODO

## AG Grid, Charts, Studio

TODO: Promo for products
