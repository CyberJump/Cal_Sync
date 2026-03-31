-- ============================================================
-- Calendar & Event Management System — Table Creation Script
-- Oracle Database
-- ============================================================

-- 1. USERS
CREATE TABLE users (
    user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR2(50)   NOT NULL,
    email         VARCHAR2(100)  NOT NULL UNIQUE,
    password_hash VARCHAR2(255)  NOT NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. CALENDARS
CREATE TABLE calendars (
    calendar_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       NUMBER         NOT NULL,
    calendar_name VARCHAR2(100)  NOT NULL,
    color_hex     VARCHAR2(7)    DEFAULT '#3478F6',
    is_default    NUMBER(1)      DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_cal_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_cal_default CHECK (is_default IN (0, 1))
);

-- 3. EVENTS
CREATE TABLE events (
    event_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calendar_id NUMBER         NOT NULL,
    title       VARCHAR2(200)  NOT NULL,
    description VARCHAR2(1000),
    location    VARCHAR2(200),
    start_time  TIMESTAMP      NOT NULL,
    end_time    TIMESTAMP      NOT NULL,
    is_all_day  NUMBER(1)      DEFAULT 0,
    status      VARCHAR2(20)   DEFAULT 'active',
    created_by  NUMBER         NOT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evt_cal FOREIGN KEY (calendar_id) REFERENCES calendars(calendar_id) ON DELETE CASCADE,
    CONSTRAINT fk_evt_user FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_evt_status CHECK (status IN ('active', 'cancelled')),
    CONSTRAINT chk_evt_allday CHECK (is_all_day IN (0, 1)),
    CONSTRAINT chk_evt_times CHECK (end_time >= start_time)
);

-- 4. EVENT_PARTICIPANTS
CREATE TABLE event_participants (
    participant_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id       NUMBER        NOT NULL,
    user_id        NUMBER        NOT NULL,
    role           VARCHAR2(20)  DEFAULT 'attendee',
    rsvp_status    VARCHAR2(20)  DEFAULT 'pending',
    invited_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ep_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_user  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_ep_role CHECK (role IN ('organizer', 'attendee')),
    CONSTRAINT chk_ep_rsvp CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
    CONSTRAINT uq_ep_event_user UNIQUE (event_id, user_id)
);

-- 5. RECURRENCE_RULES
CREATE TABLE recurrence_rules (
    recurrence_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id      NUMBER        NOT NULL,
    frequency     VARCHAR2(20)  NOT NULL,
    interval_val  NUMBER        DEFAULT 1,
    end_date      TIMESTAMP,
    days_of_week  VARCHAR2(50),
    CONSTRAINT fk_rr_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT chk_rr_freq CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    CONSTRAINT chk_rr_interval CHECK (interval_val > 0)
);

-- 6. NOTIFICATIONS
CREATE TABLE notifications (
    notification_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER         NOT NULL,
    event_id        NUMBER,
    message         VARCHAR2(500)  NOT NULL,
    is_read         NUMBER(1)      DEFAULT 0,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notif_user  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL,
    CONSTRAINT chk_notif_read CHECK (is_read IN (0, 1))
);

-- 7. EVENT_AUDIT_LOG
CREATE TABLE event_audit_log (
    audit_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id    NUMBER         NOT NULL,
    action      VARCHAR2(10)   NOT NULL,
    changed_by  NUMBER,
    changed_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    old_values  VARCHAR2(2000),
    new_values  VARCHAR2(2000),
    CONSTRAINT chk_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);
