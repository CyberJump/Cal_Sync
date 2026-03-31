-- ============================================================
-- Procedure: ADD_EVENT
-- Creates an event and optionally a recurrence rule
-- ============================================================

CREATE OR REPLACE PROCEDURE add_event (
    p_calendar_id   IN  NUMBER,
    p_title         IN  VARCHAR2,
    p_description   IN  VARCHAR2,
    p_location      IN  VARCHAR2,
    p_start_time    IN  TIMESTAMP,
    p_end_time      IN  TIMESTAMP,
    p_is_all_day    IN  NUMBER,
    p_created_by    IN  NUMBER,
    p_frequency     IN  VARCHAR2 DEFAULT NULL,
    p_interval_val  IN  NUMBER   DEFAULT 1,
    p_rec_end_date  IN  TIMESTAMP DEFAULT NULL,
    p_days_of_week  IN  VARCHAR2 DEFAULT NULL,
    p_event_id      OUT NUMBER
)
AS
BEGIN
    -- Insert the event
    INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
    VALUES (p_calendar_id, p_title, p_description, p_location, p_start_time, p_end_time, p_is_all_day, 'active', p_created_by)
    RETURNING event_id INTO p_event_id;

    -- Add organizer as participant
    INSERT INTO event_participants (event_id, user_id, role, rsvp_status)
    VALUES (p_event_id, p_created_by, 'organizer', 'accepted');

    -- If recurrence info provided, create recurrence rule
    IF p_frequency IS NOT NULL THEN
        INSERT INTO recurrence_rules (event_id, frequency, interval_val, end_date, days_of_week)
        VALUES (p_event_id, p_frequency, p_interval_val, p_rec_end_date, p_days_of_week);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_event;
/
