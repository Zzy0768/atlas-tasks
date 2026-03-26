import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
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
    if (!unread) return
    await client.patch('/notifications')
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); if (!open) markRead() }}
        className="btn-ghost p-2 relative">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-80 card shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-stone-400 dark:text-stone-600">All caught up</p>
              ) : (
                notifications.slice(0, 15).map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-stone-50 dark:border-stone-800/50 last:border-0 ${!n.read ? 'bg-stone-50 dark:bg-stone-800/30' : ''}`}>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-600 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
