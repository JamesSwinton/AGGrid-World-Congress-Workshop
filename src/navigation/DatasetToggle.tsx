import { useDataset } from '../data/DataProvider';

export default function DatasetToggle() {
  const { datasets, activeId, setActiveId } = useDataset();

  return (
    <div className="seg-toggle" role="group" aria-label="Dataset">
      {datasets.map((d) => {
        const active = d.id === activeId;
        return (
          <button
            key={d.id}
            type="button"
            className={`seg-btn${active ? ' seg-btn--active' : ''}`}
            aria-pressed={active}
            onClick={() => setActiveId(d.id)}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
