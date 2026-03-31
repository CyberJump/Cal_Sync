const eventService = require('../services/event.service');

const getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate query parameters are required',
      });
    }

    const events = await eventService.getEvents(req.user.userId, startDate, endDate);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(parseInt(req.params.id));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { calendarId, title, description, location, startTime, endTime, isAllDay, frequency, intervalVal, recEndDate, daysOfWeek } = req.body;

    if (!calendarId || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'calendarId, title, startTime, and endTime are required',
      });
    }

    const result = await eventService.createEvent({
      calendarId,
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay: isAllDay || false,
      createdBy: req.user.userId,
      frequency,
      intervalVal,
      recEndDate,
      daysOfWeek,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { calendarId, title, description, location, startTime, endTime, isAllDay } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'title, startTime, and endTime are required',
      });
    }

    const result = await eventService.updateEvent(
      parseInt(req.params.id),
      req.user.userId,
      { calendarId, title, description, location, startTime, endTime, isAllDay }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result = await eventService.deleteEvent(
      parseInt(req.params.id),
      req.user.userId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const searchEvents = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'keyword query parameter is required',
      });
    }
    const events = await eventService.searchEvents(req.user.userId, keyword);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, searchEvents };
