import type { DatasetId } from './types';

export interface DatasetMeta {
  id: DatasetId;
  /** Label shown on the navbar toggle. */
  label: string;
  /** Public URL of the JSON file. */
  path: string;
}

/**
 * The registry drives everything: the navbar toggle renders from this list,
 * and the provider resolves the active id to a file. Adding another dataset
 * later is a single entry here — no other code changes.
 */
export const DATASETS: DatasetMeta[] = [
  {
    id: 'decades',
    label: 'Decades',
    path: '/data/decades/co2.json',
  },
  {
    id: 'yearly',
    label: 'Yearly',
    path: '/data/yearly/co2.json',
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    path: '/data/quarterly/co2.json',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    path: '/data/monthly/co2.json',
  },
];

export const DEFAULT_DATASET_ID: DatasetId = 'decades';

export function getDataset(id: DatasetId): DatasetMeta {
  const meta = DATASETS.find((d) => d.id === id);
  if (!meta) throw new Error(`Unknown dataset id: ${id}`);
  return meta;
}
