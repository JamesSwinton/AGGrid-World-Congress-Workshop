import { useMemo, useState } from 'react';
import FilterRow from './FilterRow';
import HeaderCell from './HeaderCell';
import type { ColumnDef, FilterState, SelectionMode, SortState } from './types';
import { useColumnState } from './useColumnState';
import { useGridData } from './useGridData';
import { useRowSelection } from './useRowSelection';
import { useVirtualRows } from './useVirtualRows';

interface DataGridProps<T> {
  rowData: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  selection?: SelectionMode;
  rowHeight?: number;
}

const SELECT_COL_WIDTH = 44;

/** Header checkbox that reflects the tri-state (all / some / none) selection. */
function SelectAll({
  allSelected,
  someSelected,
  onToggle,
}: {
  allSelected: boolean;
  someSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={allSelected}
      ref={(el) => {
        if (el) el.indeterminate = someSelected;
      }}
      onChange={onToggle}
      aria-label="Select all rows"
    />
  );
}

/**
 * Generic virtualized data grid. Column-def driven (not tied to any dataset):
 * column resizing, drag reordering, per-column inline filtering, single-column
 * sorting, row virtualization, and checkbox row selection.
 */
export default function DataGrid<T>({
  rowData,
  columns,
  getRowId,
  selection = 'none',
  rowHeight = 32,
}: DataGridProps<T>) {
  const { orderedColumns, widths, setWidth, reorder } = useColumnState(columns);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState | null>(null);

  const displayed = useGridData(rowData, columns, filters, sort);
  const displayedIds = useMemo(() => displayed.map(getRowId), [displayed, getRowId]);

  const { selected, toggle, toggleAll, allSelected, someSelected } = useRowSelection(
    selection,
    displayedIds,
  );
  const { viewportRef, onScroll, start, end, totalHeight } = useVirtualRows(
    displayed.length,
    rowHeight,
  );

  const leadWidth = selection === 'none' ? 0 : SELECT_COL_WIDTH;
  const totalWidth = leadWidth + orderedColumns.reduce((sum, c) => sum + widths[c.id], 0);

  function cycleSort(id: string) {
    setSort((prev) => {
      if (!prev || prev.columnId !== id) return { columnId: id, dir: 'asc' };
      if (prev.dir === 'asc') return { columnId: id, dir: 'desc' };
      return null; // asc → desc → unsorted
    });
  }

  function setFilter(id: string, value: string) {
    setFilters((prev) => ({ ...prev, [id]: value }));
  }

  const slice = displayed.slice(start, end);

  return (
    <div className="dg-root">
      <div className="dg-viewport" ref={viewportRef} onScroll={onScroll}>
        <div className="dg-head" style={{ width: totalWidth }}>
          <div className="dg-header-row" style={{ height: rowHeight }}>
            {selection !== 'none' && (
              <div className="dg-th dg-th--select" style={{ width: leadWidth }}>
                {selection === 'multiple' && (
                  <SelectAll
                    allSelected={allSelected}
                    someSelected={someSelected}
                    onToggle={toggleAll}
                  />
                )}
              </div>
            )}
            {orderedColumns.map((column) => (
              <HeaderCell
                key={column.id}
                column={column}
                width={widths[column.id]}
                sort={sort}
                onSort={cycleSort}
                onResize={setWidth}
                onReorder={reorder}
              />
            ))}
          </div>
          <FilterRow
            columns={orderedColumns}
            widths={widths}
            filters={filters}
            sampleRow={rowData[0]}
            onChange={setFilter}
            leadWidth={leadWidth}
          />
        </div>

        <div className="dg-body" style={{ height: totalHeight, width: totalWidth }}>
          {slice.map((row, i) => {
            const index = start + i;
            const id = getRowId(row);
            const isSelected = selected.has(id);
            return (
              <div
                key={id}
                className={`dg-row${isSelected ? ' dg-row--selected' : ''}`}
                style={{ top: index * rowHeight, height: rowHeight, width: totalWidth }}
                onClick={(e) =>
                  selection !== 'none' && toggle(id, index, e.shiftKey)
                }
                aria-selected={isSelected}
                role="row"
              >
                {selection !== 'none' && (
                  <div className="dg-cell dg-cell--select" style={{ width: leadWidth }}>
                    <input type="checkbox" checked={isSelected} readOnly tabIndex={-1} />
                  </div>
                )}
                {orderedColumns.map((column) => {
                  const value = column.value(row);
                  const content = column.render
                    ? column.render(row)
                    : column.format
                      ? column.format(value, row)
                      : value == null
                        ? ''
                        : String(value);
                  return (
                    <div
                      key={column.id}
                      className="dg-cell"
                      style={{ width: widths[column.id], textAlign: column.align ?? 'left' }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="dg-status">
        {displayed.length.toLocaleString()} rows
        {displayed.length !== rowData.length && ` (of ${rowData.length.toLocaleString()})`}
        {selection !== 'none' && ` · ${selected.size} selected`}
      </div>
    </div>
  );
}
