import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ActivityForm
 * A small controlled form to add or edit an activity item.
 * Fields: title, place, startTime, endTime, notes
 */
function ActivityForm({ initial = null, onCancel, onSubmit }) {
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setPlace(initial.place || '');
      setStartTime(initial.startTime || '');
      setEndTime(initial.endTime || '');
      setNotes(initial.notes || '');
    }
  }, [initial]);

  const valid = title.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const payload = {
      id: initial?.id ?? undefined,
      title: title.trim(),
      place: place.trim() || null,
      startTime: startTime || null,
      endTime: endTime || null,
      notes: notes.trim() || null,
    };
    onSubmit?.(payload);
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label htmlFor="act-title">Title</label>
        <input
          id="act-title"
          type="text"
          placeholder="e.g., Museum visit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid-2">
        <div className="field-row">
          <label htmlFor="act-place">Place</label>
          <input
            id="act-place"
            type="text"
            placeholder="e.g., Louvre"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="act-start">Start</label>
          <input
            id="act-start"
            type="time"
            value={startTime || ''}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="act-end">End</label>
          <input
            id="act-end"
            type="time"
            value={endTime || ''}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <label htmlFor="act-notes">Notes</label>
        <textarea
          id="act-notes"
          placeholder="Optional details or links…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!valid}>
          {initial ? 'Update' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
}

export default ActivityForm;
