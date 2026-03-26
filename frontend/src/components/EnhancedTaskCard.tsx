import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  Tag,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Link,
  AlertCircle,
} from 'lucide-react'
import client from '../api/client'
import MemberAvatar from './MemberAvatar'
import type { Task, User as UserType } from 'shared'

interface EnhancedTaskCardProps {
  task: Task
  projectId: string
  onUpdate: () => void
  onEdit?: (task: Task) => void
  onViewDetails?: (task: Task) => void
  showProjectName?: boolean
}

export default function EnhancedTaskCard({
  task,
  projectId,
  onUpdate,
  onEdit,
  onViewDetails,
  showProjectName = false,
}: EnhancedTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Calculate task status
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  // Calculate days until due
  const getDueDateText = () => {
    if (!task.dueDate) return null
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天到期'
    if (diffDays === 1) return '明天到期'
    if (diffDays > 1) return `${diffDays}天后到期`
    if (diffDays === -1) return '昨天到期'
    return `${Math.abs(diffDays)}天前到期`
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-3 h-3 text-[var(--accent-danger)] fill-[var(--accent-danger)]" />
      case 'medium':
        return <Flag className="w-3 h-3 text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
      case 'low':
        return <Flag className="w-3 h-3 text-[var(--accent-success)] fill-[var(--accent-success)]" />
      default:
        return <Flag className="w-3 h-3 text-[var(--text-tertiary)]" />
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'border-l-[var(--status-todo-text)]'
      case 'in_progress':
        return 'border-l-[var(--status-in-progress-text)]'
      case 'done':
        return 'border-l-[var(--status-done-text)]'
      default:
        return 'border-l-[var(--border-color)]'
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个任务吗？此操作无法撤销。')) return

    setIsDeleting(true)
    try {
      await client.delete(`/tasks/${task.id}`)
      onUpdate()
    } catch (err) {
      console.error('删除任务失败:', err)
      alert('删除任务失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewDetails) {
      onViewDetails(task)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative ${getStatusColor()} border-l-4`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`card p-4 transition-all duration-300 ${
          isDragging ? 'scale-95 rotate-1' : ''
        } ${isHovered ? 'shadow-card-hover border-[var(--border-hover)]' : ''}`}
      >
        {/* Drag handle - only visible on hover */}
        <div
          className={`absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-1 h-8 bg-[var(--border-color)] rounded-full transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } cursor-grab active:cursor-grabbing`}
          {...listeners}
        />

        {/* Task header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${task.status === 'todo' ? 'badge-todo' : task.status === 'in_progress' ? 'badge-in-progress' : 'badge-done'}`}>
                {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
              </span>
              {isOverdue && (
                <span className="badge bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border-[var(--accent-danger)]/20">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  已逾期
                </span>
              )}
            </div>

            <h3
              className={`text-sm font-medium mb-2 line-clamp-2 ${
                task.status === 'done'
                  ? 'text-[var(--text-tertiary)] line-through'
                  : 'text-[var(--text-primary)]'
              }`}
              onClick={handleViewDetails}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-1.5 rounded-lg transition-colors ${
                showActions || isHovered
                  ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                  : 'text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100'
              }`}
              onBlur={() => setTimeout(() => setShowActions(false), 200)}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 animate-scale-in">
                <button
                  onClick={handleViewDetails}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Link className="w-4 h-4" />
                  查看详情
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  编辑任务
                </button>
                <div className="h-px bg-[var(--border-color)] my-1" />
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? '删除中...' : '删除任务'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Priority */}
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[var(--bg-tertiary)] rounded-lg">
            {getPriorityIcon(task.priority)}
            <span className="text-[var(--text-secondary)]">
              {task.priority === 'low' ? '低优先级' : task.priority === 'medium' ? '中优先级' : '高优先级'}
            </span>
          </div>

          {/* Labels */}
          {task.labels.slice(0, 2).map(label => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg"
            >
              <Tag className="w-3 h-3" />
              {label}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-xs text-[var(--text-tertiary)]">
              +{task.labels.length - 2}
            </span>
          )}
        </div>

        {/* Progress bar for subtasks */}
        {totalSubtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
              <span>子任务进度</span>
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-3.5 h-3.5 ${
                  isOverdue ? 'text-[var(--accent-danger)]' : 'text-[var(--text-tertiary)]'
                }`} />
                <span className={`text-xs ${isOverdue ? 'text-[var(--accent-danger)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                  {new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  <span className="ml-1 text-[var(--text-tertiary)]">
                    {getDueDateText()}
                  </span>
                </span>
              </div>
            )}

            {/* Comments count */}
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-tertiary)]">
                {task.comments?.length || 0}
              </span>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <MemberAvatar
                user={task.assignee}
                size="sm"
                showOnlineStatus
                isOnline={Math.random() > 0.5} // Mock online status
              />
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-lg">
                <User className="w-3 h-3" />
                未分配
              </div>
            )}
          </div>
        </div>

        {/* Quick view button */}
        <button
          onClick={handleViewDetails}
          className={`absolute bottom-4 right-4 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}