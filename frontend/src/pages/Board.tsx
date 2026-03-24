import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { exportTasks } from '../api/export'
import KanbanBoard from '../components/KanbanBoard'
import GanttChart from '../components/GanttChart'
import FilterBar from '../components/FilterBar'
import type { Task } from 'shared'

type View = 'kanban' | 'gantt'

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('kanban')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const filterRef = useRef<HTMLInputElement>(null)

  const loadTasks = () => {
    const params = new URLSearchParams(filters).toString()
    client.get(`/projects/${projectId}/tasks${params ? `?${params}` : ''}`).then(r => setTasks(r.data))
  }

  useEffect(() => { loadTasks() }, [projectId, filters])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === '/') { e.preventDefault(); filterRef.current?.focus() }
      if (e.key === 'Escape') { filterRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 shadow flex-wrap">
        <button onClick={() => navigate('/')} className="text-blue-500 text-sm">← Back</button>
        <div className="flex gap-2 ml-auto flex-wrap items-center">
          <button onClick={() => navigate(`/projects/${projectId}/members`)}
            className="text-sm px-3 py-1 border dark:border-gray-600 rounded-lg">
            Members
          </button>
          <div className="flex gap-1">
            <button onClick={() => exportTasks(tasks, 'csv', `tasks-${projectId}`)}
              className="text-sm px-3 py-1 border dark:border-gray-600 rounded-lg">CSV</button>
            <button onClick={() => exportTasks(tasks, 'json', `tasks-${projectId}`)}
              className="text-sm px-3 py-1 border dark:border-gray-600 rounded-lg">JSON</button>
          </div>
          {(['kanban', 'gantt'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-sm ${view === v ? 'bg-blue-500 text-white' : 'border dark:border-gray-600'}`}>
              {v === 'kanban' ? 'Kanban' : 'Gantt'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <FilterBar onChange={setFilters} inputRef={filterRef} />
        {view === 'kanban'
          ? <KanbanBoard tasks={tasks} projectId={projectId!} onUpdate={loadTasks} />
          : <GanttChart tasks={tasks} />}
      </div>

      <div className="fixed bottom-3 right-4 text-xs text-gray-400 dark:text-gray-600 select-none">
        <kbd>/</kbd> search · <kbd>Esc</kbd> close
      </div>
    </div>
  )
}
