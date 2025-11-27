import React, { useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ReminderForm
 * A controlled form to create/edit reminders.
 * Fields:
 * - type: 'flight' | 'checkin' | 'activity' | 'custom'
 * - title: string
 * - date: YYYY-MM-DD
 * - time: HH:mm
 * - offsetMinutes: number (minutes before)
 * - notes: string (optional)
 */
function ReminderForm({ initial = null, onCancel, onSubmit }) {
  const [type, setType] = useState('activity');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // local date
  const [time, setTime] = useState(''); // local time
  const [offsetMinutes, setOffsetMinutes] = useState(15);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setType(initial.type || 'activity');
      setTitle(initial.title || '');
      if (initial.datetimeISO) {
        const d = new Date(initial.datetimeISO);
        const yyyy = String(d.getFullYear()).padStart(4, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        setTime(`${hh}:${min}`);
      }
      setOffsetMinutes(
        Number.isFinite(Number(initial.offsetMinutes))
          ? Number(initial.offsetMinutes)
          : 15
      );
      setNotes(initial.notes || '');
    }
  }, [initial]);

  const datetimeISO = useMemo(() => {
    if (!date || !time) return null;
    const dt = new Date(`${date}T${time}`);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString();
  }, [date, time]);

  const valid = useMemo(() => {
    const requiredOk =
      title.trim().length > 0 && date.trim().length > 0 && time.trim().length > 0;
    if (!requiredOk || !datetimeISO) return false;
    // future time validation
    const eventTs = Date.parse(datetimeISO);
    return eventTs > Date.now();
  }, [title, date, time, datetimeISO]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const payload = {
      id: initial?.id ?? undefined,
      type,
      title: title.trim(),
      datetimeISO,
      offsetMinutes: Number(offsetMinutes) || 0,
      notes: notes.trim() || '',
      relatedIds: initial?.relatedIds || undefined,
    };
    onSubmit?.(payload);
  };

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <div className="grid-2">
        <div className="field-row">
          <label htmlFor="rem-type">Type</label>
          <select
            id="rem-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="flight">Flight</option>
            <option value="checkin">Check-in</option>
            <option value="activity">Activity</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="rem-title">Title</label>
          <input
            id="rem-title"
            type="text"
            placeholder="e.g., Flight to SFO"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field-row">
          <label htmlFor="rem-date">Date</label>
          <input
            id="rem-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field-row">
          <label htmlFor="rem-time">Time</label>
          <input
            id="rem-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field-row">
          <label htmlFor="rem-offset">Notify before (minutes)</label>
          <input
            id="rem-offset"
            type="number"
            min="0"
            step="5"
            value={offsetMinutes}
            onChange={(e) => setOffsetMinutes(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="rem-notes">Notes</label>
          <input
            id="rem-notes"
            type="text"
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!valid}>
          {initial ? 'Update Reminder' : 'Add Reminder'}
        </button>
      </div>
    </form>
  );
}

export default ReminderForm;
