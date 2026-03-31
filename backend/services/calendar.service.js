const db = require('../db/connection');
const queries = require('../db/queries/calendar.queries');

async function getUserCalendars(userId) {
  const result = await db.execute(queries.GET_USER_CALENDARS, { userId });
  return result.rows;
}

async function getCalendarById(calendarId, userId) {
  const result = await db.execute(queries.GET_CALENDAR_BY_ID, { calendarId, userId });
  if (result.rows.length === 0) {
    const err = new Error('Calendar not found');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

async function createCalendar(userId, calendarName, colorHex = '#3478F6') {
  const result = await db.execute(queries.INSERT_CALENDAR, {
    userId,
    calendarName,
    colorHex,
    isDefault: 0,
    calendarId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
  });
  return {
    calendarId: result.outBinds.calendarId[0],
    calendarName,
    colorHex,
  };
}

async function updateCalendar(calendarId, userId, calendarName, colorHex) {
  const result = await db.execute(queries.UPDATE_CALENDAR, {
    calendarId,
    userId,
    calendarName,
    colorHex,
  });
  if (result.rowsAffected === 0) {
    const err = new Error('Calendar not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return { calendarId, calendarName, colorHex };
}

async function deleteCalendar(calendarId, userId) {
  const result = await db.execute(queries.DELETE_CALENDAR, { calendarId, userId });
  if (result.rowsAffected === 0) {
    const err = new Error('Calendar not found, not authorized, or is default calendar');
    err.statusCode = 400;
    throw err;
  }
  return { deleted: true };
}

module.exports = { getUserCalendars, getCalendarById, createCalendar, updateCalendar, deleteCalendar };
