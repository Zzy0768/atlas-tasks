import { useState } from 'react'
import client from '../api/client'
import type { Task } from 'shared'

interface Props { taskId: string; subtasks: Task[]; onUpdate: () => void }

export default function SubtaskList({ taskId, subtasks, onUpdate }: Props) {
  const [title, setTitle] = useState('')

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await client.post(`/projects/placeholder/tasks`, { title, parentTaskId: taskId })
    setTitle('')
    onUpdate()
  }

  const toggle = async (sub: Task) => {
    await client.patch(`/tasks/${sub.id}`, { status: sub.status === 'done' ? 'todo' : 'done' })
    onUpdate()
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase">Subtasks</p>
      {subtasks.map(s => (
        <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={s.status === 'done'} onChange={() => toggle(s)} />
          <span className={s.status === 'done' ? 'line-through text-gray-400' : ''}>{s.title}</span>
        </label>
      ))}
      <form onSubmit={add} className="flex gap-1 mt-1">
        <input className="input text-xs flex-1" placeholder="Add subtask…" value={title}
          onChange={e => setTitle(e.target.value)} />
        <button type="submit" className="btn-primary text-xs px-2 py-1">+</button>
      </form>
    </div>
  )
}
