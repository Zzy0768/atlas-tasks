import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
import { assertMember } from './projects'

const router = Router()
const prisma = new PrismaClient()

const userSelect = { id: true, name: true }

const taskInclude = {
  owner: { select: userSelect },
  assignee: { select: userSelect },
  subtasks: { include: { owner: { select: userSelect }, assignee: { select: userSelect } } },
}

function parseTask(t: any) {
  return { ...t, labels: JSON.parse(t.labels) }
}

router.use(authenticate)

// GET /api/projects/:projectId/tasks
router.get('/projects/:projectId/tasks', async (req: AuthRequest, res) => {
  await assertMember(req.params.projectId, req.userId!)
  const { status, assigneeId, priority, label, q } = req.query as Record<string, string>
  const tasks = await prisma.task.findMany({
    where: {
      projectId: req.params.projectId,
      parentTaskId: null,
      ...(status && status.trim() && { status }),
      ...(assigneeId && assigneeId.trim() && { assigneeId }),
      ...(priority && priority.trim() && { priority }),
      ...(q && q.trim() && { title: { contains: q } }),
    },
    include: taskInclude,
    orderBy: [{ status: 'asc' }, { order: 'asc' }],
  })
  const filtered = label && label.trim()
    ? tasks.filter(t => JSON.parse(t.labels).includes(label))
    : tasks
  res.json(filtered.map(parseTask))
})

// POST /api/projects/:projectId/tasks
router.post('/projects/:projectId/tasks', async (req: AuthRequest, res) => {
  await assertMember(req.params.projectId, req.userId!)
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    labels: z.array(z.string()).default([]),
    dueDate: z.string().optional(),
    startDate: z.string().optional(),
    assigneeId: z.string().optional(),
    parentTaskId: z.string().optional(),
    recurrenceRule: z.enum(['daily', 'weekly', 'monthly']).optional(),
  })
  const data = schema.parse(req.body)
  const parentTaskId = data.parentTaskId
  let order = 0
  // Only set order for main tasks (not subtasks)
  if (!parentTaskId) {
    const status = data.status ?? 'todo'
    const maxOrder = await prisma.task.aggregate({ where: { projectId: req.params.projectId, status }, _max: { order: true } })
    order = (maxOrder._max.order ?? -1) + 1
  }
  const task = await prisma.task.create({
    data: {
      ...data,
      labels: JSON.stringify(data.labels),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      order,
      projectId: req.params.projectId,
      ownerId: req.userId!,
    },
    include: taskInclude,
  })
  if (data.assigneeId && data.assigneeId !== req.userId) {
    await prisma.notification.create({
      data: { type: 'task_assigned', message: `You were assigned to "${task.title}"`, userId: data.assigneeId, taskId: task.id },
    })
  }
  await prisma.activityLog.create({ data: { action: 'created', taskId: task.id, userId: req.userId!, metadata: '{}' } })
  res.status(201).json(parseTask(task))
})

// PATCH /api/tasks/:id
router.patch('/tasks/:id', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) return res.status(404).json({ error: 'Not found' })
    await assertMember(task.projectId, req.userId!)
    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      labels: z.array(z.string()).optional(),
      dueDate: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      assigneeId: z.string().nullable().optional(),
      recurrenceRule: z.enum(['daily', 'weekly', 'monthly']).nullable().optional(),
    })
    const data = schema.parse(req.body)
    const { assigneeId, recurrenceRule, labels, dueDate, startDate, ...rest } = data
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(labels !== undefined && { labels: JSON.stringify(labels) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(assigneeId !== undefined && { assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true } }),
        ...(recurrenceRule !== undefined && { recurrenceRule: recurrenceRule ?? null }),
      },
      include: taskInclude,
    })
    await prisma.activityLog.create({ data: { action: 'updated', taskId: task.id, userId: req.userId!, metadata: JSON.stringify(data) } })
    res.json(parseTask(updated))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  // Delete subtasks recursively
  await prisma.task.deleteMany({ where: { parentTaskId: req.params.id } })
  // Delete associated comments and activity logs
  await prisma.comment.deleteMany({ where: { taskId: req.params.id } })
  await prisma.activityLog.deleteMany({ where: { taskId: req.params.id } })
  // Delete the task itself (notifications will be cascaded by Prisma)
  await prisma.task.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

// PATCH /api/tasks/:id/reorder
router.patch('/tasks/:id/reorder', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  const { status, order } = z.object({ status: z.enum(['todo', 'in_progress', 'done']), order: z.number().int() }).parse(req.body)
  // shift tasks in target column to make room
  await prisma.task.updateMany({
    where: { projectId: task.projectId, status, order: { gte: order }, id: { not: req.params.id } },
    data: { order: { increment: 1 } },
  })
  const updated = await prisma.task.update({ where: { id: req.params.id }, data: { status, order }, include: taskInclude })
  // if moved to different column, reindex old column
  if (task.status !== status) {
    const oldTasks = await prisma.task.findMany({
      where: { projectId: task.projectId, status: task.status },
      orderBy: { order: 'asc' },
    })
    await Promise.all(oldTasks.map((t, i) => prisma.task.update({ where: { id: t.id }, data: { order: i } })))
  }
  res.json(parseTask(updated))
})

// GET /api/tasks/:id/activity
router.get('/tasks/:id/activity', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  const logs = await prisma.activityLog.findMany({
    where: { taskId: req.params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(logs.map(l => ({ ...l, metadata: JSON.parse(l.metadata) })))
})

export default router
