import { useState } from 'react'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, CircleDot } from 'lucide-react'
import client from '../api/client'
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from 'shared'

const COLUMNS: { id: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'todo', label: '待办', icon: <CircleDot size={14} className="text-gray-400" /> },
  { id: 'in_progress', label: '进行中', icon: <CircleDot size={14} className="text-blue-500 fill-blue-500/20" /> },
  { id: 'done', label: '已完成', icon: <CircleDot size={14} className="text-green-500 fill-green-500/20" /> },
]

interface Props { tasks: Task[]; projectId: string; onUpdate: () => void }

export default function KanbanBoard({ tasks, projectId, onUpdate }: Props) {
  const [creating, setCreating] = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s).sort((a, b) => a.order - b.order)

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return

    const task = tasks.find(t => t.id === active.id)
    if (!task) return

    const columnIds = COLUMNS.map(c => c.id)
    let newStatus: TaskStatus = task.status
    let newOrder = 0

    if (columnIds.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus
      newOrder = byStatus(newStatus).length
    } else {
      const target = tasks.find(t => t.id === over.id)
      if (!target) return
      newStatus = target.status
      newOrder = target.order
      if (task.status === newStatus && task.order < target.order) {
        newOrder -= 1
      }
    }

    await client.patch(`/tasks/${task.id}/reorder`, { status: newStatus, order: newOrder })
    onUpdate()
  }

  const createTask = async (status: TaskStatus) => {
    if (!newTitle.trim()) return
    await client.post(`/projects/${projectId}/tasks`, { title: newTitle, status })
    setNewTitle('')
    setCreating(null)
    onUpdate()
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6 px-6">
        {COLUMNS.map(col => {
          const colTasks = byStatus(col.id)
          return (
            <div id={col.id} key={col.id} className="flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setCreating(col.id); setNewTitle('') }}
                  className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} projectId={projectId} onUpdate={onUpdate} />
                  ))}
                </SortableContext>

                {/* Inline Create */}
                {creating === col.id ? (
                  <div className="card p-4 animate-fade-in">
                    <input
                      autoFocus
                      className="input-base mb-3"
                      placeholder="任务标题..."
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') createTask(col.id)
                        if (e.key === 'Escape') setCreating(null)
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => createTask(col.id)}
                        className="btn btn-primary flex-1 text-sm"
                      >
                        创建任务
                      </button>
                      <button
                        onClick={() => setCreating(null)}
                        className="btn btn-secondary"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setCreating(col.id); setNewTitle('') }}
                    className="flex items-center justify-center gap-2 py-3 px-4 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] rounded-2xl transition-all group"
                  >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    添加任务
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}
