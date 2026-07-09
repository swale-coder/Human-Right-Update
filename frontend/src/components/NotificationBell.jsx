import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationService } from '../services/notificationService'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef(null)

  const load = async () => {
    try {
      const data = await notificationService.list({ limit: 10 })
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // Fail silently — the bell just won't update. The rest of the dashboard still works.
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (ref.current && !ref.current.contains(ev.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      load()
    } catch {
      toast.error('Could not update notifications')
    }
  }

  const handleOpenNotification = async (n) => {
    if (!n.isRead) {
      try {
        await notificationService.markRead(n.id)
        load()
      } catch {
        // non-fatal
      }
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-outline" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button className="btn-link" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleOpenNotification(n)}
                >
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-message">{n.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
