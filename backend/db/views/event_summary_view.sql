-- ============================================================
-- View: EVENT_SUMMARY_VIEW
-- Joins events, calendars, users and counts participants
-- ============================================================

CREATE OR REPLACE VIEW event_summary_view AS
SELECT
    e.event_id,
    e.title AS event_title,
    e.description,
    e.location,
    e.start_time,
    e.end_time,
    e.is_all_day,
    e.status,
    c.calendar_id,
    c.calendar_name,
    c.color_hex,
    u.user_id AS creator_id,
    u.username AS creator_name,
    u.email AS creator_email,
    (
        SELECT COUNT(*)
        FROM event_participants ep
        WHERE ep.event_id = e.event_id
    ) AS participant_count,
    e.created_at,
    e.updated_at
FROM events e
JOIN calendars c ON c.calendar_id = e.calendar_id
JOIN users u ON u.user_id = e.created_by
ORDER BY e.start_time;
