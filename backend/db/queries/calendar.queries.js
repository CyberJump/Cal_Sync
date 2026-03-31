// Calendar-related SQL queries

const GET_USER_CALENDARS = `
  SELECT calendar_id, user_id, calendar_name, color_hex, is_default, created_at
  FROM calendars
  WHERE user_id = :userId
  ORDER BY is_default DESC, calendar_name
`;

const GET_CALENDAR_BY_ID = `
  SELECT calendar_id, user_id, calendar_name, color_hex, is_default, created_at
  FROM calendars
  WHERE calendar_id = :calendarId AND user_id = :userId
`;

const INSERT_CALENDAR = `
  INSERT INTO calendars (user_id, calendar_name, color_hex, is_default)
  VALUES (:userId, :calendarName, :colorHex, :isDefault)
  RETURNING calendar_id INTO :calendarId
`;

const UPDATE_CALENDAR = `
  UPDATE calendars
  SET calendar_name = :calendarName, color_hex = :colorHex
  WHERE calendar_id = :calendarId AND user_id = :userId
`;

const DELETE_CALENDAR = `
  DELETE FROM calendars
  WHERE calendar_id = :calendarId AND user_id = :userId AND is_default = 0
`;

module.exports = {
  GET_USER_CALENDARS,
  GET_CALENDAR_BY_ID,
  INSERT_CALENDAR,
  UPDATE_CALENDAR,
  DELETE_CALENDAR,
};
