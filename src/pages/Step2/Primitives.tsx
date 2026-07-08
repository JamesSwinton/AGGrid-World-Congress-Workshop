import AGCharts from './components/AGCharts/AGCharts';
import AGGrid from './components/AGGrid/AGGrid';

export default function Primitives() {
  return (
    <div className="page">
      <div className="page-chart">
        <AGCharts />
      </div>
      <div className="page-grid">
        <AGGrid />
      </div>
    </div>
  );
}
