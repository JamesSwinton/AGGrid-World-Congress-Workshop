import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { DATASETS, DEFAULT_DATASET_ID, getDataset } from './datasets';
import type {
  CountrySeries,
  DataStatus,
  DatasetId,
  EmissionsRow,
  RawEmissionsRow,
} from './types';

interface DataContextValue {
  rows: EmissionsRow[];
  chartData: CountrySeries[];
  status: DataStatus;
  error: Error | null;
  activeId: DatasetId;
  setActiveId: (id: DatasetId) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function mapRows(raw: RawEmissionsRow[]): EmissionsRow[] {
  return raw.map((r) => ({
    ...r,
    // ISO "YYYY-MM-DD" parses as UTC midnight — read it back with getUTC* to
    // avoid the period drifting a day in negative-offset timezones.
    date: new Date(r.date),
  }));
}

/**
 * True for actual countries, false for the dataset's aggregate entries
 * (World, continents, EU-27, income groups, International transport, …).
 * In the source data every aggregate has a null `continent` while every
 * real country has one, so that single field is the discriminator.
 */
function isCountry(row: EmissionsRow): boolean {
  return row.continent != null;
}

/**
 * Reshape flat rows into one series per country for charts. Keeps full rows
 * per point so a chart can pick any metric as its yKey without re-shaping.
 */
function toChartData(rows: EmissionsRow[]): CountrySeries[] {
  const byCountry = new Map<string, CountrySeries>();
  for (const row of rows) {
    let series = byCountry.get(row.country);
    if (!series) {
      series = { country: row.country, continent: row.continent, data: [] };
      byCountry.set(row.country, series);
    }
    series.data.push(row);
  }

  const all = Array.from(byCountry.values());
  for (const series of all) {
    series.data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  all.sort((a, b) => a.country.localeCompare(b.country));
  return all;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<DatasetId>(DEFAULT_DATASET_ID);
  const [rows, setRows] = useState<EmissionsRow[]>([]);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Parsed datasets are cached per id, so toggling back to an already-loaded
  // dataset is instant and never refetches.
  const cacheRef = useRef<Partial<Record<DatasetId, EmissionsRow[]>>>({});

  useEffect(() => {
    const cached = cacheRef.current[activeId];
    if (cached) {
      setRows(cached);
      setError(null);
      setStatus('ready');
      return;
    }

    let cancelled = false;
    const meta = getDataset(activeId);
    setStatus('loading');
    setError(null);
    setRows([]);

    fetch(meta.path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${meta.path} (${res.status})`);
        return res.json() as Promise<RawEmissionsRow[]>;
      })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapRows(raw);
        cacheRef.current[activeId] = mapped;
        setRows(mapped);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Grids show countries only; charts keep the full data (incl. aggregates).
  const countryRows = useMemo(() => rows.filter(isCountry), [rows]);
  const chartData = useMemo(() => toChartData(rows), [rows]);

  const value = useMemo<DataContextValue>(
    () => ({ rows: countryRows, chartData, status, error, activeId, setActiveId }),
    [countryRows, chartData, status, error, activeId],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within a <DataProvider>');
  return ctx;
}

/**
 * Read the active dataset's data and load status.
 * - `rows`: flat records, for grids.
 * - `chartData`: same data grouped into one series per country, for charts.
 */
export function useCO2Data() {
  const { rows, chartData, status, error } = useDataContext();
  return { rows, chartData, status, error };
}

/** Read + change the active dataset — used by the navbar toggle. */
export function useDataset() {
  const { activeId, setActiveId } = useDataContext();
  return { datasets: DATASETS, activeId, setActiveId };
}
