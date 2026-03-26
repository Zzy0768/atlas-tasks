import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const app = createApp()
// 注意：Prisma 客户端在 setup.ts 设置环境变量后初始化
// 但由于模块缓存，我们可能需要重新创建客户端
let prisma: PrismaClient

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
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@test.com', name: 'Alice', password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('alice@test.com')
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send({ email: 'alice@test.com', name: 'Alice', password: 'password123' })
    const res = await request(app).post('/api/auth/register').send({ email: 'alice@test.com', name: 'Alice2', password: 'password123' })
    expect(res.status).toBe(409)
  })

  it('rejects invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email', name: 'Alice', password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('rejects short password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'alice@test.com', name: 'Alice', password: '123' })
    expect(res.status).toBe(400)
  })

  it('rejects missing name with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'alice@test.com', password: 'password123' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ email: 'alice@test.com', name: 'Alice', password: 'password123' })
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('alice@test.com')
  })

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  it('rejects unknown email with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'password123' })
    expect(res.status).toBe(401)
  })

  it('rejects invalid email format with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: 'password123' })
    expect(res.status).toBe(400)
  })
})
