import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, LayoutGrid, GanttChartSquare, Users, Download, Bell, X } from 'lucide-react'
import client from '../api/client'
import { exportTasks } from '../api/export'
import KanbanBoard from '../components/KanbanBoard'
import GanttChart from '../components/GanttChart'
import FilterBar from '../components/FilterBar'
import AdvancedSearchFilter from '../components/AdvancedSearchFilter'
import StatsPanel from '../components/StatsPanel'
import EnhancedKanbanColumn from '../components/EnhancedKanbanColumn'
import TaskDetailModal from '../components/TaskDetailModal'
import type { Task, ProjectStats, User, TaskStatus, Priority } from 'shared'

type View = 'kanban' | 'gantt'

interface FilterState {
  q: string
  status: TaskStatus | ''
  priority: Priority | ''
  assigneeId: string | ''
  label: string
  dueDate: 'today' | 'tomorrow' | 'week' | 'overdue' | ''
  sortBy: 'created' | 'updated' | 'due' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('kanban')
  const [filters, setFilters] = useState<Partial<FilterState>>({})
  const [projectName, setProjectName] = useState('')
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectMembers, setProjectMembers] = useState<User[]>([])
  const [availableLabels, setAvailableLabels] = useState<string[]>([])
  const filterRef = useRef<HTMLInputElement>(null)

  const filtersToParams = (filters: Partial<FilterState>) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    })
    return params.toString()
  }

  const loadTasks = () => {
    setIsLoading(true)
    const params = filtersToParams(filters)
    client.get(`/projects/${projectId}/tasks${params ? `?${params}` : ''}`)
      .then(r => {
        const updatedTasks = r.data
        setTasks(updatedTasks)
        // 如果当前有选中的任务，更新它
        if (selectedTask) {
          const updatedSelectedTask = updatedTasks.find((t: Task) => t.id === selectedTask.id)
          if (updatedSelectedTask) {
            setSelectedTask(updatedSelectedTask)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  const loadStats = () => {
    client.get(`/projects/${projectId}/stats`)
      .then(r => setProjectStats(r.data))
      .catch(() => setProjectStats(null))
  }

  const loadProjectMembers = () => {
    if (!projectId) return
    client.get(`/projects/${projectId}`)
      .then(r => {
        console.log('Project members data:', r.data.members)
        const members = r.data.members.map((m: any) => m.user)
        console.log('Extracted users:', members)
        setProjectMembers(members)
      })
      .catch((error) => {
        console.error('Failed to load project members:', error)
        setProjectMembers([])
      })
  }

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleEditTask = (task: Task) => {
    // 这里可以打开编辑模态框或直接编辑
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleCreateTask = (status: string) => {
    // 创建新任务
    const title = prompt('输入任务标题:')
    if (!title || !projectId) return

    client.post(`/projects/${projectId}/tasks`, {
      title,
      status,
    }).then(() => {
      loadTasks()
      loadStats()
    })
  }

  // 按状态分组任务
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }

  // 计算活动筛选条件数量（排除空值和排序相关）
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    return value !== '' && value !== null && value !== undefined
  }).length

  useEffect(() => {
    if (!projectId) return
    client.get(`/projects/${projectId}`).then(r => setProjectName(r.data.name))
    loadStats()
    loadProjectMembers()
  }, [projectId])

  useEffect(() => { loadTasks() }, [projectId, filters])

  useEffect(() => {
    if (tasks.length > 0) {
      loadStats()
      // 提取所有任务中的唯一标签
      const allLabels = tasks.flatMap(task => task.labels || [])
      const uniqueLabels = [...new Set(allLabels)]
      setAvailableLabels(uniqueLabels)
    }
  }, [tasks])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowFilters(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowFilters(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all -ml-2"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate flex-1">
            {projectName}
          </h1>

          <div className="flex items-center gap-2">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(e => !e)}
              className={`p-2 rounded-lg transition-all relative ${
                showFilters
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Filter size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-xs font-medium bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-1">
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  view === 'kanban'
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-subtle'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LayoutGrid size={13} />
                看板
              </button>
              <button
                onClick={() => setView('gantt')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  view === 'gantt'
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-subtle'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GanttChartSquare size={13} />
                时间线
              </button>
            </div>

            <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

            {/* Actions */}
            <button
              onClick={() => navigate(`/projects/${projectId}/members`)}
              className="btn btn-secondary text-sm"
            >
              <Users size={16} />
              成员
            </button>

            <div className="relative">
              <button className="btn btn-secondary text-sm">
                <Download size={16} />
                导出
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] animate-slide-in">
            <div className="max-w-[1400px] mx-auto px-6 py-4">
              <AdvancedSearchFilter
                onFilterChange={setFilters}
                availableAssignees={projectMembers.map(member => ({
                  id: member.id,
                  name: member.name,
                }))}
                availableLabels={availableLabels}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stats Panel */}
        {projectStats && (
          <StatsPanel
            stats={projectStats}
            isLoading={isLoading}
          />
        )}

        {/* View Content */}
        {view === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['todo', 'in_progress', 'done'] as const).map(status => (
              <EnhancedKanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                projectId={projectId!}
                onUpdate={loadTasks}
                onEditTask={handleEditTask}
                onViewTaskDetails={handleViewTaskDetails}
                onCreateTask={handleCreateTask}
                isLoading={isLoading}
              />
            ))}
          </div>
        ) : (
          <GanttChart tasks={tasks} />
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={showTaskDetail}
            onClose={() => {
              setShowTaskDetail(false)
              setSelectedTask(null)
            }}
            onUpdate={() => {
              loadTasks()
              loadStats()
            }}
            onEdit={handleEditTask}
            projectMembers={projectMembers}
          />
        )}
      </main>
    </div>
  )
}
