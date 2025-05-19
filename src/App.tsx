import './App.css';
import './assets/help.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';


import BuildingContainer from './components/BuildingContainer';
import GlobalConfigPage from './components/GlobalConfigPage';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="/simulation" element={<Building config={defaultElevatorSystemConfig} />} /> */}
          <Route path="/simulation" element={<BuildingContainer />} />
          <Route path="/configure" element={<GlobalConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
