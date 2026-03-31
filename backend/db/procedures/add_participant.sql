-- ============================================================
-- Procedure: ADD_PARTICIPANT
-- Adds a participant to an event and creates a notification
-- ============================================================

CREATE OR REPLACE PROCEDURE add_participant (
    p_event_id      IN  NUMBER,
    p_user_id       IN  NUMBER,
    p_role          IN  VARCHAR2 DEFAULT 'attendee',
    p_participant_id OUT NUMBER
)
AS
    v_event_title VARCHAR2(200);
    v_count       NUMBER;
BEGIN
    -- Check if user is already a participant
    SELECT COUNT(*) INTO v_count
    FROM event_participants
    WHERE event_id = p_event_id AND user_id = p_user_id;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'User is already a participant of this event');
    END IF;

    -- Get event title for notification message
    SELECT title INTO v_event_title
    FROM events
    WHERE event_id = p_event_id;

    -- Insert participant
    INSERT INTO event_participants (event_id, user_id, role, rsvp_status)
    VALUES (p_event_id, p_user_id, p_role, 'pending')
    RETURNING participant_id INTO p_participant_id;

    -- Create notification for the invited user
    INSERT INTO notifications (user_id, event_id, message, is_read)
    VALUES (p_user_id, p_event_id, 'You have been invited to ' || v_event_title, 0);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_participant;
/
