import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './navigation/Sidebar';
import Topbar from './navigation/Topbar';
import { DataProvider } from './data/DataProvider';
import Custom from './pages/Step1/Custom';
import Primitives from './pages/Step2/Primitives';
import Studio from './pages/Step3/Studio';
import './App.css';

function App() {
  return (
    <DataProvider>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar title="AG Grid Workshop - WeAreDevelopers World Congress" />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/custom" replace />} />
              <Route path="/custom" element={<Custom />} />
              <Route path="/primitives" element={<Primitives />} />
              <Route path="/studio" element={<Studio />} />
            </Routes>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;
