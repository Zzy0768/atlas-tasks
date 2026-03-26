import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import client from '../api/client'
import type { Task } from 'shared'

interface Props { taskId: string; projectId: string; subtasks: Task[]; onUpdate: () => void }

export default function SubtaskList({ taskId, subtasks, onUpdate }: Props) {
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await client.post(`/projects/${projectId}/tasks`, { title, parentTaskId: taskId })
    setTitle(''); setAdding(false); onUpdate()
  }

  const toggle = async (sub: Task) => {
    await client.patch(`/tasks/${sub.id}`, { status: sub.status === 'done' ? 'todo' : 'done' })
    onUpdate()
  }

  const done = subtasks.filter(s => s.status === 'done').length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Subtasks {subtasks.length > 0 && <span className="font-normal normal-case tracking-normal">({done}/{subtasks.length})</span>}
        </p>
        <button onClick={() => setAdding(a => !a)}
          className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
          <Plus size={13} />
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-1">
          {subtasks.map(s => (
            <button key={s.id} onClick={() => toggle(s)}
              className="flex items-center gap-2 w-full text-left group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                s.status === 'done'
                  ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100'
                  : 'border-stone-300 dark:border-stone-600 group-hover:border-stone-500'
              }`}>
                {s.status === 'done' && <Check size={10} className="text-white dark:text-stone-900" strokeWidth={3} />}
              </div>
              <span className={`text-xs ${s.status === 'done' ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-300'}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {adding && (
        <form onSubmit={add} className="flex gap-1.5">
          <input autoFocus className="input text-xs py-1.5 flex-1" placeholder="Subtask title…"
            value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setAdding(false)} />
          <button type="submit" className="btn-primary text-xs px-2.5 py-1.5">Add</button>
        </form>
      )}
    </div>
  )
}
