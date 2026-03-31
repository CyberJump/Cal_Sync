import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MonthGrid from '../components/CalendarGrid/MonthGrid';
import WeekGrid from '../components/CalendarGrid/WeekGrid';
import DayGrid from '../components/CalendarGrid/DayGrid';
import EventModal from '../components/EventModal/EventModal';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import { calendarsAPI, eventsAPI, reportsAPI } from '../api/client';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [enabledCalendars, setEnabledCalendars] = useState(new Set());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Date Range for fetching events
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'month') {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay());
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start: start.toISOString(), end: end.toISOString() };
  }, [currentDate, view]);

  // Fetch calendars
  const fetchCalendars = useCallback(async () => {
    try {
      const res = await calendarsAPI.getAll();
      const cals = res.data || [];
      setCalendars(cals);
      setEnabledCalendars(new Set(cals.map((c) => c.CALENDAR_ID)));
    } catch (err) {
      console.error('Failed to fetch calendars:', err);
    }
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await eventsAPI.getByDateRange(dateRange.start, dateRange.end);
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [dateRange]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await reportsAPI.getUnreadCount();
      setUnreadCount(res.data?.UNREAD_COUNT || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCalendars();
      setLoading(false);
    };
    init();
  }, [fetchCalendars]);

  useEffect(() => {
    if (calendars.length > 0) {
      fetchEvents();
    }
  }, [fetchEvents, calendars]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Navigation
  const navigateDate = (direction) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + direction);
      else if (view === 'week') d.setDate(d.getDate() + direction * 7);
      else d.setDate(d.getDate() + direction);
      return d;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const toggleCalendar = (calId) => {
    setEnabledCalendars((prev) => {
      const next = new Set(prev);
      if (next.has(calId)) next.delete(calId);
      else next.add(calId);
      return next;
    });
  };

  // Event handlers
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleSlotClick = (date) => {
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    setSelectedEvent({
      startTime: date.toISOString(),
      endTime: endDate.toISOString(),
    });
    setShowEventModal(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (formData) => {
    try {
      if (formData.eventId) {
        await eventsAPI.update(formData.eventId, formData);
      } else {
        await eventsAPI.create(formData);
      }
      await fetchEvents();
    } catch (err) {
      console.error('Failed to save event:', err);
      throw err;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsAPI.delete(eventId);
      await fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleAddCalendar = async () => {
    const name = prompt('Calendar name:');
    if (!name) return;
    const colors = ['#3478F6', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA'];
    const color = colors[calendars.length % colors.length];
    try {
      await calendarsAPI.create({ calendarName: name, colorHex: color });
      await fetchCalendars();
    } catch (err) {
      console.error('Failed to create calendar:', err);
    }
  };

  // Format toolbar title
  const toolbarTitle = useMemo(() => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate, view]);

  if (loading) {
    return (
      <div className="app-layout">
        <div className="page-loader">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        calendars={calendars}
        selectedDate={currentDate}
        onDateSelect={(d) => setCurrentDate(d)}
        enabledCalendars={enabledCalendars}
        onToggleCalendar={toggleCalendar}
        onAddCalendar={handleAddCalendar}
      />

      <main className="main-content">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <h1 className="toolbar-month">{toolbarTitle}</h1>
            <div className="toolbar-nav">
              <button className="nav-btn" onClick={() => navigateDate(-1)} aria-label="Previous">‹</button>
              <button className="today-btn" onClick={goToToday}>Today</button>
              <button className="nav-btn" onClick={() => navigateDate(1)} aria-label="Next">›</button>
            </div>
          </div>
          <div className="toolbar-right">
            <div className="view-switcher">
              {['day', 'week', 'month'].map((v) => (
                <button
                  key={v}
                  className={`view-btn${view === v ? ' active' : ''}`}
                  onClick={() => setView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button className="add-event-btn" onClick={handleNewEvent}>
              <span>+</span> New Event
            </button>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'month' && (
          <MonthGrid
            currentDate={currentDate}
            events={events}
            enabledCalendars={enabledCalendars}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        )}
        {view === 'week' && (
          <WeekGrid
            currentDate={currentDate}
            events={events}
            enabledCalendars={enabledCalendars}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        )}
        {view === 'day' && (
          <DayGrid
            currentDate={currentDate}
            events={events}
            enabledCalendars={enabledCalendars}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        )}
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setSelectedEvent(null); }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        calendars={calendars}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
