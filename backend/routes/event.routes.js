const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All event routes are protected
router.use(authMiddleware);

// GET /api/events?startDate=...&endDate=...
router.get('/', eventController.getEvents);

// GET /api/events/search?keyword=...
router.get('/search', eventController.searchEvents);

// GET /api/events/:id
router.get('/:id', eventController.getEvent);

// POST /api/events
router.post('/', eventController.createEvent);

// PUT /api/events/:id
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
