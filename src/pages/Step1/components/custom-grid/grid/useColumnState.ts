import { useMemo, useState } from 'react';
import type { ColumnDef } from './types';

const DEFAULT_WIDTH = 150;
const MIN_WIDTH = 60;

/**
 * Owns per-column width (resizing) and order (reordering) state, keyed by
 * column id so it survives re-renders. Returns the columns already in display
 * order plus mutators.
 */
export function useColumnState<T>(columns: ColumnDef<T>[]) {
  const [order, setOrder] = useState<string[]>(() => columns.map((c) => c.id));
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.width ?? DEFAULT_WIDTH])),
  );

  const byId = useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns],
  );

  const orderedColumns = useMemo(
    () => order.map((id) => byId.get(id)).filter((c): c is ColumnDef<T> => !!c),
    [order, byId],
  );

  function setWidth(id: string, width: number) {
    setWidths((prev) => ({ ...prev, [id]: Math.max(MIN_WIDTH, Math.round(width)) }));
  }

  /** Move `dragId` so it sits immediately before `targetId`. */
  function reorder(dragId: string, targetId: string) {
    if (dragId === targetId) return;
    setOrder((prev) => {
      const next = prev.filter((id) => id !== dragId);
      const targetIndex = next.indexOf(targetId);
      if (targetIndex === -1) return prev;
      next.splice(targetIndex, 0, dragId);
      return next;
    });
  }

  return { orderedColumns, widths, setWidth, reorder };
}
