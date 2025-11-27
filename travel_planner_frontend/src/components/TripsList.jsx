import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * TripsList
 * A simple list view of trips. Attempts to fetch from /api/trips if available; otherwise
 * falls back to static demo data. Styled using the project's Ocean Professional theme.
 */
function TripsList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState(null);

  // Attempt to load from backend, fallback to static data on error or non-200
  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/trips', { headers: { Accept: 'application/json' } });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (!cancelled) {
          setTrips(Array.isArray(data) ? data : []);
          setFromApi(true);
        }
      } catch (e) {
        // Fallback to static demo data
        if (!cancelled) {
          setTrips([
            {
              id: 1,
              title: 'Summer in Santorini',
              description: 'Whitewashed villages, blue domes, and sunsets.',
              start_date: '2025-07-10',
              end_date: '2025-07-18',
            },
            {
              id: 2,
              title: 'Tokyo Food Adventure',
              description: 'Sushi, ramen, markets, and neon nights.',
              start_date: '2025-09-02',
              end_date: '2025-09-12',
            },
            {
              id: 3,
              title: 'Patagonia Trek',
              description: 'Lakes, glaciers, and mountain trails.',
              start_date: '2026-01-15',
              end_date: '2026-01-30',
            },
          ]);
          setFromApi(false);
          setError(e.message || 'Failed to load from API');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="trips-heading" className="trips-section">
      <div className="trips-header">
        <h2 id="trips-heading" className="trips-title">
          Trips
        </h2>
        <p className="trips-subtitle">
          {fromApi ? 'Loaded from API' : 'Sample data'}
          {!fromApi && error ? ` • API unavailable (${error})` : ''}
        </p>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="trips-loading">
          Loading trips…
        </div>
      ) : trips.length === 0 ? (
        <div className="trips-empty" role="note">
          No trips yet. Start by creating your first itinerary.
        </div>
      ) : (
        <ul className="trips-list" aria-label="Trips list">
          {trips.map((trip) => (
            <li key={trip.id ?? trip.title} className="trip-card">
              <div className="trip-card-header">
                <h3 className="trip-title">{trip.title}</h3>
                {(trip.start_date || trip.end_date) && (
                  <span className="trip-dates">
                    {trip.start_date || 'TBD'} – {trip.end_date || 'TBD'}
                  </span>
                )}
              </div>
              {trip.description && <p className="trip-desc">{trip.description}</p>}
              <div className="trip-actions">
                <button className="btn-primary" type="button" title="View details">
                  View
                </button>
                <button className="btn-secondary" type="button" title="Edit trip">
                  Edit
                </button>
                <a
                  className="btn-secondary"
                  href={`/trips/${trip.id ?? 1}/itinerary/new`}
                  title="Create itinerary"
                >
                  + Itinerary
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* TODO: Wire "Add Trip" to backend POST /api/trips once auth and forms are ready */}
      <div className="trips-cta">
        <button className="btn-accent" type="button" title="Add a new trip">
          + Add Trip
        </button>
      </div>
    </section>
  );
}

export default TripsList;
