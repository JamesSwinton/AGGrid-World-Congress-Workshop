import { useCallback, useRef, useState } from 'react';
import type { SelectionMode } from './types';

/**
 * Row selection state. `multiple` mode supports checkbox toggling, a tri-state
 * header select-all, and shift-click range selection (over the currently
 * displayed order). Ranges/select-all resolve against `displayedIds`.
 */
export function useRowSelection(mode: SelectionMode, displayedIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastIndexRef = useRef<number | null>(null);

  const toggle = useCallback(
    (id: string, index: number, shift: boolean) => {
      if (mode === 'none') return;
      setSelected((prev) => {
        if (mode === 'single') {
          return prev.has(id) ? new Set() : new Set([id]);
        }
        const next = new Set(prev);
        if (shift && lastIndexRef.current != null) {
          const [a, b] = [lastIndexRef.current, index].sort((x, y) => x - y);
          for (let i = a; i <= b; i++) next.add(displayedIds[i]);
          return next;
        }
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastIndexRef.current = index;
    },
    [mode, displayedIds],
  );

  const allSelected =
    displayedIds.length > 0 && displayedIds.every((id) => selected.has(id));
  const someSelected = !allSelected && displayedIds.some((id) => selected.has(id));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (displayedIds.every((id) => prev.has(id))) {
        displayedIds.forEach((id) => next.delete(id));
      } else {
        displayedIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [displayedIds]);

  return { selected, toggle, toggleAll, allSelected, someSelected };
}
