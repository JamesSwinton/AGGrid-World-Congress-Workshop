export interface Point {
  date: Date;
  /** Null means a gap — the line breaks rather than interpolating across it. */
  value: number | null;
}

/** Which y-axis a series is measured against. */
export type AxisId = 'left' | 'right';

export interface SeriesDef {
  id: string;
  /** Display name (legend + tooltip). */
  name: string;
  color: string;
  points: Point[];
  /** Defaults to the left axis. */
  axis?: AxisId;
  /** Hidden series are kept in config but not drawn (legend toggle). */
  hidden?: boolean;
  /** Dashed stroke — handy to distinguish a secondary-axis series. */
  dashed?: boolean;
  strokeWidth?: number;
}

export interface AxisDef {
  /** Axis title drawn alongside the ticks. */
  label?: string;
  /** Formats a tick / tooltip value for this axis. */
  format?: (value: number) => string;
}

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  series: SeriesDef[];
  leftAxis?: AxisDef;
  /** Provide to enable a secondary (right) y-axis. */
  rightAxis?: AxisDef;
}

/** Maps a value from a data domain to a pixel position. */
export type XScale = (date: Date) => number;
export type YScale = (value: number) => number;
