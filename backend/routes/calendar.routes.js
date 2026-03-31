const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All calendar routes are protected
router.use(authMiddleware);

// GET /api/calendars
router.get('/', calendarController.getCalendars);

// GET /api/calendars/:id
router.get('/:id', calendarController.getCalendar);

// POST /api/calendars
router.post('/', calendarController.createCalendar);

// PUT /api/calendars/:id
router.put('/:id', calendarController.updateCalendar);

// DELETE /api/calendars/:id
router.delete('/:id', calendarController.deleteCalendar);

module.exports = router;
