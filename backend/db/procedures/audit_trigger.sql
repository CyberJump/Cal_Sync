-- ============================================================
-- Trigger: EVENT_AUDIT_TRIGGER
-- Fires after INSERT or UPDATE on EVENTS table
-- Logs changes to EVENT_AUDIT_LOG
-- ============================================================

CREATE OR REPLACE TRIGGER event_audit_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
DECLARE
    v_action VARCHAR2(10);
BEGIN
    IF INSERTING THEN
        v_action := 'INSERT';
        INSERT INTO event_audit_log (event_id, action, changed_by, old_values, new_values)
        VALUES (
            :NEW.event_id,
            v_action,
            :NEW.created_by,
            NULL,
            'title=' || :NEW.title || ', start=' || TO_CHAR(:NEW.start_time, 'YYYY-MM-DD HH24:MI') || ', status=' || :NEW.status
        );
    ELSIF UPDATING THEN
        v_action := 'UPDATE';
        INSERT INTO event_audit_log (event_id, action, changed_by, old_values, new_values)
        VALUES (
            :NEW.event_id,
            v_action,
            :NEW.created_by,
            'title=' || :OLD.title || ', start=' || TO_CHAR(:OLD.start_time, 'YYYY-MM-DD HH24:MI') || ', status=' || :OLD.status,
            'title=' || :NEW.title || ', start=' || TO_CHAR(:NEW.start_time, 'YYYY-MM-DD HH24:MI') || ', status=' || :NEW.status
        );
    END IF;
END;
/
