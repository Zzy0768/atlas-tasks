import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

const memberSelect = { id: true, email: true, name: true }

// helper: assert user is project member
async function assertMember(projectId: string, userId: string) {
  const m = await prisma.projectMember.findUnique({ where: { userId_projectId: { userId, projectId } } })
  if (!m) throw Object.assign(new Error('Forbidden'), { status: 403 })
  return m
}

router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.userId! } } },
    include: { members: { include: { user: { select: memberSelect } } } },
  })
  res.json(projects)
})

router.post('/', async (req: AuthRequest, res) => {
  const { name } = z.object({ name: z.string().min(1) }).parse(req.body)
  const project = await prisma.project.create({
    data: {
      name,
      members: { create: { userId: req.userId!, role: 'owner' } },
    },
    include: { members: { include: { user: { select: memberSelect } } } },
  })
  res.status(201).json(project)
})

router.get('/:id', async (req: AuthRequest, res) => {
  await assertMember(req.params.id, req.userId!)
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: { select: memberSelect } } } },
  })
  if (!project) return res.status(404).json({ error: 'Not found' })
  res.json(project)
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const m = await assertMember(req.params.id, req.userId!)
  if (m.role !== 'owner') return res.status(403).json({ error: 'Only owner can delete' })
  await prisma.project.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

router.post('/:id/members', async (req: AuthRequest, res) => {
  const m = await assertMember(req.params.id, req.userId!)
  if (m.role !== 'owner') return res.status(403).json({ error: 'Only owner can add members' })
  const { userId, role } = z.object({ userId: z.string(), role: z.enum(['owner', 'member']).default('member') }).parse(req.body)
  // Check if user is already a member
  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: req.params.id } },
  })
  if (existing) return res.status(409).json({ error: 'User is already a member' })
  const member = await prisma.projectMember.create({
    data: { userId, projectId: req.params.id, role },
    include: { user: { select: memberSelect } },
  })
  res.status(201).json(member)
})

router.delete('/:id/members/:uid', async (req: AuthRequest, res) => {
  const m = await assertMember(req.params.id, req.userId!)
  if (m.role !== 'owner') return res.status(403).json({ error: 'Only owner can remove members' })
  await prisma.projectMember.delete({ where: { userId_projectId: { userId: req.params.uid, projectId: req.params.id } } })
  res.status(204).end()
})

router.get('/:id/stats', async (req: AuthRequest, res) => {
  await assertMember(req.params.id, req.userId!)
  const tasks = await prisma.task.findMany({ where: { projectId: req.params.id, parentTaskId: null } })
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  res.json({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length,
    completedThisWeek: tasks.filter(t => t.status === 'done' && t.updatedAt >= weekAgo).length,
  })
})

export { assertMember }
export default router
