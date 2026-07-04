import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { LicenseManager as ChartsLicenseManager } from 'ag-charts-enterprise';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { AgStudioLicenseManager } from 'ag-studio';

import './index.css';
import App from './App.tsx';

const gridKey = import.meta.env.VITE_AG_GRID_LICENSE_KEY;
const studioKey = import.meta.env.VITE_AG_STUDIO_LICENSE_KEY;

if (gridKey) {
  LicenseManager.setLicenseKey(gridKey);
  ChartsLicenseManager.setLicenseKey(gridKey);
}
if (studioKey) AgStudioLicenseManager.setLicenseKey(studioKey);

ModuleRegistry.registerModules([
  AllEnterpriseModule.with(AgChartsEnterpriseModule),
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
