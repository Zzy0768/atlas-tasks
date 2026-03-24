import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Notification } from 'shared'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    client.get('/notifications').then(r => setNotifications(r.data))
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const markRead = async () => {
    await client.patch('/notifications')
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); if (!open && unread) markRead() }}
        className="relative text-lg">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b dark:border-gray-700 text-sm font-semibold">Notifications</div>
          {notifications.length === 0
            ? <p className="p-3 text-sm text-gray-400">No notifications</p>
            : notifications.slice(0, 10).map(n => (
              <div key={n.id} className={`p-3 text-xs border-b dark:border-gray-700 ${n.read ? 'text-gray-400' : 'font-medium'}`}>
                {n.message}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
