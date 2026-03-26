import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Task, User } from 'shared'
import { X, Calendar, Flag, Tag, User as UserIcon } from 'lucide-react'

interface Props { task: Task; projectId: string; onClose: () => void; onUpdate: () => void }

const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES   = ['todo', 'in_progress', 'done'] as const

export default function TaskModal({ task, projectId, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    title:          task.title,
    description:    task.description || '',
    priority:       task.priority,
    status:         task.status,
    labels:         task.labels.join(', '),
    dueDate:        task.dueDate   ? task.dueDate.slice(0, 10)   : '',
    startDate:      task.startDate ? task.startDate.slice(0, 10) : '',
    assigneeId:     task.assigneeId || '',
    recurrenceRule: task.recurrenceRule || '',
  })
  const [users, setUsers]       = useState<User[]>([])
  const [userQuery, setUserQuery] = useState(task.assignee?.name || '')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (userQuery.length < 1) return setUsers([])
    const t = setTimeout(() =>
      client.get(`/users/search?q=${userQuery}`).then(r => setUsers(r.data)), 300)
    return () => clearTimeout(t)
  }, [userQuery])

  const save = async () => {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await client.patch(`/tasks/${task.id}`, {
        title:          form.title,
        description:    form.description,
        priority:       form.priority,
        status:         form.status,
        labels:         form.labels.split(',').map(l => l.trim()).filter(Boolean),
        dueDate:        form.dueDate   || null,
        startDate:      form.startDate || null,
        assigneeId:     form.assigneeId || null,
        recurrenceRule: form.recurrenceRule || null,
      })
      onUpdate()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save task'
      console.error('Error saving task:', err)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      save()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Edit task</h2>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <input className="input text-base font-medium border-0 border-b border-stone-200 dark:border-stone-700 rounded-none px-0 focus:ring-0 focus:border-stone-400"
            placeholder="Task title" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyDown={handleKeyDown} />

          <textarea className="input h-20 resize-none text-sm" placeholder="Add a description…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            onKeyDown={handleKeyDown} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <Flag size={11} /> Status
              </label>
              <select className="input text-sm" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <Flag size={11} /> Priority
              </label>
              <select className="input text-sm" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <Calendar size={11} /> Start date
              </label>
              <input type="date" className="input text-sm" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <Calendar size={11} /> Due date
              </label>
              <input type="date" className="input text-sm" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              Repeat
            </label>
            <select className="input text-sm" value={form.recurrenceRule}
              onChange={e => setForm(f => ({ ...f, recurrenceRule: e.target.value }))}>
              <option value="">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <Tag size={11} /> Labels <span className="font-normal text-stone-400">(comma separated)</span>
            </label>
            <input className="input text-sm" placeholder="design, backend, urgent" value={form.labels}
              onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} />
          </div>

          <div className="space-y-1.5 relative">
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <UserIcon size={11} /> Assignee
            </label>
            <input className="input text-sm" placeholder="Search by name…" value={userQuery}
              onChange={e => { setUserQuery(e.target.value); setForm(f => ({ ...f, assigneeId: '' })) }} />
            {users.length > 0 && (
              <div className="absolute z-10 w-full card shadow-lg mt-1 py-1 overflow-hidden">
                {users.map(u => (
                  <button key={u.id}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    onClick={() => { setForm(f => ({ ...f, assigneeId: u.id })); setUserQuery(u.name); setUsers([]) }}>
                    <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-xs font-medium shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="text-stone-900 dark:text-stone-100">{u.name}</span>
                    <span className="text-stone-400 text-xs ml-auto">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
