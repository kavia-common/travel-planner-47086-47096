# Reminders Backend Wiring (TODO)

The frontend implements a local-only Reminders system with:
- localStorage persistence under key "reminders"
- periodic check (every 30s) in ReminderService
- in-app toasts
- optional Notification API if permission is granted

Data shape:
{
  id: string,
  type: "flight" | "checkin" | "activity" | "custom",
  title: string,
  datetimeISO: string,
  offsetMinutes: number,
  notes?: string,
  relatedIds?: { tripId?: string, itineraryId?: string, activityId?: string }
}

TODO to wire with backend when API is available:
1) GET /reminders
   - Merge server data into localStorage (prefer newest "updated_at" if provided).
   - Implement ReminderService.syncFromBackend to fetch and merge.

2) POST /reminders and PUT/PATCH /reminders/{id}
   - Update ReminderService.save to upsert via backend.
   - Consider optimistic UI with retry and conflict handling.

3) DELETE /reminders/{id}
   - Update ReminderService.remove to call backend before local deletion (or vice versa).

4) Authentication
   - Only sync when user is authenticated; otherwise keep local-only.

Note: Keep Notification API prompts user-driven in UI (RemindersPanel -> "Enable Notifications") to avoid automatic permission prompts on load.
