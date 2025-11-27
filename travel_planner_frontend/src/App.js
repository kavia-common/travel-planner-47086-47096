import React, { useState, useEffect } from 'react';
import './App.css';
import TripsList from './components/TripsList';
import ItineraryBuilder from './components/itinerary/ItineraryBuilder';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          <nav className="navbar" aria-label="Primary">
            <div className="trips-section">
              <div className="trips-header">
                <h1 className="trips-title" style={{ margin: 0 }}>
                  <Link to="/" className="App-link" style={{ textDecoration: 'none' }}>
                    Travel Planner
                  </Link>
                </h1>
                <p className="trips-subtitle">Plan trips with Ocean Professional theme</p>
              </div>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<TripsList />} />
              <Route path="/trips/:id/itinerary/new" element={<ItineraryBuilder />} />
            </Routes>
          </main>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
