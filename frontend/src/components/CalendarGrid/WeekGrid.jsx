import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekGrid({ currentDate, events, enabledCalendars, onEventClick, onSlotClick }) {
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const getEventsForDay = (date) => {
    return events.filter((evt) => {
      // If it's a shared external event, check the 'shared' virtual calendar state
      if (evt.IS_SHARED === 1) {
        if (!enabledCalendars.has('shared')) return false;
      } else {
        if (!enabledCalendars.has(evt.CALENDAR_ID)) return false;
      }
      const start = new Date(evt.START_TIME);
      return isSameDay(start, date);
    });
  };

  const getProcessedEvents = (dayEvents) => {
    const sorted = [...dayEvents].sort((a, b) => {
      const startA = new Date(a.START_TIME);
      const startB = new Date(b.START_TIME);
      if (startA.getTime() !== startB.getTime()) return startA - startB;
      const endA = new Date(a.END_TIME);
      const endB = new Date(b.END_TIME);
      return (endB - startB) - (endA - startA);
    });

    const columns = [];
    const eventStyles = new Map();

    sorted.forEach((evt) => {
      let placed = false;
      const startMs = new Date(evt.START_TIME).getTime();
      
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const groupEnd = new Date(col[col.length - 1].END_TIME).getTime();
        if (startMs >= groupEnd) {
          col.push(evt);
          eventStyles.set(evt.EVENT_ID, i);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([evt]);
        eventStyles.set(evt.EVENT_ID, columns.length - 1);
      }
    });

    const totalColumns = Math.max(columns.length, 1);

    return sorted.map((evt) => {
      const colIndex = eventStyles.get(evt.EVENT_ID);
      const start = new Date(evt.START_TIME);
      let end = new Date(evt.END_TIME);
      
      const eod = new Date(start);
      eod.setHours(23, 59, 59, 999);
      if (end > eod) {
        end = eod;
      }

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const duration = Math.max((end - start) / 60000, 30);
      
      const width = 100 / totalColumns;
      const leftOffset = colIndex * width;

      return {
        ...evt,
        renderedStyle: {
          top: `${(startMinutes / 60) * 60}px`,
          height: `${(duration / 60) * 60}px`,
          left: `calc(${leftOffset}% + 2px)`,
          width: `calc(${width}% - 3px)`,
          background: evt.COLOR_HEX || '#3478F6',
        }
      };
    });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="week-grid-wrapper">
      <div className="week-header">
        <div style={{ width: 60 }} />
        {weekDays.map((day, i) => (
          <div key={i} className={`week-header-cell${isSameDay(day, today) ? ' today' : ''}`}>
            <div className="day-name">{DAY_NAMES[i]}</div>
            <div className="day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="week-body">
        <div className="time-column">
          {HOURS.map((h) => (
            <div key={h} className="time-slot-label">
              {h === 0 ? '' : `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`}
            </div>
          ))}
        </div>
        {weekDays.map((day, colIndex) => {
          const dayEvents = getEventsForDay(day);
          const processedEvents = getProcessedEvents(dayEvents);
          return (
            <div key={colIndex} className="week-day-column">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="hour-slot"
                  onClick={() => {
                    const clickDate = new Date(day);
                    clickDate.setHours(h, 0, 0, 0);
                    onSlotClick(clickDate);
                  }}
                />
              ))}
              {processedEvents.map((evt) => (
                <div
                  key={evt.EVENT_ID}
                  className="week-event-block"
                  style={evt.renderedStyle}
                  onClick={() => onEventClick(evt)}
                >
                  <div style={{ fontWeight: 600 }}>{evt.TITLE}</div>
                  <div className="event-time">{formatTime(evt.START_TIME)}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
