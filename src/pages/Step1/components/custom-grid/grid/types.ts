import type { ReactNode } from 'react';

/** Comparable primitive a column exposes for sorting & filtering. */
export type CellValue = string | number | Date | null;

export type FilterType = 'text' | 'number';

export interface ColumnDef<T> {
  /** Stable id — keys width/order/sort/filter state. */
  id: string;
  header: string;
  /** Raw comparable value used for sorting and filtering. */
  value: (row: T) => CellValue;
  /** Display string for the value; defaults to String(value). */
  format?: (value: CellValue, row: T) => string;
  /** Custom cell content; overrides `format` when provided. */
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right';
  /** Initial width in px (default 150). */
  width?: number;
  /** Sortable by clicking the header (default true). */
  sortable?: boolean;
  /**
   * Filter control for this column. Omit to infer from the value type,
   * `false` to disable filtering on the column.
   */
  filter?: FilterType | false;
}

export type SortDir = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  dir: SortDir;
}

/** Active filter text keyed by column id. */
export type FilterState = Record<string, string>;

export type SelectionMode = 'none' | 'single' | 'multiple';
