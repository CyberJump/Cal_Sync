import { useState, useEffect, useRef } from 'react';
import { reportsAPI } from '../../api/client';

export default function NotificationPanel({ isOpen, onClose }) {
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
        {notifications.map((n) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
