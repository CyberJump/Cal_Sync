-- ============================================================
-- Function: COUNT_USER_EVENTS
-- Returns total event count across all calendars for a user
-- ============================================================

CREATE OR REPLACE FUNCTION count_user_events (
    p_user_id IN NUMBER
) RETURN NUMBER
AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(e.event_id) INTO v_count
    FROM events e
    JOIN calendars c ON c.calendar_id = e.calendar_id
    WHERE c.user_id = p_user_id
      AND e.status = 'active';

    RETURN v_count;
END count_user_events;
/
