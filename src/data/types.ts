export type DatasetId = 'decades' | 'yearly' | 'quarterly' | 'monthly';

/**
 * A single emissions record, normalized so every component is
 * dataset-agnostic: `date` is the period *start* (year → Jan 1,
 * quarter → the first day of the quarter).
 */
export interface EmissionsRow {
  continent: string;
  country: string;
  /** Period start, parsed as a UTC date. */
  date: Date;
  co2: number | null;
  co2_per_capita: number | null;
  cumulative_co2: number | null;
  share_global_co2: number | null;
  population: number | null;
}

/**
 * Chart-friendly grouping: one entry per country = one chart series.
 * `rows` reshaped so a chart can map each entry straight to a series
 * (`data` as the series data, `country` as the series name).
 */
export interface CountrySeries {
  country: string;
  continent: string;
  /** This country's rows, sorted ascending by date. */
  data: EmissionsRow[];
}

/** Raw row shape as stored in the JSON files (identical across datasets). */
export interface RawEmissionsRow {
  continent: string;
  country: string;
  date: string;
  co2: number | null;
  co2_per_capita: number | null;
  cumulative_co2: number | null;
  share_global_co2: number | null;
  population: number | null;
}

export type DataStatus = 'idle' | 'loading' | 'ready' | 'error';
