import { useState, useEffect } from 'react'
import {
  X,
  Pencil,
  Trash2,
  Flag,
  Tag,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  ListChecks,
  History,
  Link,
  Copy,
  Share2,
  MoreVertical,
  Plus,
  Send,
  AlertCircle,
} from 'lucide-react'
import client from '../api/client'
import MemberAvatar from './MemberAvatar'
import type { Task, Comment, ActivityLog, User as UserType } from 'shared'

interface TaskDetailModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  onEdit?: (task: Task) => void
  projectMembers?: Array<{ id: string; name: string }>
}

type TabType = 'details' | 'subtasks' | 'comments' | 'activity'

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onEdit,
  projectMembers = [],
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)

  // Debug log for project members
  useEffect(() => {
    console.log('TaskDetailModal projectMembers:', projectMembers)
  }, [projectMembers])
  const [comments, setComments] = useState<Comment[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load comments and activity logs
  useEffect(() => {
    if (isOpen && task) {
      loadComments()
      loadActivityLogs()
    }
  }, [isOpen, task])

  // 清理任务数据，将 null 转换为 undefined（除了后端允许 nullable 的字段）
  const cleanTaskData = (taskData: Task): Task => {
    return {
      ...taskData,
      description: taskData.description === null ? undefined : taskData.description,
      // 其他字段保持不变，因为后端对 dueDate、startDate、assigneeId、recurrenceRule 允许 null
    }
  }

  // Update editedTask when task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask(cleanTaskData(task))
      setIsEditing(false)
    }
  }, [task])

  const loadComments = async () => {
    try {
      const { data } = await client.get(`/tasks/${task.id}/comments`)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const loadActivityLogs = async () => {
    try {
      const { data } = await client.get(`/tasks/${task.id}/activity`)
      setActivityLogs(data)
    } catch (error) {
      console.error('Failed to load activity logs:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 构建更新请求对象，正确处理 null/undefined 值
      const updateData: Record<string, any> = {}

      // 只添加有值的字段（undefined 不发送）
      if (editedTask.title !== undefined) updateData.title = editedTask.title
      if (editedTask.description !== undefined) {
        // 如果 description 是 null，转换为 undefined（后端期望 string 或 undefined）
        updateData.description = editedTask.description === null ? undefined : editedTask.description
      }
      if (editedTask.status !== undefined) updateData.status = editedTask.status
      if (editedTask.priority !== undefined) updateData.priority = editedTask.priority
      if (editedTask.labels !== undefined) updateData.labels = editedTask.labels
      if (editedTask.dueDate !== undefined) updateData.dueDate = editedTask.dueDate
      if (editedTask.startDate !== undefined) updateData.startDate = editedTask.startDate
      if (editedTask.assigneeId !== undefined) updateData.assigneeId = editedTask.assigneeId
      if (editedTask.recurrenceRule !== undefined) updateData.recurrenceRule = editedTask.recurrenceRule

      console.log('Sending update data:', updateData)
      const response = await client.patch(`/tasks/${task.id}`, updateData)
      console.log('Update response:', response.data)
      onUpdate()
      setIsEditing(false)
    } catch (error: any) {
      console.error('Failed to update task:', error)
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details)
      }
      alert('更新任务失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await client.delete(`/tasks/${task.id}`)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('删除任务失败，请重试')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const { data } = await client.post(`/tasks/${task.id}/comments`, {
        content: newComment,
      })
      setComments(prev => [...prev, data])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('添加评论失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return

    setIsLoading(true)
    try {
      await client.post(`/projects/${task.projectId}/tasks`, {
        title: newSubtask,
        parentTaskId: task.id,
      })
      onUpdate()
      setNewSubtask('')
    } catch (error) {
      console.error('Failed to add subtask:', error)
      alert('添加子任务失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    try {
      await client.patch(`/tasks/${subtaskId}`, {
        status: currentStatus === 'done' ? 'todo' : 'done',
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 dark:text-rose-400'
      case 'medium': return 'text-amber-600 dark:text-amber-400'
      case 'low': return 'text-emerald-600 dark:text-emerald-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
      case 'medium': return <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'low': return <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      default: return <Flag className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-600 dark:text-gray-400'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400'
      case 'done': return 'text-emerald-600 dark:text-emerald-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未设置'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const calculateDueStatus = () => {
    if (!task.dueDate) return null
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0 && task.status !== 'done') {
      return { text: '已逾期', color: 'text-rose-600 dark:text-rose-400' }
    }
    if (diffDays === 0) {
      return { text: '今天到期', color: 'text-amber-600 dark:text-amber-400' }
    }
    if (diffDays === 1) {
      return { text: '明天到期', color: 'text-amber-600 dark:text-amber-400' }
    }
    if (diffDays <= 7) {
      return { text: `${diffDays}天后到期`, color: 'text-blue-600 dark:text-blue-400' }
    }
    return null
  }

  const dueStatus = calculateDueStatus()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl shadow-modal overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                task.status === 'todo' ? 'bg-gray-100 dark:bg-gray-800' :
                task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' :
                'bg-emerald-100 dark:bg-emerald-900'
              }`}>
                {getPriorityIcon(task.priority)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {isEditing ? (
                    <input
                      className="text-lg font-semibold bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none"
                      value={editedTask.title}
                      onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                    />
                  ) : (
                    task.title
                  )}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isEditing ? (
                    <select
                      value={editedTask.status}
                      onChange={e => setEditedTask({ ...editedTask, status: e.target.value as 'todo' | 'in_progress' | 'done' })}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    >
                      <option value="todo">待办</option>
                      <option value="in_progress">进行中</option>
                      <option value="done">已完成</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.status === 'todo' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                      task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' :
                      'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
                    </span>
                  )}
                  {isEditing ? (
                    <select
                      value={editedTask.priority}
                      onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    >
                      <option value="low">低优先级</option>
                      <option value="medium">中优先级</option>
                      <option value="high">高优先级</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)} bg-opacity-10`}>
                      {getPriorityIcon(task.priority)}
                      <span className="ml-1">
                        {task.priority === 'low' ? '低优先级' : task.priority === 'medium' ? '中优先级' : '高优先级'}
                      </span>
                    </span>
                  )}
                  {dueStatus && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dueStatus.color} bg-opacity-10`}>
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {dueStatus.text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-[var(--text-secondary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col md:flex-row h-[calc(90vh-8rem)]">
            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-[var(--border-color)] mb-6">
                {([
                  { id: 'details', label: '详情', icon: <ListChecks className="w-4 h-4" /> },
                  { id: 'subtasks', label: '子任务', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { id: 'comments', label: '评论', icon: <MessageSquare className="w-4 h-4" /> },
                  { id: 'activity', label: '活动记录', icon: <History className="w-4 h-4" /> },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="animate-fade-in">
                {/* Details tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">描述</h3>
                      {isEditing ? (
                        <textarea
                          className="textarea w-full"
                          value={editedTask.description || ''}
                          onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                          rows={4}
                          placeholder="添加任务描述..."
                        />
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                          {task.description || '暂无描述'}
                        </p>
                      )}
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Due date */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                          <Calendar className="w-3 h-3" />
                          截止日期
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            className="input"
                            value={editedTask.dueDate?.slice(0, 10) || ''}
                            onChange={e => setEditedTask({
                              ...editedTask,
                              dueDate: e.target.value ? e.target.value : null,
                            })}
                          />
                        ) : (
                          <p className="text-sm text-[var(--text-primary)]">
                            {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>

                      {/* Start date */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                          <Clock className="w-3 h-3" />
                          开始日期
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            className="input"
                            value={editedTask.startDate?.slice(0, 10) || ''}
                            onChange={e => setEditedTask({
                              ...editedTask,
                              startDate: e.target.value ? e.target.value : null,
                            })}
                          />
                        ) : (
                          <p className="text-sm text-[var(--text-primary)]">
                            {formatDate(task.startDate)}
                          </p>
                        )}
                      </div>

                      {/* Assignee */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                          <User className="w-3 h-3" />
                          负责人
                        </label>
                        {isEditing ? (
                          <>
                            <select
                              value={editedTask.assigneeId || ''}
                              onChange={e => setEditedTask({
                                ...editedTask,
                                assigneeId: e.target.value || null
                              })}
                              className="input"
                              disabled={projectMembers.length === 0}
                            >
                              <option value="">未分配</option>
                              {projectMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                            {projectMembers.length === 0 && (
                              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                暂无项目成员可分配
                              </p>
                            )}
                          </>
                        ) : task.assignee ? (
                          <div className="flex items-center gap-2">
                            <MemberAvatar user={task.assignee} size="sm" />
                            <span className="text-sm text-[var(--text-primary)]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--text-tertiary)]">未分配</p>
                        )}
                      </div>

                      {/* Labels */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                          <Tag className="w-3 h-3" />
                          标签
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="input"
                            value={editedTask.labels?.join(', ') || ''}
                            onChange={e => setEditedTask({
                              ...editedTask,
                              labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean),
                            })}
                            placeholder="用逗号分隔标签"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {task.labels.length > 0 ? (
                              task.labels.map(label => (
                                <span
                                  key={label}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg"
                                >
                                  <Tag className="w-3 h-3" />
                                  {label}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-[var(--text-tertiary)]">无标签</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Created info */}
                    <div className="pt-4 border-t border-[var(--border-color)]">
                      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                        <div>
                          创建于 {formatDate(task.createdAt)} · 由{' '}
                          <span className="text-[var(--text-secondary)]">{task.owner.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button className="flex items-center gap-1 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                            <Link className="w-3 h-3" />
                          </button>
                          <button className="flex items-center gap-1 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtasks tab */}
                {activeTab === 'subtasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        子任务 ({task.subtasks?.length || 0})
                      </h3>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {task.subtasks?.filter(s => s.status === 'done').length || 0} / {task.subtasks?.length || 0} 完成
                      </div>
                    </div>

                    {/* Progress bar */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-4">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(task.subtasks.filter(s => s.status === 'done').length / task.subtasks.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Subtasks list */}
                    <div className="space-y-2">
                      {task.subtasks && task.subtasks.length > 0 ? (
                        task.subtasks.map(subtask => (
                          <div
                            key={subtask.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                          >
                            <button
                              onClick={() => handleToggleSubtask(subtask.id, subtask.status)}
                              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                subtask.status === 'done'
                                  ? 'bg-[var(--accent-success)] border-[var(--accent-success)]'
                                  : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                              }`}
                            >
                              {subtask.status === 'done' && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <span className={`flex-1 text-sm ${
                              subtask.status === 'done'
                                ? 'line-through text-[var(--text-tertiary)]'
                                : 'text-[var(--text-primary)]'
                            }`}>
                              {subtask.title}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              subtask.status === 'done'
                                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                                : subtask.status === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {subtask.status === 'todo' ? '待办' : subtask.status === 'in_progress' ? '进行中' : '已完成'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state py-8">
                          <CheckCircle2 className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
                          <p className="text-sm text-[var(--text-tertiary)]">暂无子任务</p>
                        </div>
                      )}
                    </div>

                    {/* Add subtask form */}
                    <div className="pt-4 border-t border-[var(--border-color)]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder="添加新的子任务..."
                          value={newSubtask}
                          onChange={e => setNewSubtask(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !isLoading) {
                              handleAddSubtask()
                            }
                          }}
                          disabled={isLoading}
                        />
                        <button
                          onClick={handleAddSubtask}
                          disabled={isLoading || !newSubtask.trim()}
                          className="btn btn-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    {/* Comments list */}
                    <div className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <MemberAvatar
                              user={comment.author}
                              size="sm"
                              showTooltip={false}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="text-sm font-medium text-[var(--text-primary)]">
                                    {comment.author.name}
                                  </span>
                                  <span className="text-xs text-[var(--text-tertiary)] ml-2">
                                    {new Date(comment.createdAt).toLocaleDateString('zh-CN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <button className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state py-8">
                          <MessageSquare className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
                          <p className="text-sm text-[var(--text-tertiary)]">暂无评论</p>
                        </div>
                      )}
                    </div>

                    {/* Add comment form */}
                    <div className="pt-4 border-t border-[var(--border-color)]">
                      <div className="flex gap-2">
                        <textarea
                          className="textarea flex-1"
                          placeholder="添加评论..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-[var(--text-tertiary)]">
                          按 Ctrl+Enter 发送
                        </div>
                        <button
                          onClick={handleAddComment}
                          disabled={isLoading || !newComment.trim()}
                          className="btn btn-primary"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          发送评论
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {activityLogs.length > 0 ? (
                      <div className="space-y-3">
                        {activityLogs.map(log => (
                          <div key={log.id} className="flex gap-3">
                            <div className="relative">
                              <MemberAvatar
                                user={log.user}
                                size="sm"
                                showTooltip={false}
                              />
                              <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--accent-primary)] rounded-full border border-white dark:border-[var(--bg-primary)]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                  {log.user.name}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                  {new Date(log.createdAt).toLocaleDateString('zh-CN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {log.action === 'created' && '创建了任务'}
                                {log.action === 'updated' && '更新了任务'}
                                {log.action === 'commented' && '添加了评论'}
                                {log.metadata && typeof log.metadata === 'object' && 'changes' in log.metadata && (
                                  <span className="text-[var(--text-tertiary)]">
                                    {Object.keys(log.metadata.changes || {}).join(', ')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state py-8">
                        <History className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
                        <p className="text-sm text-[var(--text-tertiary)]">暂无活动记录</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[var(--border-color)] p-6">
              <div className="space-y-6">
                {/* Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">操作</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => onEdit?.(task)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      编辑任务
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                      复制任务
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                      <Link className="w-4 h-4" />
                      创建链接
                    </button>
                  </div>
                </div>

                {/* Task info */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">任务信息</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">任务ID</div>
                      <div className="text-sm text-[var(--text-primary)] font-mono">{task.id.slice(0, 8)}...</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">创建时间</div>
                      <div className="text-sm text-[var(--text-primary)]">
                        {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">最后更新</div>
                      <div className="text-sm text-[var(--text-primary)]">
                        {new Date(task.updatedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button for edit mode */}
                {isEditing && (
                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="btn btn-primary flex-1"
                      >
                        {isLoading ? '保存中...' : '保存更改'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedTask(task)
                        }}
                        className="btn btn-ghost"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop animate-fade-in" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-scale-in">
            <div className="w-full max-w-md bg-[var(--bg-primary)] rounded-2xl shadow-modal p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">删除任务</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                确定要删除任务 <span className="font-medium text-[var(--text-primary)]">"{task.title}"</span> 吗？
                此操作无法撤销，所有子任务、评论和活动记录也将被删除。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="btn btn-danger flex-1"
                >
                  {isLoading ? '删除中...' : '删除任务'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="btn btn-ghost"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}