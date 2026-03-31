import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_EVENTS_VISIBLE = 3;

export default function MonthGrid({ currentDate, events, enabledCalendars, onEventClick, onDayClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const result = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: daysInPrev - i, monthOffset: -1, date: new Date(year, month - 1, daysInPrev - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({ day: i, monthOffset: 0, date: new Date(year, month, i) });
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push({ day: i, monthOffset: 1, date: new Date(year, month + 1, i) });
    }
    return result;
  }, [year, month]);

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getEventsForDay = (date) => {
    return events.filter((evt) => {
      if (!enabledCalendars.has(evt.CALENDAR_ID)) return false;
      const start = new Date(evt.START_TIME);
      const end = new Date(evt.END_TIME);
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             date <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  };

  return (
    <div className="calendar-grid-wrapper">
      <div className="month-grid" style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}>
        {DAY_NAMES.map((name) => (
          <div key={name} className="day-header">{name}</div>
        ))}
        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d.date);
          const isCurrentDay = isSameDay(d.date, today);
          return (
            <div
              key={i}
              className={`day-cell${isCurrentDay ? ' today' : ''}${d.monthOffset !== 0 ? ' other-month' : ''}`}
              onClick={() => onDayClick(d.date)}
            >
              <div className="day-number">{d.day}</div>
              <div className="day-events">
                {dayEvents.slice(0, MAX_EVENTS_VISIBLE).map((evt) => (
                  <div
                    key={evt.EVENT_ID}
                    className="event-pill"
                    style={{ background: evt.COLOR_HEX || '#3478F6' }}
                    onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                    title={evt.TITLE}
                  >
                    {evt.TITLE}
                  </div>
                ))}
                {dayEvents.length > MAX_EVENTS_VISIBLE && (
                  <div className="more-events">+{dayEvents.length - MAX_EVENTS_VISIBLE} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
