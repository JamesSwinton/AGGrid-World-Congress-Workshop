import { useCO2Data } from '../../../../data/DataProvider';

// Placeholder — Studio uses both `rows` (grid) and `chartData` (chart); impl to come.
export default function AGStudio() {
  const { rows, status } = useCO2Data();
  return (
    <div className="chart-panel">Studio portion will be instructor led.</div>
  );
}
