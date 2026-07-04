export interface Point {
  date: Date;
  /** Null means a gap — the line breaks rather than interpolating across it. */
  value: number | null;
}

export interface PlottedSeries {
  country: string;
  color: string;
  points: Point[];
}

/** Maps a value from a data domain to a pixel position. */
export type XScale = (date: Date) => number;
export type YScale = (value: number) => number;
