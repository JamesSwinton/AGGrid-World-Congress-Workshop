import { resolveFilterType } from './useGridData';
import type { ColumnDef, FilterState } from './types';

interface FilterRowProps<T> {
  columns: ColumnDef<T>[];
  widths: Record<string, number>;
  filters: FilterState;
  sampleRow: T | undefined;
  onChange: (id: string, value: string) => void;
  /** Leading spacer width to align with the selection checkbox column. */
  leadWidth: number;
}

export default function FilterRow<T>({
  columns,
  widths,
  filters,
  sampleRow,
  onChange,
  leadWidth,
}: FilterRowProps<T>) {
  return (
    <div className="dg-filter-row">
      {leadWidth > 0 && <div className="dg-filter-lead" style={{ width: leadWidth }} />}
      {columns.map((column) => {
        const type = resolveFilterType(column, sampleRow);
        const width = widths[column.id];
        return (
          <div key={column.id} className="dg-filter-cell" style={{ width }}>
            {type === false ? null : (
              <input
                className="dg-filter-input"
                type="text"
                value={filters[column.id] ?? ''}
                placeholder={type === 'number' ? '>, <, =…' : 'Filter…'}
                onChange={(e) => onChange(column.id, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
