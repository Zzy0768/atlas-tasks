import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const app = createApp()
// 注意：Prisma 客户端在 setup.ts 设置环境变量后初始化
// 但由于模块缓存，我们可能需要重新创建客户端
let prisma: PrismaClient

let tokenA: string

beforeEach(async () => {
  // 每次测试前重新创建 Prisma 客户端，确保使用正确的数据库连接
  if (prisma) {
    await prisma.$disconnect()
  }
  prisma = new PrismaClient()

  // 安全地清理表 - 使用 try-catch 避免因表不存在而失败
  try {
    await prisma.activityLog.deleteMany()
  } catch (e) {
    // 表可能不存在，继续执行
  }
  try {
    await prisma.notification.deleteMany()
  } catch (e) {}
  try {
    await prisma.comment.deleteMany()
  } catch (e) {}
  try {
    await prisma.task.deleteMany()
  } catch (e) {}
  try {
    await prisma.projectMember.deleteMany()
  } catch (e) {}
  try {
    await prisma.project.deleteMany()
  } catch (e) {}
  try {
    await prisma.user.deleteMany()
  } catch (e) {}

  const a = await request(app).post('/api/auth/register').send({ email: 'a@test.com', name: 'Alice', password: 'password123' })
  tokenA = a.body.token
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

const auth = (t: string) => ({ Authorization: `Bearer ${t}` })

describe('Notifications', () => {
  it('returns empty list when no notifications', async () => {
    const res = await request(app).get('/api/notifications').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('marks all notifications as read', async () => {
    // create a notification via task assignment
    const b = await request(app).post('/api/auth/register').send({ email: 'b@test.com', name: 'Bob', password: 'password123' })
    const proj = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
    await request(app).post(`/api/projects/${proj.body.id}/members`).set(auth(tokenA)).send({ userId: b.body.user.id })
    await request(app).post(`/api/projects/${proj.body.id}/tasks`).set(auth(tokenA)).send({ title: 'T', assigneeId: b.body.user.id })

    const tokenB = b.body.token
    const before = await request(app).get('/api/notifications').set(auth(tokenB))
    expect(before.body.some((n: any) => !n.read)).toBe(true)

    await request(app).patch('/api/notifications').set(auth(tokenB))
    const after = await request(app).get('/api/notifications').set(auth(tokenB))
    expect(after.body.every((n: any) => n.read)).toBe(true)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).toBe(401)
  })
})

describe('Users search', () => {
  it('returns matching users', async () => {
    await request(app).post('/api/auth/register').send({ email: 'bob@test.com', name: 'Bob Smith', password: 'password123' })
    const res = await request(app).get('/api/users/search?q=Bob').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0].name).toBe('Bob Smith')
  })

  it('returns empty array for empty query', async () => {
    const res = await request(app).get('/api/users/search?q=').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/search?q=Bob')
    expect(res.status).toBe(401)
  })
})

describe('Auth middleware', () => {
  it('rejects missing token', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  it('rejects malformed token', async () => {
    const res = await request(app).get('/api/projects').set('Authorization', 'Bearer bad.token.here')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token')
  })
})
