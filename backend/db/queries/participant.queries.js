// Participant-related SQL queries

const GET_EVENT_PARTICIPANTS = `
  SELECT ep.participant_id, ep.event_id, ep.user_id,
         ep.role, ep.rsvp_status, ep.invited_at,
         u.username, u.email
  FROM event_participants ep
  JOIN users u ON u.user_id = ep.user_id
  WHERE ep.event_id = :eventId
  ORDER BY ep.role DESC, u.username
`;

const GET_USER_SHARED_EVENTS = `
  SELECT e.event_id, e.title, e.description, e.location,
         e.start_time, e.end_time, e.is_all_day, e.status,
         c.calendar_name, c.color_hex,
         ep.role, ep.rsvp_status,
         u.username AS organizer_name
  FROM event_participants ep
  JOIN events e ON e.event_id = ep.event_id
  JOIN calendars c ON c.calendar_id = e.calendar_id
  JOIN users u ON u.user_id = e.created_by
  WHERE ep.user_id = :userId
    AND ep.role = 'attendee'
    AND e.status = 'active'
  ORDER BY e.start_time
`;

const UPDATE_RSVP = `
  UPDATE event_participants
  SET rsvp_status = :rsvpStatus
  WHERE participant_id = :participantId AND user_id = :userId
`;

const DELETE_PARTICIPANT = `
  DELETE FROM event_participants
  WHERE participant_id = :participantId AND event_id = :eventId
`;

const SEARCH_USERS_BY_EMAIL = `
  SELECT user_id, username, email
  FROM users
  WHERE LOWER(email) LIKE '%' || LOWER(:query) || '%'
    AND user_id != :currentUserId
  FETCH FIRST 10 ROWS ONLY
`;

module.exports = {
  GET_EVENT_PARTICIPANTS,
  GET_USER_SHARED_EVENTS,
  UPDATE_RSVP,
  DELETE_PARTICIPANT,
  SEARCH_USERS_BY_EMAIL,
};
