import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const app = createApp()
// 注意：Prisma 客户端在 setup.ts 设置环境变量后初始化
// 但由于模块缓存，我们可能需要重新创建客户端
let prisma: PrismaClient

let tokenA: string, tokenB: string, projectId: string

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
  const proj = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'P' })
  projectId = proj.body.id
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

const auth = (t: string) => ({ Authorization: `Bearer ${t}` })

describe('Tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'Task 1' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Task 1')
    expect(res.body.status).toBe('todo')
    expect(res.body.priority).toBe('medium')
    expect(res.body.labels).toEqual([])
  })

  it('creates a task with all fields', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({
      title: 'Full Task',
      description: 'desc',
      priority: 'high',
      labels: ['bug', 'urgent'],
      dueDate: '2030-12-31',
      startDate: '2030-01-01',
    })
    expect(res.status).toBe(201)
    expect(res.body.priority).toBe('high')
    expect(res.body.labels).toEqual(['bug', 'urgent'])
    expect(res.body.dueDate).toBeDefined()
  })

  it('rejects task with empty title', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: '' })
    expect(res.status).toBe(400)
  })

  it('rejects task creation by non-member', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenB)).send({ title: 'T' })
    expect(res.status).toBe(403)
  })

  it('lists tasks for a project', async () => {
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T1' })
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T2' })
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('filters tasks by status', async () => {
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'Todo' })
    const { body: t2 } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'Done' })
    await request(app).patch(`/api/tasks/${t2.id}`).set(auth(tokenA)).send({ status: 'done' })
    const res = await request(app).get(`/api/projects/${projectId}/tasks?status=todo`).set(auth(tokenA))
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Todo')
  })

  it('filters tasks by label', async () => {
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T1', labels: ['bug'] })
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T2', labels: ['feature'] })
    const res = await request(app).get(`/api/projects/${projectId}/tasks?label=bug`).set(auth(tokenA))
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('T1')
  })

  it('searches tasks by title', async () => {
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'Fix login bug' })
    await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'Add dashboard' })
    const res = await request(app).get(`/api/projects/${projectId}/tasks?q=login`).set(auth(tokenA))
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Fix login bug')
  })

  it('updates a task', async () => {
    const { body: task } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T' })
    const res = await request(app).patch(`/api/tasks/${task.id}`).set(auth(tokenA)).send({
      title: 'Updated', status: 'in_progress', priority: 'high', labels: ['v2'],
    })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated')
    expect(res.body.status).toBe('in_progress')
    expect(res.body.labels).toEqual(['v2'])
  })

  it('returns 404 when updating non-existent task', async () => {
    const res = await request(app).patch('/api/tasks/nonexistent').set(auth(tokenA)).send({ title: 'X' })
    expect(res.status).toBe(404)
  })

  it('deletes a task', async () => {
    const { body: task } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T' })
    const res = await request(app).delete(`/api/tasks/${task.id}`).set(auth(tokenA))
    expect(res.status).toBe(204)
    const list = await request(app).get(`/api/projects/${projectId}/tasks`).set(auth(tokenA))
    expect(list.body).toHaveLength(0)
  })

  it('returns 404 when deleting non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/nonexistent').set(auth(tokenA))
    expect(res.status).toBe(404)
  })

  it('reorders a task', async () => {
    const { body: t1 } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T1' })
    const res = await request(app).patch(`/api/tasks/${t1.id}/reorder`).set(auth(tokenA)).send({ status: 'in_progress', order: 0 })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('in_progress')
    expect(res.body.order).toBe(0)
  })

  it('returns activity log for a task', async () => {
    const { body: task } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T' })
    const res = await request(app).get(`/api/tasks/${task.id}/activity`).set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
    expect(res.body[0].action).toBe('created')
  })

  it('increments order for new tasks in same column', async () => {
    const { body: t1 } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T1' })
    const { body: t2 } = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(tokenA)).send({ title: 'T2' })
    expect(t2.order).toBeGreaterThan(t1.order)
  })
})
