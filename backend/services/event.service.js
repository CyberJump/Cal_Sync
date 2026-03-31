const db = require('../db/connection');
const queries = require('../db/queries/event.queries');

async function getEvents(userId, startDate, endDate) {
  const result = await db.execute(queries.GET_EVENTS_BY_DATE_RANGE, {
    userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });
  return result.rows;
}

async function getEventById(eventId) {
  const result = await db.execute(queries.GET_EVENT_WITH_RECURRENCE, { eventId });
  if (result.rows.length === 0) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

async function createEvent(eventData) {
  const { calendarId, title, description, location, startTime, endTime, isAllDay, createdBy, frequency, intervalVal, recEndDate, daysOfWeek } = eventData;

  // Use the ADD_EVENT procedure if recurrence is present, otherwise direct insert
  if (frequency) {
    const result = await db.executeProcedure(
      `BEGIN add_event(:calendarId, :title, :description, :location, :startTime, :endTime, :isAllDay, :createdBy, :frequency, :intervalVal, :recEndDate, :daysOfWeek, :eventId); END;`,
      {
        calendarId,
        title,
        description: description || null,
        location: location || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isAllDay: isAllDay ? 1 : 0,
        createdBy,
        frequency,
        intervalVal: intervalVal || 1,
        recEndDate: recEndDate ? new Date(recEndDate) : null,
        daysOfWeek: daysOfWeek || null,
        eventId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      }
    );
    return { eventId: result.outBinds.eventId[0] };
  } else {
    // Direct insert without procedure (for non-recurring events)
    const result = await db.execute(queries.INSERT_EVENT, {
      calendarId,
      title,
      description: description || null,
      location: location || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isAllDay: isAllDay ? 1 : 0,
      createdBy,
      eventId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    });

    const eventId = result.outBinds.eventId[0];

    // Add creator as organizer
    const partQueries = require('../db/queries/participant.queries');
    await db.execute(
      `INSERT INTO event_participants (event_id, user_id, role, rsvp_status) VALUES (:eventId, :userId, 'organizer', 'accepted')`,
      { eventId, userId: createdBy }
    );

    return { eventId };
  }
}

async function updateEvent(eventId, userId, eventData) {
  const { calendarId, title, description, location, startTime, endTime, isAllDay } = eventData;

  const result = await db.execute(queries.UPDATE_EVENT, {
    eventId,
    userId,
    calendarId,
    title,
    description: description || null,
    location: location || null,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    isAllDay: isAllDay ? 1 : 0,
  });

  if (result.rowsAffected === 0) {
    const err = new Error('Event not found or not authorized');
    err.statusCode = 404;
    throw err;
  }

  return { eventId, updated: true };
}

async function deleteEvent(eventId, userId) {
  const result = await db.execute(queries.DELETE_EVENT, { eventId, userId });
  if (result.rowsAffected === 0) {
    const err = new Error('Event not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

async function searchEvents(userId, keyword) {
  const result = await db.execute(queries.SEARCH_EVENTS, { userId, keyword });
  return result.rows;
}

async function getRecurringEvents(userId) {
  const result = await db.execute(queries.GET_RECURRING_EVENTS_FOR_USER, { userId });
  return result.rows;
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, searchEvents, getRecurringEvents };
