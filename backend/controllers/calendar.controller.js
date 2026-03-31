const calendarService = require('../services/calendar.service');

const getCalendars = async (req, res, next) => {
  try {
    const calendars = await calendarService.getUserCalendars(req.user.userId);
    res.json({ success: true, data: calendars });
  } catch (err) {
    next(err);
  }
};

const getCalendar = async (req, res, next) => {
  try {
    const calendar = await calendarService.getCalendarById(
      parseInt(req.params.id),
      req.user.userId
    );
    res.json({ success: true, data: calendar });
  } catch (err) {
    next(err);
  }
};

const createCalendar = async (req, res, next) => {
  try {
    const { calendarName, colorHex } = req.body;

    if (!calendarName) {
      return res.status(400).json({
        success: false,
        message: 'Calendar name is required',
      });
    }

    const calendar = await calendarService.createCalendar(
      req.user.userId,
      calendarName,
      colorHex
    );
    res.status(201).json({ success: true, data: calendar });
  } catch (err) {
    next(err);
  }
};

const updateCalendar = async (req, res, next) => {
  try {
    const { calendarName, colorHex } = req.body;

    if (!calendarName) {
      return res.status(400).json({
        success: false,
        message: 'Calendar name is required',
      });
    }

    const calendar = await calendarService.updateCalendar(
      parseInt(req.params.id),
      req.user.userId,
      calendarName,
      colorHex
    );
    res.json({ success: true, data: calendar });
  } catch (err) {
    next(err);
  }
};

const deleteCalendar = async (req, res, next) => {
  try {
    const result = await calendarService.deleteCalendar(
      parseInt(req.params.id),
      req.user.userId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCalendars, getCalendar, createCalendar, updateCalendar, deleteCalendar };
