export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type ProjectRole = 'owner' | 'member'
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly'
export type NotificationType = 'task_assigned' | 'due_soon' | 'comment_added'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface ProjectMember {
  userId: string
  projectId: string
  role: ProjectRole
  user: Pick<User, 'id' | 'email' | 'name'>
}

export interface Project {
  id: string
  name: string
  createdAt: string
  members: ProjectMember[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  labels: string[]
  dueDate?: string
  startDate?: string
  order: number
  recurrenceRule?: RecurrenceRule
  projectId: string
  ownerId: string
  assigneeId?: string
  parentTaskId?: string
  owner: Pick<User, 'id' | 'name'>
  assignee?: Pick<User, 'id' | 'name'>
  subtasks?: Task[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  taskId: string
  authorId: string
  author: Pick<User, 'id' | 'name'>
  createdAt: string
}

export interface ActivityLog {
  id: string
  action: string
  taskId: string
  userId: string
  user: Pick<User, 'id' | 'name'>
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  userId: string
  taskId?: string
  createdAt: string
}

export interface ProjectStats {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
  completedThisWeek: number
}

// API request/response shapes
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; name: string; password: string }
export interface AuthResponse { token: string; user: User }

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: Priority
  labels?: string[]
  dueDate?: string
  startDate?: string
  assigneeId?: string
  parentTaskId?: string
  recurrenceRule?: RecurrenceRule
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus
  order?: number
}

export interface ReorderTaskRequest {
  status: TaskStatus
  order: number
}
