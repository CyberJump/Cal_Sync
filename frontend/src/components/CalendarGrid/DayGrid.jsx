import { useMemo } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayGrid({ currentDate, events, enabledCalendars, onEventClick, onSlotClick }) {
  const today = new Date();

  const dayEvents = useMemo(() => {
    return events.filter((evt) => {
      if (!enabledCalendars.has(evt.CALENDAR_ID)) return false;
      const start = new Date(evt.START_TIME);
      return (
        start.getFullYear() === currentDate.getFullYear() &&
        start.getMonth() === currentDate.getMonth() &&
        start.getDate() === currentDate.getDate()
      );
    });
  }, [events, currentDate, enabledCalendars]);

  const getEventStyle = (evt) => {
    const start = new Date(evt.START_TIME);
    const end = new Date(evt.END_TIME);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = Math.max((end - start) / 60000, 30);
    return {
      top: `${(startMinutes / 60) * 60}px`,
      height: `${(duration / 60) * 60}px`,
      background: evt.COLOR_HEX || '#3478F6',
    };
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const fullDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="day-grid-wrapper">
      <div className="day-header-bar">
        <div className="day-full-date">{fullDate}</div>
      </div>
      <div className="day-body">
        <div className="time-column">
          {HOURS.map((h) => (
            <div key={h} className="time-slot-label">
              {h === 0 ? '' : `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`}
            </div>
          ))}
        </div>
        <div className="week-day-column" style={{ position: 'relative' }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="day-hour-slot"
              onClick={() => {
                const clickDate = new Date(currentDate);
                clickDate.setHours(h, 0, 0, 0);
                onSlotClick(clickDate);
              }}
            />
          ))}
          {dayEvents.map((evt) => (
            <div
              key={evt.EVENT_ID}
              className="day-event-block"
              style={getEventStyle(evt)}
              onClick={() => onEventClick(evt)}
            >
              <div style={{ fontWeight: 600 }}>{evt.TITLE}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 2 }}>
                {formatTime(evt.START_TIME)} – {formatTime(evt.END_TIME)}
              </div>
              {evt.LOCATION && (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>
                  📍 {evt.LOCATION}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
