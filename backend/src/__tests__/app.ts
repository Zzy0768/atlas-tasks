// Shared test app factory — env vars set in setup.ts before this loads
import express from 'express'
import authRouter from '../routes/auth'
import projectsRouter from '../routes/projects'
import tasksRouter from '../routes/tasks'
import commentsRouter from '../routes/comments'
import notificationsRouter from '../routes/notifications'
import usersRouter from '../routes/users'

export function createApp() {
  const app = express()
  app.use(express.json())
  // disable rate limiting in tests
  app.use('/api/auth', authRouter)
  app.use('/api/projects', projectsRouter)
  app.use('/api', tasksRouter)
  app.use('/api/notifications', notificationsRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/tasks', commentsRouter)
  return app
}
