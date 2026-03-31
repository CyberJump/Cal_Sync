const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All report routes are protected
router.use(authMiddleware);

// Reports
router.get('/event-count', reportController.getEventCount);
router.get('/event-count-per-calendar', reportController.getEventCountPerCalendar);
router.get('/upcoming', reportController.getUpcoming);
router.get('/summary', reportController.getSummary);
router.get('/recurring', reportController.getRecurring);
router.get('/participant-counts', reportController.getParticipantCounts);

// Notifications
router.get('/notifications', reportController.getNotifications);
router.get('/notifications/unread-count', reportController.getUnreadCount);
router.put('/notifications/:id/read', reportController.markRead);
router.put('/notifications/read-all', reportController.markAllRead);

module.exports = router;
