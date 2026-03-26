import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

interface Props {
  onChange: (filters: Record<string, string>) => void
  inputRef?: React.RefObject<HTMLInputElement>
  filters: Record<string, string>
}

export default function FilterBar({ onChange, filters }: Props) {
  const [f, setF] = useState({ q: filters.q || '', status: filters.status || '', priority: filters.priority || '', label: filters.label || '' })

  useEffect(() => {
    setF({ q: filters.q || '', status: filters.status || '', priority: filters.priority || '', label: filters.label || '' })
  }, [filters])

  const update = (key: string, value: string) => {
    const next = { ...f, [key]: value }
    setF(next)
    onChange(Object.fromEntries(Object.entries(next).filter(([, v]) => v)))
  }

  const clearAll = () => {
    const empty = { q: '', status: '', priority: '', label: '' }
    setF(empty)
    onChange({})
  }

  const activeCount = Object.values(f).filter(Boolean).length

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
        <Filter size={14} />
        筛选条件
      </div>

      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <select
          className="px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all cursor-pointer appearance-none pr-8"
          value={f.status}
          onChange={e => update('status', e.target.value)}
        >
          <option value="">所有状态</option>
          <option value="todo">待办</option>
          <option value="in_progress">进行中</option>
          <option value="done">已完成</option>
        </select>

        {/* Priority Filter */}
        <select
          className="px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all cursor-pointer appearance-none pr-8"
          value={f.priority}
          onChange={e => update('priority', e.target.value)}
        >
          <option value="">所有优先级</option>
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>

        {/* Label Filter */}
        <input
          className="w-32 px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
          placeholder="标签筛选..."
          value={f.label}
          onChange={e => update('label', e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
        >
          <X size={12} />
          清除筛选 ({activeCount})
        </button>
      )}
    </div>
  )
}
