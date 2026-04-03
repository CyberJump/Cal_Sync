const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All participant routes are protected
router.use(authMiddleware);

// GET /api/participants/shared — user's shared events
router.get('/shared', participantController.getSharedEvents);

// GET /api/participants/search?query=... — search users to invite
router.get('/search', participantController.searchUsers);

// GET /api/participants/event/:eventId — participants of an event
router.get('/event/:eventId', participantController.getParticipants);

// POST /api/participants — add participant to event
router.post('/', participantController.addParticipant);

// PUT /api/participants/event/:eventId/rsvp — update RSVP status by event ID
router.put('/event/:eventId/rsvp', participantController.updateRsvpByEvent);

// PUT /api/participants/:id/rsvp — update RSVP status
router.put('/:id/rsvp', participantController.updateRsvp);

// DELETE /api/participants/:id/event/:eventId — remove participant
router.delete('/:id/event/:eventId', participantController.removeParticipant);

module.exports = router;
