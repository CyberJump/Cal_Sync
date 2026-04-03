import { useState, useEffect, useRef } from 'react';
import { reportsAPI, participantsAPI } from '../../api/client';

export default function NotificationPanel({ isOpen, onClose, onAction }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getNotifications();
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await reportsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.NOTIFICATION_ID === id ? { ...n, IS_READ: 1 } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await reportsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, IS_READ: 1 })));
    } catch {}
  };

  const handleRsvp = async (e, notification, status) => {
    e.stopPropagation(); // prevent markRead from firing immediately on row click
    try {
      if (notification.EVENT_ID) {
        await participantsAPI.updateRsvpByEvent(notification.EVENT_ID, status);
      }
      
      // Optisimistically update local state so the badge changes instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n.NOTIFICATION_ID === notification.NOTIFICATION_ID
            ? { ...n, IS_READ: 1, RSVP_STATUS: status }
            : n
        )
      );

      // Also mark the notification as read in the backend
      await reportsAPI.markRead(notification.NOTIFICATION_ID);
      
      // Trigger refresh on the calendar board so the new event appears
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to RSVP:', err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel" ref={panelRef}>
      <div className="notification-panel-header">
        <h3 className="notification-panel-title">Notifications</h3>
        <button className="mark-all-read" onClick={handleMarkAllRead}>
          Mark all read
        </button>
      </div>
      <div className="notification-list">
        {loading && (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
            No notifications yet
          </div>
        )}
        {notifications.map((n) => {
          const isInvite = n.MESSAGE && n.MESSAGE.includes('invited to');
          return (
            <div
              key={n.NOTIFICATION_ID}
              className={`notification-item${n.IS_READ ? '' : ' unread'}`}
              onClick={() => handleMarkRead(n.NOTIFICATION_ID)}
            >
              <div className="notification-dot" />
              <div className="notification-content">
                <div className="notification-message">{n.MESSAGE}</div>
                <div className="notification-time">
                  {n.EVENT_TITLE && <span>{n.EVENT_TITLE} · </span>}
                  {timeAgo(n.CREATED_AT)}
                </div>
                {isInvite && n.EVENT_ID && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    {(!n.RSVP_STATUS || n.RSVP_STATUS === 'pending') && n.IS_READ === 0 ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={(e) => handleRsvp(e, n, 'accepted')}
                          className="btn btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', height: 'auto' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleRsvp(e, n, 'declined')}
                          className="btn btn-ghost"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', height: 'auto' }}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (n.RSVP_STATUS && n.RSVP_STATUS !== 'pending') ? (
                      <span
                        className={`rsvp-badge rsvp-${n.RSVP_STATUS}`}
                        style={{
                          fontSize: '0.7rem',
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: n.RSVP_STATUS === 'accepted' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                          color: n.RSVP_STATUS === 'accepted' ? '#28a745' : '#dc3545',
                          fontWeight: 500
                        }}
                      >
                        {n.RSVP_STATUS.charAt(0).toUpperCase() + n.RSVP_STATUS.slice(1)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
