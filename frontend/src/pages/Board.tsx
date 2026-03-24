import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
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

  const loadTasks = () => {
    const params = new URLSearchParams(filters).toString()
    client.get(`/projects/${projectId}/tasks${params ? `?${params}` : ''}`).then(r => setTasks(r.data))
  }

  useEffect(() => { loadTasks() }, [projectId, filters])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <button onClick={() => navigate('/')} className="text-blue-500 text-sm">← Back</button>
        <div className="flex gap-2 ml-auto">
          {(['kanban', 'gantt'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-sm ${view === v ? 'bg-blue-500 text-white' : 'border dark:border-gray-600'}`}>
              {v === 'kanban' ? 'Kanban' : 'Gantt'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <FilterBar onChange={setFilters} />
        {view === 'kanban'
          ? <KanbanBoard tasks={tasks} projectId={projectId!} onUpdate={loadTasks} />
          : <GanttChart tasks={tasks} />}
      </div>
    </div>
  )
}
