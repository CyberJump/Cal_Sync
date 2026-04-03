import { useMemo } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayGrid({ currentDate, events, enabledCalendars, onEventClick, onSlotClick }) {
  const today = new Date();

  const dayEvents = useMemo(() => {
    return events.filter((evt) => {
      // If it's a shared external event, check the 'shared' virtual calendar state
      if (evt.IS_SHARED === 1) {
        if (!enabledCalendars.has('shared')) return false;
      } else {
        if (!enabledCalendars.has(evt.CALENDAR_ID)) return false;
      }
      const start = new Date(evt.START_TIME);
      return (
        start.getFullYear() === currentDate.getFullYear() &&
        start.getMonth() === currentDate.getMonth() &&
        start.getDate() === currentDate.getDate()
      );
    });
  }, [events, currentDate, enabledCalendars]);

  const getProcessedEvents = () => {
    // 1. Sort by start time, then duration
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
      
      // Clamp to midnight if it spills over (avoid visual bleeding)
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
          left: `calc(${leftOffset}% + 4px)`,
          width: `calc(${width}% - 8px)`,
          background: evt.COLOR_HEX || '#3478F6',
        }
      };
    });
  };

  const processedEvents = getProcessedEvents();

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
          {processedEvents.map((evt) => (
            <div
              key={evt.EVENT_ID}
              className="day-event-block"
              style={evt.renderedStyle}
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
