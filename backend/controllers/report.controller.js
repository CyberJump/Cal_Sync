const reportService = require('../services/report.service');

const getEventCount = async (req, res, next) => {
  try {
    const result = await reportService.getUserEventCount(req.user.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getEventCountPerCalendar = async (req, res, next) => {
  try {
    const result = await reportService.getEventCountPerCalendar(req.user.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getUpcoming = async (req, res, next) => {
  try {
    const events = await reportService.getUpcomingEvents(req.user.userId);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getEventSummary(req.user.userId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

const getRecurring = async (req, res, next) => {
  try {
    const events = await reportService.getRecurringEventsOnly(req.user.userId);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const getParticipantCounts = async (req, res, next) => {
  try {
    const result = await reportService.getParticipantCountPerEvent(req.user.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Notification endpoints
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await reportService.getNotifications(req.user.userId);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const result = await reportService.markNotificationRead(
      parseInt(req.params.id),
      req.user.userId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await reportService.markAllNotificationsRead(req.user.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await reportService.getUnreadCount(req.user.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEventCount,
  getEventCountPerCalendar,
  getUpcoming,
  getSummary,
  getRecurring,
  getParticipantCounts,
  getNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
};
