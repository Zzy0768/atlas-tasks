import { useState } from 'react'

interface Props { onChange: (filters: Record<string, string>) => void }

export default function FilterBar({ onChange }: Props) {
  const [f, setF] = useState({ q: '', status: '', priority: '', label: '' })

  const update = (key: string, value: string) => {
    const next = { ...f, [key]: value }
    setF(next)
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v))
    onChange(clean)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input className="input text-sm w-40" placeholder="Search…" value={f.q}
        onChange={e => update('q', e.target.value)} />
      <select className="input text-sm" value={f.status} onChange={e => update('status', e.target.value)}>
        <option value="">All status</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <select className="input text-sm" value={f.priority} onChange={e => update('priority', e.target.value)}>
        <option value="">All priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input className="input text-sm w-28" placeholder="Label…" value={f.label}
        onChange={e => update('label', e.target.value)} />
    </div>
  )
}
