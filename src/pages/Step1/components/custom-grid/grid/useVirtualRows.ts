import { useCallback, useRef, useState } from 'react';

const OVERSCAN = 8;

/**
 * Row windowing for a fixed-row-height scroll viewport. Attach `viewportRef`
 * to the scroll container and wire `onScroll`; render only rows in
 * [start, end) offset by `offsetY`. Keeps the DOM small regardless of row
 * count.
 */
export function useVirtualRows(rowCount: number, rowHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const viewportRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h != null) setHeight(h);
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const visible = Math.ceil(height / rowHeight) + OVERSCAN * 2;
  const end = Math.min(rowCount, start + visible);

  return {
    viewportRef,
    onScroll,
    start,
    end,
    offsetY: start * rowHeight,
    totalHeight: rowCount * rowHeight,
  };
}
