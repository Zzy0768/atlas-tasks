import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const app = createApp()
// 注意：Prisma 客户端在 setup.ts 设置环境变量后初始化
// 但由于模块缓存，我们可能需要重新创建客户端
let prisma: PrismaClient

let tokenA: string, tokenB: string, userBId: string, taskId: string

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
  const b = await request(app).post('/api/auth/register').send({ email: 'b@test.com', name: 'Bob', password: 'password123' })
  tokenA = a.body.token
  tokenB = b.body.token
  userBId = b.body.user.id

  const proj = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'P' })
  const task = await request(app).post(`/api/projects/${proj.body.id}/tasks`).set('Authorization', `Bearer ${tokenA}`).send({ title: 'T' })
  taskId = task.body.id
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

const auth = (t: string) => ({ Authorization: `Bearer ${t}` })

describe('Comments', () => {
  it('creates a comment on a task', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenA)).send({ content: 'Hello' })
    expect(res.status).toBe(201)
    expect(res.body.content).toBe('Hello')
    expect(res.body.author.name).toBe('Alice')
  })

  it('lists comments for a task', async () => {
    await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenA)).send({ content: 'C1' })
    await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenA)).send({ content: 'C2' })
    const res = await request(app).get(`/api/tasks/${taskId}/comments`).set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('rejects empty comment', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenA)).send({ content: '' })
    expect(res.status).toBe(400)
  })

  it('returns 404 for comments on non-existent task', async () => {
    const res = await request(app).get('/api/tasks/nonexistent/comments').set(auth(tokenA))
    expect(res.status).toBe(404)
  })

  it('returns 403 for non-member trying to comment', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenB)).send({ content: 'Hi' })
    expect(res.status).toBe(403)
  })

  it('creates notification for assignee when comment is added', async () => {
    // assign task to B, add B to project first
    const projRes = await request(app).get('/api/projects').set(auth(tokenA))
    const projId = projRes.body[0].id
    await request(app).post(`/api/projects/${projId}/members`).set(auth(tokenA)).send({ userId: userBId })
    await request(app).patch(`/api/tasks/${taskId}`).set(auth(tokenA)).send({ assigneeId: userBId })
    await request(app).post(`/api/tasks/${taskId}/comments`).set(auth(tokenA)).send({ content: 'Hey Bob' })
    const notifs = await request(app).get('/api/notifications').set(auth(tokenB))
    expect(notifs.body.some((n: any) => n.type === 'comment_added')).toBe(true)
  })
})
