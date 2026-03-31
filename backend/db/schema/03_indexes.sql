-- ============================================================
-- Indexes for performance
-- ============================================================

-- Speed up calendar lookups by user
CREATE INDEX idx_cal_user ON calendars(user_id);

-- Speed up event lookups by calendar and date range
CREATE INDEX idx_evt_calendar ON events(calendar_id);
CREATE INDEX idx_evt_start    ON events(start_time);
CREATE INDEX idx_evt_created  ON events(created_by);

-- Speed up participant lookups
CREATE INDEX idx_ep_event ON event_participants(event_id);
CREATE INDEX idx_ep_user  ON event_participants(user_id);

-- Speed up recurrence lookups
CREATE INDEX idx_rr_event ON recurrence_rules(event_id);

-- Speed up notification lookups
CREATE INDEX idx_notif_user   ON notifications(user_id);
CREATE INDEX idx_notif_read   ON notifications(user_id, is_read);

-- Audit log lookups
CREATE INDEX idx_audit_event ON event_audit_log(event_id);
