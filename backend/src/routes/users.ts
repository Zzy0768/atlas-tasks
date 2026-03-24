import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

router.get('/search', async (req: AuthRequest, res) => {
  const q = String(req.query.q || '')
  if (!q) return res.json([])
  const users = await prisma.user.findMany({
    where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
    select: { id: true, name: true, email: true },
    take: 10,
  })
  res.json(users)
})

export default router
