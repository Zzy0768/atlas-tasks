import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(notifications)
})

router.patch('/', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId!, read: false }, data: { read: true } })
  res.status(204).end()
})

export default router
