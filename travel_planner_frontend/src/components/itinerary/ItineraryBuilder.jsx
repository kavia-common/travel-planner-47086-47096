import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DayPlanner from './DayPlanner';

/**
 * PUBLIC_INTERFACE
 * ItineraryBuilder
 * A guided editor to build an itinerary for a given trip.
 * - Add/remove days
 * - Per-day activities management (via DayPlanner)
 * - Save itinerary (persists to localStorage for now; TODO: wire to backend API)
 *
 * Route usage: /trips/:id/itinerary/new
 */
function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('My Itinerary');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState([
    { id: crypto.randomUUID(), dateLabel: '', activities: [] },
  ]);
  const [notes, setNotes] = useState('');

  const canSave = useMemo(() => {
    return name.trim().length > 0 && days.length > 0;
  }, [name, days.length]);

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { id: crypto.randomUUID(), dateLabel: '', activities: [] },
    ]);
  };

  const removeDay = (idx) => {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveDay = (index, dir) => {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= days.length) return;
    const copy = [...days];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    setDays(copy);
  };

  const updateDayMeta = (idx, key, value) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d)));
  };

  const updateDayActivities = (idx, activities) => {
    setDays((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, activities } : d))
    );
  };

  const saveLocal = () => {
    const payload = {
      id: crypto.randomUUID(),
      trip_id: tripId ? String(tripId) : null,
      name: name.trim(),
      start_date: startDate || null,
      end_date: null, // computed later if needed
      notes: notes || null,
      days: days.map((d, i) => ({
        index: i,
        dateLabel: d.dateLabel || null,
        activities: d.activities
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      })),
      created_at: new Date().toISOString(),
    };

    // Temporary persistence
    try {
      const key = 'itineraries';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([payload, ...existing]));
    } catch (e) {
      // ignore
    }
  };

  const onSave = async () => {
    // TODO: If backend is available, replace with:
    // 1) POST /api/itineraries { trip_id, name, start_date, end_date, notes }
    // 2) For each day.activity, POST /api/activities with itinerary_id and day info.
    // For now, persist locally and route back to trips.
    saveLocal();
    navigate('/', { replace: true });
  };

  return (
    <section className="itinerary-builder container" aria-labelledby="itinerary-title">
      <header className="builder-header">
        <div>
          <h2 id="itinerary-title" className="trips-title">Create Itinerary</h2>
          {tripId ? (
            <p className="trips-subtitle">Trip #{tripId}</p>
          ) : (
            <p className="trips-subtitle">No trip selected</p>
          )}
        </div>
        <div className="builder-actions">
          <button className="btn-secondary" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="btn-primary" type="button" onClick={onSave} disabled={!canSave}>
            Save Itinerary
          </button>
        </div>
      </header>

      <div className="builder-form">
        <div className="grid-2">
          <div className="field-row">
            <label htmlFor="it-name">Name</label>
            <input
              id="it-name"
              type="text"
              placeholder="e.g., Paris & Alps Summer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field-row">
            <label htmlFor="it-start">Start date</label>
            <input
              id="it-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <label htmlFor="it-notes">Notes</label>
          <textarea
            id="it-notes"
            placeholder="Overall itinerary notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="days-wrap">
        <div className="days-header">
          <h3 className="trips-title">Days</h3>
          <button type="button" className="btn-accent" onClick={addDay}>+ Add day</button>
        </div>

        {days.length === 0 ? (
          <div className="trips-empty">No days yet. Add a day to start planning.</div>
        ) : (
          <ul className="days-list">
            {days.map((d, idx) => (
              <li key={d.id} className="day-card">
                <div className="day-meta">
                  <div className="grid-2">
                    <div className="field-row">
                      <label htmlFor={`day-label-${d.id}`}>Label</label>
                      <input
                        id={`day-label-${d.id}`}
                        type="text"
                        placeholder={`Day ${idx + 1} label (optional)`}
                        value={d.dateLabel}
                        onChange={(e) => updateDayMeta(idx, 'dateLabel', e.target.value)}
                      />
                    </div>
                    <div className="field-row day-actions-inline">
                      <label className="sr-only">Reorder</label>
                      <div className="stack-h">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => moveDay(idx, -1)}
                          disabled={idx === 0}
                          title="Move day up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => moveDay(idx, +1)}
                          disabled={idx === days.length - 1}
                          title="Move day down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => removeDay(idx)}
                          title="Remove day"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <DayPlanner
                  dayIndex={idx}
                  dateLabel={d.dateLabel}
                  activities={d.activities}
                  onChange={(acts) => updateDayActivities(idx, acts)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="builder-footer">
        <button className="btn-secondary" type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button className="btn-primary" type="button" onClick={onSave} disabled={!canSave}>
          Save Itinerary
        </button>
      </footer>
    </section>
  );
}

export default ItineraryBuilder;
