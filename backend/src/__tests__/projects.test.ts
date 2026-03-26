import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const app = createApp()
// 注意：Prisma 客户端在 setup.ts 设置环境变量后初始化
// 但由于模块缓存，我们可能需要重新创建客户端
let prisma: PrismaClient

let tokenA: string, tokenB: string, userAId: string, userBId: string

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
  tokenA = a.body.token; userAId = a.body.user.id
  tokenB = b.body.token; userBId = b.body.user.id
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('Projects', () => {
  it('creates a project and returns it with owner member', async () => {
    const res = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'My Project' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('My Project')
    expect(res.body.members[0].role).toBe('owner')
  })

  it('lists only projects the user belongs to', async () => {
    await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'A Project' })
    await request(app).post('/api/projects').set(auth(tokenB)).send({ name: 'B Project' })
    const res = await request(app).get('/api/projects').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('A Project')
  })

  it('gets a project by id', async () => {
    const { body: proj } = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
    const res = await request(app).get(`/api/projects/${proj.id}`).set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(proj.id)
  })

  it('returns 403 when non-member accesses project', async () => {
    const { body: proj } = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
    const res = await request(app).get(`/api/projects/${proj.id}`).set(auth(tokenB))
    expect(res.status).toBe(403)
  })

  it('owner can delete project', async () => {
    const { body: proj } = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
    const res = await request(app).delete(`/api/projects/${proj.id}`).set(auth(tokenA))
    expect(res.status).toBe(204)
  })

  it('non-owner cannot delete project', async () => {
    const { body: proj } = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
    // add B as member
    await request(app).post(`/api/projects/${proj.id}/members`).set(auth(tokenA)).send({ userId: userBId })
    const res = await request(app).delete(`/api/projects/${proj.id}`).set(auth(tokenB))
    expect(res.status).toBe(403)
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(401)
  })

  it('rejects empty project name', async () => {
    const res = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: '' })
    expect(res.status).toBe(400)
  })

  describe('Members', () => {
    let projectId: string

    beforeEach(async () => {
      const { body } = await request(app).post('/api/projects').set(auth(tokenA)).send({ name: 'P' })
      projectId = body.id
    })

    it('owner can add a member', async () => {
      const res = await request(app).post(`/api/projects/${projectId}/members`).set(auth(tokenA)).send({ userId: userBId })
      expect(res.status).toBe(201)
      expect(res.body.role).toBe('member')
    })

    it('non-owner cannot add members', async () => {
      await request(app).post(`/api/projects/${projectId}/members`).set(auth(tokenA)).send({ userId: userBId })
      const c = await request(app).post('/api/auth/register').send({ email: 'c@test.com', name: 'Carol', password: 'password123' })
      const res = await request(app).post(`/api/projects/${projectId}/members`).set(auth(tokenB)).send({ userId: c.body.user.id })
      expect(res.status).toBe(403)
    })

    it('owner can remove a member', async () => {
      await request(app).post(`/api/projects/${projectId}/members`).set(auth(tokenA)).send({ userId: userBId })
      const res = await request(app).delete(`/api/projects/${projectId}/members/${userBId}`).set(auth(tokenA))
      expect(res.status).toBe(204)
    })

    it('returns stats for a project', async () => {
      const res = await request(app).get(`/api/projects/${projectId}/stats`).set(auth(tokenA))
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ total: 0, todo: 0, done: 0, overdue: 0 })
    })
  })
})
