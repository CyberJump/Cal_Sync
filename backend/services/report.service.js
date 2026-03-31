const db = require('../db/connection');
const queries = require('../db/queries/report.queries');

async function getEventCountPerCalendar(userId) {
  const result = await db.execute(queries.EVENT_COUNT_PER_CALENDAR, { userId });
  return result.rows;
}

async function getUpcomingEvents(userId) {
  const result = await db.execute(queries.UPCOMING_EVENTS_7_DAYS, { userId });
  return result.rows;
}

async function getUsersWithNoEvents() {
  const result = await db.execute(queries.USERS_WITH_NO_EVENTS);
  return result.rows;
}

async function getParticipantCountPerEvent(userId) {
  const result = await db.execute(queries.PARTICIPANT_COUNT_PER_EVENT, { userId });
  return result.rows;
}

async function getRecurringEventsOnly(userId) {
  const result = await db.execute(queries.RECURRING_EVENTS_ONLY, { userId });
  return result.rows;
}

async function getEventSummary(userId) {
  const result = await db.execute(queries.EVENT_SUMMARY, { userId });
  return result.rows;
}

async function getUserEventCount(userId) {
  const result = await db.execute(
    `SELECT count_user_events(:userId) AS event_count FROM dual`,
    { userId }
  );
  return result.rows[0];
}

// Notification operations
async function getNotifications(userId) {
  const result = await db.execute(queries.GET_USER_NOTIFICATIONS, { userId });
  return result.rows;
}

async function markNotificationRead(notificationId, userId) {
  const result = await db.execute(queries.MARK_NOTIFICATION_READ, { notificationId, userId });
  return { updated: result.rowsAffected > 0 };
}

async function markAllNotificationsRead(userId) {
  const result = await db.execute(queries.MARK_ALL_NOTIFICATIONS_READ, { userId });
  return { updated: result.rowsAffected };
}

async function getUnreadCount(userId) {
  const result = await db.execute(queries.GET_UNREAD_COUNT, { userId });
  return result.rows[0];
}

module.exports = {
  getEventCountPerCalendar,
  getUpcomingEvents,
  getUsersWithNoEvents,
  getParticipantCountPerEvent,
  getRecurringEventsOnly,
  getEventSummary,
  getUserEventCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
};
