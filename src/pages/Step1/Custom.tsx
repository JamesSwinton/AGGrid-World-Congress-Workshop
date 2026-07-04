import CustomChart from './components/custom-chart/CustomChart';
import CustomGrid from './components/custom-grid/CustomGrid';

export default function Custom() {
  return (
    <div className="page">
      <div className="page-chart">
        <CustomChart />
      </div>
      <div className="page-grid">
        <CustomGrid />
      </div>
    </div>
  );
}
