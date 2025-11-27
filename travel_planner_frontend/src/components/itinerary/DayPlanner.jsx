import React, { useMemo, useState } from 'react';
import ActivityForm from './ActivityForm';
import { ReminderService } from '../../services/ReminderService';

/**
 * PUBLIC_INTERFACE
 * DayPlanner
 * Renders and manages a single day within the itinerary, with a list of activities:
 * - Add a new activity (opens ActivityForm inline)
 * - Edit an existing activity
 * - Remove activity
 * - Reorder activities (move up/down)
 * - Quick add reminder from an activity (prefill title and time)
 */
function DayPlanner({ dayIndex, dateLabel, activities, onChange }) {
  const [mode, setMode] = useState(null); // 'add' | 'edit'
  const [editing, setEditing] = useState(null); // activity object being edited

  const title = useMemo(() => dateLabel || `Day ${dayIndex + 1}`, [dayIndex, dateLabel]);

  const closeForm = () => {
    setMode(null);
    setEditing(null);
  };

  const handleAdd = (activity) => {
    const newItem = { ...activity, id: crypto.randomUUID(), order: activities.length };
    onChange?.([...activities, newItem]);
    closeForm();
  };

  const handleUpdate = (activity) => {
    const updated = activities.map((a) => (a.id === activity.id ? { ...a, ...activity } : a));
    onChange?.(updated);
    closeForm();
  };

  const handleRemove = (id) => {
    const filtered = activities.filter((a) => a.id !== id).map((a, idx) => ({ ...a, order: idx }));
    onChange?.(filtered);
  };

  const move = (index, dir) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= activities.length) return;
    const copy = [...activities];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    // fix order
    const reordered = copy.map((a, idx) => ({ ...a, order: idx }));
    onChange?.(reordered);
  };

  const addReminderForActivity = (a) => {
    // Build datetime from today's date with activity.startTime if available
    if (!a?.title) return;
    const now = new Date();
    let dtISO = null;
    if (a.startTime) {
      const yyyy = String(now.getFullYear()).padStart(4, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const time = a.startTime.length === 5 ? `${a.startTime}:00` : a.startTime;
      const local = new Date(`${yyyy}-${mm}-${dd}T${time}`);
      if (!Number.isNaN(local.getTime())) {
        dtISO = local.toISOString();
      }
    }
    // If no time, set 2 hours from now as a sensible default
    if (!dtISO) {
      const def = new Date(Date.now() + 2 * 60 * 60 * 1000);
      dtISO = def.toISOString();
    }

    const payload = {
      type: 'activity',
      title: a.title,
      datetimeISO: dtISO,
      offsetMinutes: 15,
      notes: a.notes || '',
      relatedIds: { activityId: a.id },
    };
    ReminderService.save(payload);
    // Optionally inform user via a transient alert toast triggered by service tick soon
    // No navigation; stay inline
    alert('Reminder added for activity. You will be notified before it starts.');
  };

  return (
    <div className="day-planner">
      <div className="day-header">
        <h4 className="day-title">{title}</h4>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setMode('add')}
          aria-label="Add activity"
        >
          + Add activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="empty-day">No activities yet. Add your first plan for this day.</div>
      ) : (
        <ol className="activities-list">
          {activities
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((a, idx) => (
              <li key={a.id} className="activity-item">
                <div className="activity-main">
                  <div className="activity-times">
                    {(a.startTime || a.endTime) ? (
                      <span className="time-badge">
                        {a.startTime || '—'} - {a.endTime || '—'}
                      </span>
                    ) : (
                      <span className="time-badge muted">Time TBD</span>
                    )}
                  </div>
                  <div className="activity-info">
                    <div className="activity-title">{a.title}</div>
                    {(a.place || a.notes) && (
                      <div className="activity-sub">
                        {a.place ? <span className="pill">{a.place}</span> : null}
                        {a.notes ? <span className="muted"> • {a.notes}</span> : null}
                      </div>
                    )}
                  </div>
                </div>
                <div className="activity-actions">
                  <button
                    type="button"
                    title="Move up"
                    className="btn-secondary small"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    className="btn-secondary small"
                    onClick={() => move(idx, +1)}
                    disabled={idx === activities.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditing(a);
                      setMode('edit');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleRemove(a.id)}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    title="Add reminder"
                    onClick={() => addReminderForActivity(a)}
                  >
                    🔔 Reminder
                  </button>
                </div>
              </li>
            ))}
        </ol>
      )}

      {mode === 'add' && (
        <div className="activity-form-wrap">
          <ActivityForm onCancel={closeForm} onSubmit={handleAdd} />
        </div>
      )}
      {mode === 'edit' && editing && (
        <div className="activity-form-wrap">
          <ActivityForm initial={editing} onCancel={closeForm} onSubmit={handleUpdate} />
        </div>
      )}
    </div>
  );
}

export default DayPlanner;
