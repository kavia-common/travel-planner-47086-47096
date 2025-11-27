import React, { useState, useEffect } from 'react';
import './App.css';
import TripsList from './components/TripsList';
import ItineraryBuilder from './components/itinerary/ItineraryBuilder';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RemindersPanel from './components/reminders/RemindersPanel';
import Toasts from './components/reminders/Toasts';
import { ReminderService } from './services/ReminderService';
import LanguageHelper from './components/language/LanguageHelper';
import CurrencyConverterPanel from './components/currency/CurrencyConverterPanel';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Subscribe to ReminderService toast events
  useEffect(() => {
    const unsub = ReminderService.subscribe((evt) => {
      const prefix =
        evt.type === 'flight'
          ? '✈️ Flight'
          : evt.type === 'checkin'
          ? '🏨 Check-in'
          : evt.type === 'activity'
          ? '📌 Activity'
          : '⏰ Reminder';
      const toast = {
        id: `${evt.id}-${Date.now()}`, // unique toast id
        title: evt.title,
        subtitle: `When: ${evt.displayTime}`,
        prefix,
      };
      setToasts((prev) => [toast, ...prev].slice(0, 5));
    });
    return () => unsub?.();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setLanguageOpen(true)}
                    title="Open language helper"
                  >
                    🌐 Language
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrencyOpen(true)}
                    title="Open currency converter"
                  >
                    💱 Currency
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setRemindersOpen((v) => !v)}
                    title="Open reminders"
                  >
                    🔔 Reminders
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<TripsList />} />
              <Route path="/trips/:id/itinerary/new" element={<ItineraryBuilder onOpenLanguage={() => setLanguageOpen(true)} />} />
            </Routes>
          </main>
        </header>

        <RemindersPanel
          open={remindersOpen}
          onClose={() => setRemindersOpen(false)}
          onOpenLanguage={() => setLanguageOpen(true)}
        />
        <LanguageHelper open={languageOpen} onClose={() => setLanguageOpen(false)} />
        <CurrencyConverterPanel open={currencyOpen} onClose={() => setCurrencyOpen(false)} />
        <Toasts items={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  );
}

export default App;
