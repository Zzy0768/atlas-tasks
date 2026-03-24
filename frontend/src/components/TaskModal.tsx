import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Task, User } from 'shared'

interface Props {
  task: Task
  projectId: string
  onClose: () => void
  onUpdate: () => void
}

const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES = ['todo', 'in_progress', 'done'] as const

export default function TaskModal({ task, projectId, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    labels: task.labels.join(', '),
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    startDate: task.startDate ? task.startDate.slice(0, 10) : '',
    assigneeId: task.assigneeId || '',
  })
  const [users, setUsers] = useState<User[]>([])
  const [userQuery, setUserQuery] = useState(task.assignee?.name || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userQuery.length < 1) return setUsers([])
    const t = setTimeout(() =>
      client.get(`/users/search?q=${userQuery}`).then(r => setUsers(r.data)), 300)
    return () => clearTimeout(t)
  }, [userQuery])

  const save = async () => {
    setSaving(true)
    await client.patch(`/tasks/${task.id}`, {
      ...form,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
      dueDate: form.dueDate || null,
      startDate: form.startDate || null,
      assigneeId: form.assigneeId || null,
    })
    setSaving(false)
    onUpdate()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <input className="input w-full" placeholder="Title" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

        <textarea className="input w-full h-24 resize-none" placeholder="Description…"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select className="input w-full" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Priority</label>
            <select className="input w-full" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
            <input type="date" className="input w-full" value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
            <input type="date" className="input w-full" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Labels (comma separated)</label>
          <input className="input w-full" placeholder="bug, feature, urgent" value={form.labels}
            onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} />
        </div>

        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
          <input className="input w-full" placeholder="Search user…" value={userQuery}
            onChange={e => { setUserQuery(e.target.value); setForm(f => ({ ...f, assigneeId: '' })) }} />
          {users.length > 0 && (
            <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow mt-1">
              {users.map(u => (
                <button key={u.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => { setForm(f => ({ ...f, assigneeId: u.id })); setUserQuery(u.name); setUsers([]) }}>
                  {u.name} <span className="text-gray-400">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
