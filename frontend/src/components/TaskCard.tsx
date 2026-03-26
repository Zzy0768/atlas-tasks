import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2, Flag, Tag, Calendar, ChevronDown, Clock } from 'lucide-react'
import client from '../api/client'
import TaskComments from './TaskComments'
import SubtaskList from './SubtaskList'
import TaskModal from './TaskModal'
import type { Task } from 'shared'

interface Props {
  task: Task
  projectId: string
  onUpdate: () => void
}

export default function TaskCard({ task, projectId, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task' },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('删除此任务？')) return
    try {
      await client.delete(`/tasks/${task.id}`)
      onUpdate()
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return 'badge-low'
      case 'medium': return 'badge-medium'
      case 'high': return 'badge-high'
      default: return 'badge-member'
    }
  }

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="card p-4 group animate-fade-in"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 mb-3 cursor-grab active:cursor-grabbing" {...listeners}>
            <h3
              className={`flex-1 text-sm font-medium leading-relaxed ${
                task.status === 'done'
                  ? 'text-[var(--text-tertiary)] line-through'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-no-dnd="true"
              onClick={handleEdit}
              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
            >
              <Pencil size={14} />
            </button>
            <button
              data-no-dnd="true"
              onClick={handleDelete}
              className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={getPriorityBadge(task.priority)}>
              <Flag size={11} />
              {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : '高'}
            </span>
            {task.labels.slice(0, 3).map(label => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border border-[var(--border-color)]"
              >
                <Tag size={9} />
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <span className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
                  <Calendar size={13} />
                  {new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {totalSubtasks > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                  <Clock size={13} />
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
            </div>
            {task.assignee && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                {task.assignee.name[0].toUpperCase()}
              </div>
            )}
          </div>

          <button
            data-no-dnd="true"
            onClick={() => setExpanded(e => !e)}
            className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]"
          >
            <ChevronDown size={14} className={expanded ? 'rotate-180' : 'transition-transform'} />
            {expanded ? '收起详情' : '查看详情'}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-4 animate-slide-in">
            <SubtaskList taskId={task.id} projectId={projectId} subtasks={task.subtasks || []} onUpdate={onUpdate} />
            <TaskComments taskId={task.id} />
          </div>
        )}

        {totalSubtasks > 0 && !expanded && (
          <div className="mt-3 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        )}
      </div>

      {editing && (
        <TaskModal task={task} projectId={projectId} onClose={() => setEditing(false)} onUpdate={onUpdate} />
      )}
    </>
  )
}
