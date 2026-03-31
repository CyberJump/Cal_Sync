-- ============================================================
-- Additional Constraints (beyond those in 01_create_tables.sql)
-- ============================================================

-- All primary keys, foreign keys, check constraints, and unique
-- constraints are defined inline in 01_create_tables.sql.
-- This file adds any supplementary constraints if needed.

-- Ensure username is not empty
ALTER TABLE users ADD CONSTRAINT chk_user_name_notempty CHECK (LENGTH(TRIM(username)) > 0);

-- Ensure email has basic format (contains @)
ALTER TABLE users ADD CONSTRAINT chk_user_email_format CHECK (email LIKE '%@%.%');

-- Ensure calendar name is not empty
ALTER TABLE calendars ADD CONSTRAINT chk_cal_name_notempty CHECK (LENGTH(TRIM(calendar_name)) > 0);

-- Ensure event title is not empty
ALTER TABLE events ADD CONSTRAINT chk_evt_title_notempty CHECK (LENGTH(TRIM(title)) > 0);

-- Ensure notification message is not empty
ALTER TABLE notifications ADD CONSTRAINT chk_notif_msg_notempty CHECK (LENGTH(TRIM(message)) > 0);
