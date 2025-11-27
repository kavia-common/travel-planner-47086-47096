//
// ReminderService: lightweight client-side reminder storage and dispatcher
// - Persists reminders to localStorage under 'reminders'
// - setInterval tick checks for due reminders and dispatches toast events
// - Emits notifications via browser Notification API when permitted
//
// Data shape:
// { id, type: 'flight'|'checkin'|'activity'|'custom', title, datetimeISO, offsetMinutes, notes, relatedIds?: {tripId?, itineraryId?, activityId?} }
//

const STORAGE_KEY = 'reminders';
const LAST_NOTIFIED_KEY = 'reminders_last_notified_ids'; // to avoid duplicate notifications across reloads

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = JSON.parse(raw || '[]');
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function writeStore(reminders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    // ignore write errors
  }
}

function readNotifiedIds() {
  try {
    const raw = localStorage.getItem(LAST_NOTIFIED_KEY);
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeNotifiedIds(ids) {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function ensureNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('unsupported');
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  try {
    return Notification.requestPermission();
  } catch {
    return Promise.resolve('unsupported');
  }
}

// PUBLIC_INTERFACE
export const ReminderService = (() => {
  /** Listeners receive { id, title, displayTime, type, notes } */
  const listeners = new Set();

  let tickHandle = null;
  const TICK_MS = 30 * 1000; // check every 30s

  function start() {
    if (tickHandle) return;
    tickHandle = setInterval(tick, TICK_MS);
    // run once immediately on start
    setTimeout(tick, 100);
  }

  function stop() {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
  }

  function tick() {
    const now = Date.now();
    const reminders = readStore();
    const notifiedIds = new Set(readNotifiedIds());

    const due = reminders.filter((r) => {
      if (!r?.datetimeISO) return false;
      const dt = Date.parse(r.datetimeISO);
      if (Number.isNaN(dt)) return false;
      const offsetMs = (Number(r.offsetMinutes) || 0) * 60 * 1000;
      const triggerAt = dt - offsetMs;
      return now >= triggerAt;
    });

    const newNotifiedIds = new Set(notifiedIds);
    due.forEach((r) => {
      if (newNotifiedIds.has(r.id)) return;
      newNotifiedIds.add(r.id);

      const displayTime = new Date(r.datetimeISO).toLocaleString();
      // notify subscribers -> used by Toasts
      listeners.forEach((cb) => {
        try {
          cb({
            id: r.id,
            title: r.title,
            type: r.type,
            notes: r.notes,
            displayTime,
          });
        } catch {
          // listener error isolated
        }
      });

      // Optional Notification API
      ensureNotificationPermission().then((perm) => {
        if (perm === 'granted' && 'Notification' in window) {
          try {
            const subtitle =
              r.type === 'flight'
                ? 'Flight reminder'
                : r.type === 'checkin'
                ? 'Check-in reminder'
                : r.type === 'activity'
                ? 'Activity reminder'
                : 'Travel reminder';
            const body = `${r.title} • ${displayTime}${
              r.offsetMinutes ? ` (reminded ${r.offsetMinutes} min early)` : ''
            }`;
            // eslint-disable-next-line no-new
            new Notification(subtitle, {
              body,
            });
          } catch {
            // ignore
          }
        }
      });
    });

    // persist updated notified ids list
    writeNotifiedIds(Array.from(newNotifiedIds));
  }

  // CRUD
  // PUBLIC_INTERFACE
  function list() {
    return readStore()
      .slice()
      .sort((a, b) => {
        const da = Date.parse(a.datetimeISO || 0);
        const db = Date.parse(b.datetimeISO || 0);
        return da - db;
      });
  }

  // PUBLIC_INTERFACE
  function get(id) {
    return readStore().find((r) => r.id === id) || null;
  }

  // PUBLIC_INTERFACE
  function save(reminder) {
    const current = readStore();
    if (reminder.id) {
      const idx = current.findIndex((r) => r.id === reminder.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...reminder };
      } else {
        current.push({ ...reminder, id: reminder.id });
      }
    } else {
      current.unshift({ ...reminder, id: crypto.randomUUID() });
    }
    writeStore(current);
    return reminder.id || current[0].id;
  }

  // PUBLIC_INTERFACE
  function remove(id) {
    const current = readStore();
    const next = current.filter((r) => r.id !== id);
    writeStore(next);

    // also remove from notified ids so it can be re-added later without stale state
    const notified = readNotifiedIds().filter((nid) => nid !== id);
    writeNotifiedIds(notified);
  }

  // PUBLIC_INTERFACE
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // PUBLIC_INTERFACE
  async function syncFromBackend() {
    // TODO: GET /reminders and merge into localStorage
    // Keep local-only for now until auth & backend endpoints exist.
    return [];
  }

  // PUBLIC_INTERFACE
  async function syncToBackend(reminder) {
    // TODO: POST/PUT /reminders
    return reminder;
  }

  // auto-start
  start();

  return {
    start,
    stop,
    list,
    get,
    save,
    remove,
    subscribe,
    syncFromBackend,
    syncToBackend,
  };
})();
