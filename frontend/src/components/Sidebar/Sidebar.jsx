import MiniCalendar from './MiniCalendar';
import { useAuth } from '../../context/AuthContext';

const CALENDAR_COLORS = [
  '#3478F6', '#FF3B30', '#34C759', '#FF9500',
  '#AF52DE', '#5AC8FA', '#FF2D55', '#FFCC00',
];

export default function Sidebar({
  calendars,
  selectedDate,
  onDateSelect,
  enabledCalendars,
  onToggleCalendar,
  onAddCalendar,
}) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">📅</div>
        <span className="sidebar-title">CalSync</span>
      </div>

      <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

      <div className="calendar-section">
        <div className="calendar-section-title">My Calendars</div>
        {calendars.map((cal) => (
          <label key={cal.CALENDAR_ID} className="calendar-list-item">
            <input
              type="checkbox"
              className="calendar-checkbox"
              checked={enabledCalendars.has(cal.CALENDAR_ID)}
              onChange={() => onToggleCalendar(cal.CALENDAR_ID)}
              style={{
                '--cal-color': cal.COLOR_HEX || '#3478F6',
                borderColor: enabledCalendars.has(cal.CALENDAR_ID)
                  ? 'transparent'
                  : undefined,
                background: enabledCalendars.has(cal.CALENDAR_ID)
                  ? cal.COLOR_HEX || '#3478F6'
                  : undefined,
              }}
            />
            <span className="calendar-item-name">{cal.CALENDAR_NAME}</span>
          </label>
        ))}
        <button className="add-calendar-btn" onClick={onAddCalendar}>
          <span>+</span> New Calendar
        </button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-8)' }}>
        <div className="calendar-list-item" style={{ opacity: 0.7 }}>
          <div className="participant-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
            {user?.USERNAME?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="calendar-item-name" style={{ fontSize: '0.8125rem' }}>
            {user?.USERNAME || user?.username || 'User'}
          </span>
          <button
            onClick={logout}
            style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', padding: '4px 8px', borderRadius: '6px' }}
            title="Sign out"
          >
            ↗
          </button>
        </div>
      </div>
    </aside>
  );
}
