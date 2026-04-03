const db = require('../db/connection');
const queries = require('../db/queries/participant.queries');

async function getEventParticipants(eventId) {
  const result = await db.execute(queries.GET_EVENT_PARTICIPANTS, { eventId });
  return result.rows;
}

async function addParticipant(eventId, userId) {
  const result = await db.executeProcedure(
    `BEGIN add_participant(:eventId, :userId, 'attendee', :participantId); END;`,
    {
      eventId,
      userId,
      participantId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    }
  );
  return { participantId: result.outBinds.participantId[0] };
}

async function updateRsvp(participantId, userId, rsvpStatus) {
  const result = await db.execute(queries.UPDATE_RSVP, {
    participantId,
    userId,
    rsvpStatus,
  });
  if (result.rowsAffected === 0) {
    const err = new Error('Participant not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return { updated: true };
}

async function removeParticipant(participantId, eventId) {
  const result = await db.execute(queries.DELETE_PARTICIPANT, { participantId, eventId });
  if (result.rowsAffected === 0) {
    const err = new Error('Participant not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

async function getSharedEvents(userId) {
  const result = await db.execute(queries.GET_USER_SHARED_EVENTS, { userId });
  return result.rows;
}

async function searchUsers(query, currentUserId) {
  const result = await db.execute(queries.SEARCH_USERS_BY_EMAIL, { query, currentUserId });
  return result.rows;
}

async function updateRsvpByEvent(eventId, userId, rsvpStatus) {
  const result = await db.execute(queries.UPDATE_RSVP_BY_EVENT, {
    eventId,
    userId,
    rsvpStatus,
  });
  if (result.rowsAffected === 0) {
    const err = new Error('Participant not found or not authorized for this event');
    err.statusCode = 404;
    throw err;
  }
  return { updated: true };
}

module.exports = { getEventParticipants, addParticipant, updateRsvp, updateRsvpByEvent, removeParticipant, getSharedEvents, searchUsers };
