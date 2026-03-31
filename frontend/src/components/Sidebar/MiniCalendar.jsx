import { useState, useMemo } from 'react';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MiniCalendar({ selectedDate, onDateSelect }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate || Date.now()));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const result = [];
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: daysInPrev - i, month: month - 1, other: true });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({ day: i, month, other: false });
    }
    // Next month's leading days
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push({ day: i, month: month + 1, other: true });
    }
    return result;
  }, [year, month]);

  const today = new Date();
  const isToday = (d) =>
    d.day === today.getDate() &&
    d.month === today.getMonth() &&
    year === today.getFullYear() && !d.other;

  const isSelected = (d) => {
    if (!selectedDate || d.other) return false;
    const s = new Date(selectedDate);
    return d.day === s.getDate() && d.month === s.getMonth() && year === s.getFullYear();
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <span className="mini-cal-month">{monthName}</span>
        <div className="mini-cal-nav">
          <button onClick={prevMonth} aria-label="Previous month">‹</button>
          <button onClick={nextMonth} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="mini-cal-grid">
        {DAY_NAMES.map((name, i) => (
          <div key={`h-${i}`} className="mini-cal-day-name">{name}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            className={`mini-cal-day${isToday(d) ? ' today' : ''}${isSelected(d) ? ' selected' : ''}${d.other ? ' other-month' : ''}`}
            onClick={() => {
              if (!d.other) {
                const newDate = new Date(year, d.month, d.day);
                onDateSelect(newDate);
              }
            }}
          >
            {d.day}
          </div>
        ))}
      </div>
    </div>
  );
}
