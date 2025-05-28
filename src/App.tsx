import './App.css';
import './assets/help.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GlobalConfigPage from './pages/GlobalConfigPage';
import SimulationPage from './pages/SimulationPage';
import Layout from './components/Layout';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/configure" element={<GlobalConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
