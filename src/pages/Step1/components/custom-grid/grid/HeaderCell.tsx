import { useState } from 'react';
import type { ColumnDef, SortState } from './types';

interface HeaderCellProps<T> {
  column: ColumnDef<T>;
  width: number;
  sort: SortState | null;
  onSort: (id: string) => void;
  onResize: (id: string, width: number) => void;
  onReorder: (dragId: string, targetId: string) => void;
}

export default function HeaderCell<T>({
  column,
  width,
  sort,
  onSort,
  onResize,
  onReorder,
}: HeaderCellProps<T>) {
  const [dragOver, setDragOver] = useState(false);
  const sortable = column.sortable ?? true;
  const active = sort?.columnId === column.id;
  const caret = active ? (sort!.dir === 'asc' ? '▲' : '▼') : sortable ? '↕' : '';

  function startResize(e: React.MouseEvent) {
    // preventDefault blocks the native drag from starting on the handle.
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = width;
    const move = (ev: MouseEvent) => onResize(column.id, startW + (ev.clientX - startX));
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      document.body.classList.remove('dg-resizing');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    document.body.classList.add('dg-resizing');
  }

  return (
    <div
      className={`dg-th${dragOver ? ' dg-th--dragover' : ''}`}
      style={{ width, justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start' }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', column.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onReorder(id, column.id);
      }}
      onClick={() => sortable && onSort(column.id)}
      role="columnheader"
      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="dg-th-label">{column.header}</span>
      {caret && (
        <span className={`dg-th-caret${active ? ' dg-th-caret--active' : ''}`}>
          {caret}
        </span>
      )}
      <span
        className="dg-th-resize"
        onMouseDown={startResize}
        onClick={(e) => e.stopPropagation()}
        role="separator"
        aria-label={`Resize ${column.header}`}
      />
    </div>
  );
}
