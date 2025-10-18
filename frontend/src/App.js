import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FocusMode from './components/FocusMode';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [mockMode, setMockMode] = useState(false);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage mockMode={mockMode} setMockMode={setMockMode} />} />
          <Route path="/focus" element={<FocusMode mockMode={mockMode} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
