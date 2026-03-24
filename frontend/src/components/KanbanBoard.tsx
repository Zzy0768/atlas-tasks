import { useState } from 'react'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import client from '../api/client'
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from 'shared'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

interface Props {
  tasks: Task[]
  projectId: string
  onUpdate: () => void
}

export default function KanbanBoard({ tasks, projectId, onUpdate }: Props) {
  const [creating, setCreating] = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const sensors = useSensors(useSensor(PointerSensor))

  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s).sort((a, b) => a.order - b.order)

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const task = tasks.find(t => t.id === active.id)
    const target = tasks.find(t => t.id === over.id)
    if (!task || !target) return
    await client.patch(`/tasks/${task.id}/reorder`, { status: target.status, order: target.order })
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <span className="text-xs text-gray-400">{byStatus(col.id).length}</span>
            </div>
            <SortableContext items={byStatus(col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
              {byStatus(col.id).map(task => (
                <TaskCard key={task.id} task={task} projectId={projectId} onUpdate={onUpdate} />
              ))}
            </SortableContext>
            {creating === col.id ? (
              <div className="space-y-1">
                <input autoFocus className="input text-sm w-full" placeholder="Task title…"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createTask(col.id); if (e.key === 'Escape') setCreating(null) }} />
                <div className="flex gap-1">
                  <button onClick={() => createTask(col.id)} className="btn-primary text-xs px-2 py-1">Add</button>
                  <button onClick={() => setCreating(null)} className="text-xs px-2 py-1 text-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCreating(col.id)}
                className="w-full text-left text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1 py-0.5">
                + Add task
              </button>
            )}
          </div>
        ))}
      </div>
    </DndContext>
  )
}
