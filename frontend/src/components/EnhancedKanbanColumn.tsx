import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreVertical, CircleDot, Target, CheckCircle } from 'lucide-react'
import EnhancedTaskCard from './EnhancedTaskCard'
import type { Task, TaskStatus } from 'shared'

interface EnhancedKanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  projectId: string
  onUpdate: () => void
  onEditTask: (task: Task) => void
  onViewTaskDetails: (task: Task) => void
  onCreateTask: (status: TaskStatus) => void
  isLoading?: boolean
}

const COLUMN_CONFIG = {
  todo: {
    label: '待办',
    icon: <CircleDot className="w-4 h-4 text-gray-400" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-200 dark:border-gray-800',
    emptyIcon: <CircleDot className="w-12 h-12 text-gray-300 dark:text-gray-700" />,
    emptyText: '暂无待办任务',
    emptyDescription: '创建一个新任务开始工作',
  },
  in_progress: {
    label: '进行中',
    icon: <Target className="w-4 h-4 text-blue-500 fill-blue-500/20" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-900',
    emptyIcon: <Target className="w-12 h-12 text-blue-300 dark:text-blue-900" />,
    emptyText: '暂无进行中的任务',
    emptyDescription: '将任务拖拽到这里开始工作',
  },
  done: {
    label: '已完成',
    icon: <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
    emptyIcon: <CheckCircle className="w-12 h-12 text-emerald-300 dark:text-emerald-900" />,
    emptyText: '暂无已完成的任务',
    emptyDescription: '完成的任务将显示在这里',
  },
}

export default function EnhancedKanbanColumn({
  status,
  tasks,
  projectId,
  onUpdate,
  onEditTask,
  onViewTaskDetails,
  onCreateTask,
  isLoading = false,
}: EnhancedKanbanColumnProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const config = COLUMN_CONFIG[status]
  const taskCount = tasks.length
  const completedCount = status === 'done' ? taskCount : 0
  const completionRate = status === 'done' ? 100 : status === 'in_progress' ? 50 : 0

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return
    onCreateTask(status)
    setNewTitle('')
    setIsCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateTask()
    }
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewTitle('')
    }
  }

  if (isLoading) {
    return (
      <div className={`kanban-column border ${config.borderColor}`}>
        <div className="kanban-column-header">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded"></div>
            <div className="skeleton w-16 h-5"></div>
            <div className="skeleton w-8 h-5 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse-subtle">
              <div className="skeleton w-3/4 h-4 mb-2"></div>
              <div className="skeleton w-1/2 h-3 mb-3"></div>
              <div className="skeleton w-full h-2 mb-2"></div>
              <div className="flex justify-between">
                <div className="skeleton w-16 h-4"></div>
                <div className="skeleton w-8 h-8 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`kanban-column border ${config.borderColor}`}>
      {/* Sticky header */}
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              {config.label}
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
                {taskCount}
              </span>
            </h3>
            {/* Progress indicator */}
            {(status === 'in_progress' || status === 'done') && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: status === 'done'
                        ? 'var(--accent-success)'
                        : 'var(--accent-secondary)',
                    }}
                  />
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {completionRate}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
            title="添加任务"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all relative"
          >
            <MoreVertical className="w-4 h-4" />
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 animate-scale-in">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  排序方式
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  隐藏已完成
                </button>
                <div className="h-px bg-[var(--border-color)] my-1" />
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10 transition-colors">
                  清空列
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Task creation form */}
      {isCreating && (
        <div className="mb-3 animate-fade-in">
          <div className="card p-3">
            <input
              autoFocus
              className="input text-sm mb-2"
              placeholder="任务标题..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateTask}
                className="btn btn-primary flex-1 text-sm py-1.5"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewTitle('')
                }}
                className="btn btn-ghost text-sm py-1.5"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto pr-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <EnhancedTaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                onUpdate={onUpdate}
                onEdit={onEditTask}
                onViewDetails={onViewTaskDetails}
                style={{ animationDelay: `${index * 30}ms` }}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isCreating && (
          <div className="empty-state my-4">
            <div className="mb-3">{config.emptyIcon}</div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
              {config.emptyText}
            </h4>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              {config.emptyDescription}
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-ghost text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              创建任务
            </button>
          </div>
        )}

        {/* Add task button (when not creating) */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] rounded-xl transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            添加任务
          </button>
        )}
      </div>

      {/* Column footer stats */}
      {tasks.length > 0 && (
        <div className="pt-3 mt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <span>总计: {taskCount} 个任务</span>
            {status === 'done' && (
              <span className="text-[var(--accent-success)] font-medium">
                {completedCount} 已完成
              </span>
            )}
            {status === 'in_progress' && (
              <span className="text-[var(--accent-secondary)] font-medium">
                {completionRate}% 进度
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}