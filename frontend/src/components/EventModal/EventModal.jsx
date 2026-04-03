import { useState, useEffect } from 'react';
import { participantsAPI } from '../../api/client';

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  calendars,
}) {
  const isEdit = !!event?.EVENT_ID;

  const [formData, setFormData] = useState({
    title: '',
    calendarId: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    location: '',
    description: '',
    frequency: '',
    intervalVal: 1,
    recEndDate: '',
    daysOfWeek: '',
  });

  const [participantQuery, setParticipantQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Utility to get YYYY-MM-DDThh:mm string in LOCAL time
    const toLocalDatetime = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      // Adjust for local timezone offset
      const localDt = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000));
      return localDt.toISOString().slice(0, 16);
    };

    if (event) {
      setFormData({
        title: event.TITLE || event.title || '',
        calendarId: event.CALENDAR_ID || event.calendarId || calendars[0]?.CALENDAR_ID || '',
        startTime: toLocalDatetime(event.START_TIME || event.startTime),
        endTime: toLocalDatetime(event.END_TIME || event.endTime),
        isAllDay: !!event.IS_ALL_DAY,
        location: event.LOCATION || event.location || '',
        description: event.DESCRIPTION || event.description || '',
        frequency: event.FREQUENCY || '',
        intervalVal: event.INTERVAL_VAL || 1,
        recEndDate: toLocalDatetime(event.REC_END_DATE),
        daysOfWeek: event.DAYS_OF_WEEK || '',
      });
    } else {
      const now = new Date();
      // Adjust start to next whole hour
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      const later = new Date(now.getTime() + 3600000);
      
      const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      const localLater = new Date(later.getTime() - (later.getTimezoneOffset() * 60000));

      setFormData({
        title: '',
        calendarId: calendars[0]?.CALENDAR_ID || '',
        startTime: localNow.toISOString().slice(0, 16),
        endTime: localLater.toISOString().slice(0, 16),
        isAllDay: false,
        location: '',
        description: '',
        frequency: '',
        intervalVal: 1,
        recEndDate: '',
        daysOfWeek: '',
      });
    }
  }, [event, calendars]);

  // Fetch participants if editing
  useEffect(() => {
    if (isEdit && event.EVENT_ID) {
      participantsAPI.getByEvent(event.EVENT_ID)
        .then((res) => setParticipants(res.data || []))
        .catch(() => {});
    }
  }, [isEdit, event]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchUsers = async (query) => {
    setParticipantQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await participantsAPI.searchUsers(query);
      setSearchResults(res.data || []);
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddParticipant = async (user) => {
    if (isEdit) {
      try {
        await participantsAPI.add({ eventId: event.EVENT_ID, userId: user.USER_ID });
        const res = await participantsAPI.getByEvent(event.EVENT_ID);
        setParticipants(res.data || []);
      } catch {}
    } else {
      if (!participants.some(p => p.USER_ID === user.USER_ID)) {
        setParticipants([...participants, { ...user, RSVP_STATUS: 'pending' }]);
      }
    }
    setParticipantQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Need to adjust from local string back to absolute JS Date representation before posting
      const absoluteStart = new Date(formData.startTime).toISOString();
      const absoluteEnd = new Date(formData.endTime).toISOString();
      let absoluteRecEnd = null;
      if (formData.recEndDate) {
        absoluteRecEnd = new Date(formData.recEndDate).toISOString();
      }

      await onSave({
        ...formData,
        startTime: absoluteStart,
        endTime: absoluteEnd,
        recEndDate: absoluteRecEnd,
        eventId: event?.EVENT_ID,
        participants: isEdit ? [] : participants,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Event' : 'New Event'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <input
              type="text"
              className="form-input form-input-lg"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              autoFocus
            />

            {/* Calendar Selector */}
            <div className="form-group">
              <label className="form-label">Calendar</label>
              <select
                className="form-select"
                value={formData.calendarId}
                onChange={(e) => handleChange('calendarId', parseInt(e.target.value))}
              >
                {calendars.map((cal) => (
                  <option key={cal.CALENDAR_ID} value={cal.CALENDAR_ID}>
                    {cal.CALENDAR_NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* All Day Toggle */}
            <div className="toggle-wrapper">
              <span className="form-label" style={{ textTransform: 'none', fontSize: '0.9375rem', fontWeight: 400, color: 'var(--color-on-surface)' }}>
                All Day
              </span>
              <button
                type="button"
                className={`toggle${formData.isAllDay ? ' active' : ''}`}
                onClick={() => handleChange('isAllDay', !formData.isAllDay)}
              />
            </div>

            {/* Date/Time */}
            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ flex: 1 }}
                  value={formData.startTime.slice(0, 10)}
                  onChange={(e) => {
                    const t = formData.startTime.slice(11, 16) || '00:00';
                    handleChange('startTime', `${e.target.value}T${t}`);
                  }}
                  required
                />
                {!formData.isAllDay && (
                  <input
                    type="time"
                    className="form-input"
                    value={formData.startTime.slice(11, 16) || ''}
                    onChange={(e) => {
                      const d = formData.startTime.slice(0, 10) || new Date().toISOString().slice(0, 10);
                      handleChange('startTime', `${d}T${e.target.value}`);
                    }}
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ flex: 1 }}
                  value={formData.endTime.slice(0, 10)}
                  onChange={(e) => {
                    const t = formData.endTime.slice(11, 16) || '00:00';
                    handleChange('endTime', `${e.target.value}T${t}`);
                  }}
                  required
                />
                {!formData.isAllDay && (
                  <input
                    type="time"
                    className="form-input"
                    value={formData.endTime.slice(11, 16) || ''}
                    onChange={(e) => {
                      const d = formData.endTime.slice(0, 10) || new Date().toISOString().slice(0, 10);
                      handleChange('endTime', `${d}T${e.target.value}`);
                    }}
                    required
                  />
                )}
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="Add a location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Add a description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Recurrence */}
            <div className="form-group">
              <label className="form-label">Repeat</label>
              <select
                className="form-select"
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
              >
                <option value="">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {formData.frequency && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Every</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="99"
                    value={formData.intervalVal}
                    onChange={(e) => handleChange('intervalVal', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Repeat Until</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.recEndDate ? formData.recEndDate.slice(0, 10) : ''}
                    onChange={(e) => handleChange('recEndDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="participant-section">
              <label className="form-label" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>
                Participants
              </label>

              {participants.length > 0 && (
                <div className="participant-list" style={{ marginBottom: 'var(--space-4)' }}>
                  {participants.map((p) => (
                    <div key={p.PARTICIPANT_ID || p.USER_ID} className="participant-item">
                      <div className="participant-avatar">
                        {p.USERNAME?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="participant-info">
                        <div className="participant-name">{p.USERNAME}</div>
                        <div className="participant-email">{p.EMAIL}</div>
                      </div>
                      <span className={`rsvp-badge rsvp-${p.RSVP_STATUS || 'pending'}`}>
                        {p.RSVP_STATUS || 'pending'}
                      </span>
                      {!isEdit && (
                        <button
                          type="button"
                          onClick={() => setParticipants(participants.filter(x => x.USER_ID !== p.USER_ID))}
                          style={{ marginLeft: '8px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-danger)' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="participant-search">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type an email address to invite..."
                  value={participantQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  style={{ width: '100%' }}
                />
                {searchResults.length > 0 && (
                  <div className="participant-search-results">
                    {searchResults.map((u) => (
                      <div
                        key={u.USER_ID}
                        className="search-result-item"
                        onClick={() => handleAddParticipant(u)}
                      >
                        <div className="participant-avatar">
                          {u.USERNAME?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{u.USERNAME}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{u.EMAIL}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {isEdit && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => { onDelete(event.EVENT_ID); onClose(); }}
                style={{ marginRight: 'auto' }}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : (isEdit ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
