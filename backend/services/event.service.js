const db = require('../db/connection');
const queries = require('../db/queries/event.queries');

// Helper function to calculate next recurrence instance
function getNextRecurrence(date, frequency, intervalVal) {
  const d = new Date(date);
  const freq = frequency.toLowerCase();
  const interval = parseInt(intervalVal) || 1;
  
  if (freq === 'daily') d.setDate(d.getDate() + interval);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7 * interval);
  else if (freq === 'monthly') d.setMonth(d.getMonth() + interval);
  else if (freq === 'yearly') d.setFullYear(d.getFullYear() + interval);
  else d.setDate(d.getDate() + interval); // fallback
  return d;
}

async function getEvents(userId, startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // 1. Fetch normal events that overlap this exact window
  const result = await db.execute(queries.GET_EVENTS_BY_DATE_RANGE, {
    userId,
    startDate,
    endDate,
  });
  
  const allEvents = result.rows;

  // 2. Fetch all recurring rules that belong to this user
  const recurringResult = await db.execute(queries.GET_RECURRING_EVENTS_FOR_USER, {
    userId
  });

  const recurringEvents = recurringResult.rows;

  // 3. Expand the rules in-memory for the requested time frame
  for (const template of recurringEvents) {
    const originalStart = new Date(template.START_TIME);
    let currentStart = new Date(template.START_TIME);
    let currentEnd = new Date(template.END_TIME);
    
    // Safety fallback: if no rec_end_date, cap at 3 years max to prevent infinite loops
    const maxRecDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);
    const recEndDate = template.REC_END_DATE ? new Date(template.REC_END_DATE) : maxRecDate;
    
    const frequency = template.FREQUENCY;
    const intervalVal = template.INTERVAL_VAL;

    let iterations = 0;
    while (currentStart <= endDate && currentStart <= recEndDate && iterations < 1500) {
      iterations++;
      
      // If this specific instance overlaps the viewer's requested window
      if (currentEnd >= startDate && currentStart <= endDate) {
        
        // Skip the very first instance because GET_EVENTS_BY_DATE_RANGE already caught it!
        // (if it originally fell within the window).
        const isOriginal = currentStart.getTime() === originalStart.getTime();
        
        if (!isOriginal) {
          allEvents.push({
            ...template,
            START_TIME: new Date(currentStart), // Reassign calculated timestamp
            END_TIME: new Date(currentEnd),
            // Override EVENT_ID to avoid React duplicate key errors.
            // parseInt("15_xyz") will naturally resolve to just 15 when calling backend!
            EVENT_ID: `${template.EVENT_ID}_${currentStart.getTime()}`,
            IS_SHARED: 0 // Marking standard for recurring logic
          });
        }
      }

      // Step forward by rule interval
      currentStart = getNextRecurrence(currentStart, frequency, intervalVal);
      currentEnd = getNextRecurrence(currentEnd, frequency, intervalVal);
    }
  }

  return allEvents;
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
