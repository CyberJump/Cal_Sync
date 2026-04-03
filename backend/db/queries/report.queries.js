// Report-related SQL queries

const EVENT_COUNT_PER_CALENDAR = `
  SELECT c.calendar_id, c.calendar_name, c.color_hex,
         COUNT(e.event_id) AS event_count
  FROM calendars c
  LEFT JOIN events e ON e.calendar_id = c.calendar_id AND e.status = 'active'
  WHERE c.user_id = :userId
  GROUP BY c.calendar_id, c.calendar_name, c.color_hex
  ORDER BY event_count DESC
`;

const UPCOMING_EVENTS_7_DAYS = `
  SELECT e.event_id, e.title, e.start_time, e.end_time,
         e.is_all_day, c.calendar_name, c.color_hex
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE c.user_id = :userId
    AND e.status = 'active'
    AND e.start_time BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7' DAY
  ORDER BY e.start_time
`;

const USERS_WITH_NO_EVENTS = `
  SELECT u.user_id, u.username, u.email
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1
    FROM calendars c
    JOIN events e ON e.calendar_id = c.calendar_id
    WHERE c.user_id = u.user_id
  )
`;

const PARTICIPANT_COUNT_PER_EVENT = `
  SELECT e.event_id, e.title,
         COUNT(ep.participant_id) AS participant_count
  FROM events e
  JOIN event_participants ep ON ep.event_id = e.event_id
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE c.user_id = :userId AND e.status = 'active'
  GROUP BY e.event_id, e.title
  HAVING COUNT(ep.participant_id) > 1
  ORDER BY participant_count DESC
`;

const RECURRING_EVENTS_ONLY = `
  SELECT e.event_id, e.title, e.start_time, e.end_time,
         r.frequency, r.interval_val, r.end_date AS rec_end_date,
         c.calendar_name, c.color_hex
  FROM events e
  JOIN recurrence_rules r ON r.event_id = e.event_id
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE c.user_id = :userId AND e.status = 'active'
  ORDER BY e.start_time
`;

const EVENT_SUMMARY = `
  SELECT event_id, event_title, description, location,
         start_time, end_time, is_all_day, status,
         calendar_name, color_hex,
         creator_name, creator_email,
         participant_count, created_at
  FROM event_summary_view
  WHERE creator_id = :userId
  ORDER BY start_time
`;

// Notification queries
const GET_USER_NOTIFICATIONS = `
  SELECT n.notification_id, n.event_id, n.message, n.is_read, n.created_at,
         e.title AS event_title,
         ep.rsvp_status
  FROM notifications n
  LEFT JOIN events e ON e.event_id = n.event_id
  LEFT JOIN event_participants ep ON ep.event_id = n.event_id AND ep.user_id = n.user_id
  WHERE n.user_id = :userId
  ORDER BY n.created_at DESC
  FETCH FIRST 50 ROWS ONLY
`;

const MARK_NOTIFICATION_READ = `
  UPDATE notifications
  SET is_read = 1
  WHERE notification_id = :notificationId AND user_id = :userId
`;

const MARK_ALL_NOTIFICATIONS_READ = `
  UPDATE notifications
  SET is_read = 1
  WHERE user_id = :userId AND is_read = 0
`;

const GET_UNREAD_COUNT = `
  SELECT COUNT(*) AS unread_count
  FROM notifications
  WHERE user_id = :userId AND is_read = 0
`;

module.exports = {
  EVENT_COUNT_PER_CALENDAR,
  UPCOMING_EVENTS_7_DAYS,
  USERS_WITH_NO_EVENTS,
  PARTICIPANT_COUNT_PER_EVENT,
  RECURRING_EVENTS_ONLY,
  EVENT_SUMMARY,
  GET_USER_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  GET_UNREAD_COUNT,
};
