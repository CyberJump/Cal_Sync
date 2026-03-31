-- ============================================================
-- Seed Data for Demo
-- Passwords are bcrypt hashes of 'password123'
-- ============================================================

-- Users
INSERT INTO users (username, email, password_hash) VALUES ('Alice Johnson', 'alice@example.com', '$2b$10$ZPOlJfabbBZmQviO.kCiOONYKLQ2fdfg33zxj.lUTxWQUBj2vafde');
INSERT INTO users (username, email, password_hash) VALUES ('Bob Smith', 'bob@example.com', '$2b$10$ZPOlJfabbBZmQviO.kCiOONYKLQ2fdfg33zxj.lUTxWQUBj2vafde');
INSERT INTO users (username, email, password_hash) VALUES ('Charlie Brown', 'charlie@example.com', '$2b$10$ZPOlJfabbBZmQviO.kCiOONYKLQ2fdfg33zxj.lUTxWQUBj2vafde');

-- Calendars
INSERT INTO calendars (user_id, calendar_name, color_hex, is_default) VALUES (1, 'Personal', '#3478F6', 1);
INSERT INTO calendars (user_id, calendar_name, color_hex, is_default) VALUES (1, 'Work', '#FF3B30', 0);
INSERT INTO calendars (user_id, calendar_name, color_hex, is_default) VALUES (2, 'My Calendar', '#34C759', 1);
INSERT INTO calendars (user_id, calendar_name, color_hex, is_default) VALUES (3, 'My Calendar', '#FF9500', 1);

-- Events (using SYSTIMESTAMP-relative dates for demo)
INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
VALUES (1, 'Team Standup', 'Daily standup meeting', 'Zoom', SYSTIMESTAMP + INTERVAL '1' DAY + INTERVAL '9' HOUR, SYSTIMESTAMP + INTERVAL '1' DAY + INTERVAL '9' HOUR + INTERVAL '30' MINUTE, 0, 'active', 1);

INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
VALUES (2, 'Project Review', 'Quarterly project review', 'Conference Room A', SYSTIMESTAMP + INTERVAL '2' DAY + INTERVAL '14' HOUR, SYSTIMESTAMP + INTERVAL '2' DAY + INTERVAL '15' HOUR, 0, 'active', 1);

INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
VALUES (1, 'Birthday Party', 'Alices birthday celebration', 'Home', SYSTIMESTAMP + INTERVAL '5' DAY, SYSTIMESTAMP + INTERVAL '5' DAY + INTERVAL '23' HOUR + INTERVAL '59' MINUTE, 1, 'active', 1);

INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
VALUES (3, 'Gym Session', 'Weekly gym workout', 'Fitness Center', SYSTIMESTAMP + INTERVAL '1' DAY + INTERVAL '17' HOUR, SYSTIMESTAMP + INTERVAL '1' DAY + INTERVAL '18' HOUR, 0, 'active', 2);

INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
VALUES (4, 'Study Group', 'DBMS study session', 'Library', SYSTIMESTAMP + INTERVAL '3' DAY + INTERVAL '10' HOUR, SYSTIMESTAMP + INTERVAL '3' DAY + INTERVAL '12' HOUR, 0, 'active', 3);

-- Event Participants
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (1, 1, 'organizer', 'accepted');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (1, 2, 'attendee', 'accepted');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (1, 3, 'attendee', 'pending');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (2, 1, 'organizer', 'accepted');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (2, 2, 'attendee', 'declined');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (5, 3, 'organizer', 'accepted');
INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (5, 1, 'attendee', 'pending');

-- Recurrence Rules
INSERT INTO recurrence_rules (event_id, frequency, interval_val, end_date, days_of_week) VALUES (1, 'daily', 1, SYSTIMESTAMP + INTERVAL '30' DAY, 'MON,TUE,WED,THU,FRI');
INSERT INTO recurrence_rules (event_id, frequency, interval_val, end_date, days_of_week) VALUES (4, 'weekly', 1, SYSTIMESTAMP + INTERVAL '90' DAY, 'MON,WED,FRI');

-- Notifications
INSERT INTO notifications (user_id, event_id, message, is_read) VALUES (2, 1, 'You have been invited to Team Standup', 0);
INSERT INTO notifications (user_id, event_id, message, is_read) VALUES (3, 1, 'You have been invited to Team Standup', 0);
INSERT INTO notifications (user_id, event_id, message, is_read) VALUES (2, 2, 'You have been invited to Project Review', 1);
INSERT INTO notifications (user_id, event_id, message, is_read) VALUES (1, 5, 'You have been invited to Study Group', 0);

COMMIT;
