import React, { useEffect, useMemo, useState } from 'react';
import ReminderForm from './ReminderForm';
import { ReminderService } from '../../services/ReminderService';

/**
 * PUBLIC_INTERFACE
 * RemindersPanel
 * Displays a list of reminders and provides UI to add/edit/delete reminders.
 * Includes a modal-like inline panel with ReminderForm.
 */
function RemindersPanel({ open = false, onClose }) {
  const [reminders, setReminders] = useState([]);
  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);

  const refresh = () => setReminders(ReminderService.list());

  useEffect(() => {
    refresh();
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return reminders
      .filter((r) => Date.parse(r.datetimeISO || 0) >= now)
      .slice(0, 100);
  }, [reminders]);

  const past = useMemo(() => {
    const now = Date.now();
    return reminders
      .filter((r) => Date.parse(r.datetimeISO || 0) < now)
      .slice(0, 100);
  }, [reminders]);

  const startCreate = (prefill = null) => {
    setEditing(prefill);
    setMode('create');
  };

  const startEdit = (rem) => {
    setEditing(rem);
    setMode('edit');
  };

  const closeForm = () => {
    setEditing(null);
    setMode(null);
  };

  const onSubmit = (payload) => {
    const id = ReminderService.save(payload);
    // TODO: await ReminderService.syncToBackend(payload)
    refresh();
    closeForm();
    return id;
  };

  const deleteReminder = (id) => {
    ReminderService.remove(id);
    refresh();
  };

  const askPermission = async () => {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <aside
      className="reminders-panel"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        top: 80,
        width: 'min(420px, 92vw)',
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        boxShadow: 'var(--shadow)',
        padding: 16,
        overflow: 'auto',
        zIndex: 40,
      }}
      aria-label="Reminders panel"
    >
      <div
        className="panel-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
      >
        <div>
          <h3 className="trips-title" style={{ margin: 0 }}>Reminders</h3>
          <p className="trips-subtitle" style={{ margin: 0 }}>
            Manage alerts for flights, check-ins, and activities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={askPermission} title="Enable system notifications">
            Enable Notifications
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} title="Close panel">Close</button>
        </div>
      </div>

      <div className="panel-actions" style={{ marginBottom: 12 }}>
        <button type="button" className="btn-primary" onClick={() => startCreate()}>
          + Add Reminder
        </button>
      </div>

      {mode ? (
        <div className="builder-form" style={{ marginBottom: 16 }}>
          <ReminderForm initial={editing} onCancel={closeForm} onSubmit={onSubmit} />
        </div>
      ) : null}

      <section className="upcoming" style={{ marginBottom: 16 }}>
        <h4 className="day-title" style={{ marginBottom: 8 }}>Upcoming</h4>
        {upcoming.length === 0 ? (
          <div className="trips-empty">No upcoming reminders.</div>
        ) : (
          <ul className="days-list">
            {upcoming.map((r) => {
              const when = r.datetimeISO ? new Date(r.datetimeISO).toLocaleString() : '—';
              return (
                <li key={r.id} className="activity-item">
                  <div className="activity-main">
                    <div className="activity-times">
                      <span className="time-badge">{when}</span>
                    </div>
                    <div className="activity-info">
                      <div className="activity-title">
                        [{r.type}] {r.title}
                      </div>
                      <div className="activity-sub">
                        Notify {r.offsetMinutes ?? 0} min before
                        {r.notes ? <span> • {r.notes}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button
                      type="button"
                      className="btn-secondary small"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary small"
                      onClick={() => deleteReminder(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="past">
        <h4 className="day-title" style={{ marginBottom: 8 }}>Past</h4>
        {pastsEmpty(past) ? (
          <div className="trips-empty">No past reminders.</div>
        ) : (
          <ul className="days-list">
            {past.map((r) => {
              const when = r.datetimeISO ? new Date(r.datetimeISO).toLocaleString() : '—';
              return (
                <li key={r.id} className="activity-item">
                  <div className="activity-main">
                    <div className="activity-times">
                      <span className="time-badge muted">{when}</span>
                    </div>
                    <div className="activity-info">
                      <div className="activity-title">
                        [{r.type}] {r.title}
                      </div>
                      <div className="activity-sub">
                        {r.notes || 'Occurred'}
                      </div>
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button
                      type="button"
                      className="btn-secondary small"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary small"
                      onClick={() => deleteReminder(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* TODO: Wire to backend GET/POST /reminders when available */}
    </aside>
  );
}

function pastsEmpty(arr) {
  return !arr || arr.length === 0;
}

export default RemindersPanel;
