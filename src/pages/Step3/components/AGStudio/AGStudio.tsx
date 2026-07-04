import { useCO2Data } from '../../../../data/DataProvider';
import { AgStudio } from 'ag-studio-react';
import { studioTheme } from 'ag-studio';

const myTheme = studioTheme.withParams({
  backgroundColor: '#0e0f13',
  foregroundColor: '#e0e0e0',
});

// Placeholder — Studio uses both `rows` (grid) and `chartData` (chart); impl to come.
export default function AGStudio() {
  const { rows, status } = useCO2Data();
  return (
    <AgStudio
      mode="edit"
      onStateUpdated={(s) => console.log(s)}
      theme={myTheme}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
