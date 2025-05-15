import './App.css';
import './assets/help.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// import Building from './components/old-components/Building';
// import {  } from './config';

// import ConfigurationPage from './pages/ConfigurationPage';
import HomePage from './pages/HomePage';


import ElevatorSystem from './components/ElevatorSystem';
import BuildingContainer from './components/BuildingContainer';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="/simulation" element={<Building config={defaultElevatorSystemConfig} />} /> */}
          <Route path="/simulation" element={<BuildingContainer />} />
          <Route path="/configure" element={<ElevatorSystem  />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
