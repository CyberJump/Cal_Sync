// Event-related SQL queries

const GET_EVENTS_BY_DATE_RANGE = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         e.created_by, e.created_at, e.updated_at,
         c.calendar_id, c.calendar_name, c.color_hex,
         0 AS is_shared
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE c.user_id = :userId
    AND e.status = 'active'
    AND e.start_time < :endDate
    AND e.end_time > :startDate

  UNION ALL

  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         e.created_by, e.created_at, e.updated_at,
         c.calendar_id, c.calendar_name, c.color_hex,
         1 AS is_shared
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  JOIN event_participants ep ON ep.event_id = e.event_id
  WHERE ep.user_id = :userId
    AND ep.rsvp_status = 'accepted'
    AND e.status = 'active'
    AND c.user_id != :userId
    AND e.start_time < :endDate
    AND e.end_time > :startDate
  
  ORDER BY 5
`;

const GET_EVENT_BY_ID = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         e.created_by, e.created_at, e.updated_at,
         c.calendar_id, c.calendar_name, c.color_hex
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE e.event_id = :eventId
`;

const GET_EVENT_WITH_RECURRENCE = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         e.created_by, e.created_at, e.updated_at,
         c.calendar_id, c.calendar_name, c.color_hex,
         r.recurrence_id, r.frequency, r.interval_val, r.end_date AS rec_end_date, r.days_of_week
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  LEFT JOIN recurrence_rules r ON r.event_id = e.event_id
  WHERE e.event_id = :eventId
`;

const GET_RECURRING_EVENTS_FOR_USER = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         e.created_by,
         c.calendar_id, c.calendar_name, c.color_hex,
         r.recurrence_id, r.frequency, r.interval_val, r.end_date AS rec_end_date, r.days_of_week
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  JOIN recurrence_rules r ON r.event_id = e.event_id
  WHERE c.user_id = :userId
    AND e.status = 'active'
  ORDER BY e.start_time
`;

const INSERT_EVENT = `
  INSERT INTO events (calendar_id, title, description, location, start_time, end_time, is_all_day, status, created_by)
  VALUES (:calendarId, :title, :description, :location, :startTime, :endTime, :isAllDay, 'active', :createdBy)
  RETURNING event_id INTO :eventId
`;

const UPDATE_EVENT = `
  UPDATE events
  SET title = :title,
      description = :description,
      location = :location,
      start_time = :startTime,
      end_time = :endTime,
      is_all_day = :isAllDay,
      calendar_id = :calendarId,
      updated_at = CURRENT_TIMESTAMP
  WHERE event_id = :eventId AND created_by = :userId
`;

const CANCEL_EVENT = `
  UPDATE events
  SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
  WHERE event_id = :eventId AND created_by = :userId
`;

const DELETE_EVENT = `
  DELETE FROM events
  WHERE event_id = :eventId AND created_by = :userId
`;

const SEARCH_EVENTS = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         c.calendar_name, c.color_hex
  FROM events e
  JOIN calendars c ON c.calendar_id = e.calendar_id
  WHERE c.user_id = :userId
    AND e.status = 'active'
    AND LOWER(e.title) LIKE '%' || LOWER(:keyword) || '%'
  ORDER BY e.start_time
`;

const GET_EVENTS_FOR_REMINDER = `
  SELECT event_id, title, description, location, start_time, end_time, created_by
  FROM events
  WHERE start_time >= CURRENT_TIMESTAMP
    AND start_time <= CURRENT_TIMESTAMP + INTERVAL '15' MINUTE
    AND reminder_sent = 0
    AND status = 'active'
`;

const MARK_REMINDER_SENT = `
  UPDATE events
  SET reminder_sent = 1
  WHERE event_id = :eventId
`;

module.exports = {
  GET_EVENTS_BY_DATE_RANGE,
  GET_EVENT_BY_ID,
  GET_EVENT_WITH_RECURRENCE,
  GET_RECURRING_EVENTS_FOR_USER,
  INSERT_EVENT,
  UPDATE_EVENT,
  CANCEL_EVENT,
  DELETE_EVENT,
  SEARCH_EVENTS,
  GET_EVENTS_FOR_REMINDER,
  MARK_REMINDER_SENT,
};
