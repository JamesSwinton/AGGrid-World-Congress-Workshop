import { useMemo } from 'react';
import type {
  CellValue,
  ColumnDef,
  FilterState,
  FilterType,
  SortState,
} from './types';

/** Resolve a column's filter control type, inferring from a sample row. */
export function resolveFilterType<T>(
  column: ColumnDef<T>,
  sampleRow: T | undefined,
): FilterType | false {
  if (column.filter !== undefined) return column.filter;
  if (!sampleRow) return 'text';
  return typeof column.value(sampleRow) === 'number' ? 'number' : 'text';
}

function textPredicate(query: string): (v: CellValue) => boolean {
  const q = query.toLowerCase();
  return (v) => String(v ?? '').toLowerCase().includes(q);
}

// Supports comparison operators (>, <, >=, <=, =); otherwise substring match.
function numberPredicate(query: string): (v: CellValue) => boolean {
  const m = query.match(/^\s*(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m) {
    const op = m[1];
    const n = parseFloat(m[2]);
    return (v) => {
      if (typeof v !== 'number') return false;
      switch (op) {
        case '>':
          return v > n;
        case '<':
          return v < n;
        case '>=':
          return v >= n;
        case '<=':
          return v <= n;
        case '=':
          return v === n;
        default:
          return true;
      }
    };
  }
  return textPredicate(query.trim());
}

function compareNonNull(a: CellValue, b: CellValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
}

/**
 * Derives the rows actually shown: applies every active per-column filter, then
 * a single-column sort. Memoized so scrolling/selection don't recompute it.
 */
export function useGridData<T>(
  rowData: T[],
  columns: ColumnDef<T>[],
  filters: FilterState,
  sort: SortState | null,
): T[] {
  const filtered = useMemo(() => {
    const active = Object.entries(filters).filter(([, q]) => q.trim() !== '');
    if (active.length === 0) return rowData;

    const predicates = active
      .map(([id, query]) => {
        const column = columns.find((c) => c.id === id);
        if (!column || column.filter === false) return null;
        const type = resolveFilterType(column, rowData[0]);
        const test = type === 'number' ? numberPredicate(query) : textPredicate(query);
        return (row: T) => test(column.value(row));
      })
      .filter((p): p is (row: T) => boolean => p != null);

    return rowData.filter((row) => predicates.every((p) => p(row)));
  }, [rowData, columns, filters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column) return filtered;
    const { value } = column;
    const factor = sort.dir === 'asc' ? 1 : -1;

    return [...filtered].sort((ra, rb) => {
      const a = value(ra);
      const b = value(rb);
      if (a == null && b == null) return 0;
      if (a == null) return 1; // nulls always last
      if (b == null) return -1;
      return factor * compareNonNull(a, b);
    });
  }, [filtered, columns, sort]);

  return sorted;
}
