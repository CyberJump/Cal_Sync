const participantService = require('../services/participant.service');

const getParticipants = async (req, res, next) => {
  try {
    const participants = await participantService.getEventParticipants(
      parseInt(req.params.eventId)
    );
    res.json({ success: true, data: participants });
  } catch (err) {
    next(err);
  }
};

const addParticipant = async (req, res, next) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'eventId and userId are required',
      });
    }

    const result = await participantService.addParticipant(eventId, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateRsvp = async (req, res, next) => {
  try {
    const { rsvpStatus } = req.body;
    const validStatuses = ['pending', 'accepted', 'declined'];

    if (!rsvpStatus || !validStatuses.includes(rsvpStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Valid rsvpStatus is required (pending, accepted, declined)',
      });
    }

    const result = await participantService.updateRsvp(
      parseInt(req.params.id),
      req.user.userId,
      rsvpStatus
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const removeParticipant = async (req, res, next) => {
  try {
    const result = await participantService.removeParticipant(
      parseInt(req.params.id),
      parseInt(req.params.eventId)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getSharedEvents = async (req, res, next) => {
  try {
    const events = await participantService.getSharedEvents(req.user.userId);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'query parameter is required',
      });
    }
    const users = await participantService.searchUsers(query, req.user.userId);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getParticipants, addParticipant, updateRsvp, removeParticipant, getSharedEvents, searchUsers };
