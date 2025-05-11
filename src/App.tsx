import './App.css';
import './assets/help.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Building from './components/Building';
import ConfigurationPage from './pages/ConfigurationPage';
import HomePage from './pages/HomePage';
import { defaultElevatorSystemConfig } from './config';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/simulation" element={<Building config={defaultElevatorSystemConfig} />} />
          <Route path="/configure" element={<ConfigurationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
