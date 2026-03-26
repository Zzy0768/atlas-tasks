import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
import { assertMember } from './projects'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

// GET /api/tasks/:id/comments
router.get('/:id/comments', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  const comments = await prisma.comment.findMany({
    where: { taskId: req.params.id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json(comments)
})

// POST /api/tasks/:id/comments
router.post('/:id/comments', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  const { content } = z.object({ content: z.string().min(1) }).parse(req.body)
  const comment = await prisma.comment.create({
    data: { content, taskId: req.params.id, authorId: req.userId! },
    include: { author: { select: { id: true, name: true } } },
  })
  // notify task assignee if different from commenter
  if (task.assigneeId && task.assigneeId !== req.userId) {
    await prisma.notification.create({
      data: { type: 'comment_added', message: `New comment on "${task.title}"`, userId: task.assigneeId, taskId: task.id },
    })
  }
  res.status(201).json(comment)
})

// DELETE /api/tasks/:id/comments/:commentId
router.delete('/:id/comments/:commentId', async (req: AuthRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  await assertMember(task.projectId, req.userId!)
  const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } })
  if (!comment) return res.status(404).json({ error: 'Not found' })
  if (comment.authorId !== req.userId) return res.status(403).json({ error: 'Only author can delete' })
  await prisma.comment.delete({ where: { id: req.params.commentId } })
  res.status(204).end()
})

export default router
