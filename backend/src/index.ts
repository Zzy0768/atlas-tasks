import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import authRouter from './routes/auth'
import projectsRouter from './routes/projects'
import tasksRouter from './routes/tasks'
import commentsRouter from './routes/comments'
import notificationsRouter from './routes/notifications'
import usersRouter from './routes/users'
import { startRecurringTasksJob } from './jobs/recurringTasks'

const app = express()

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true,
}))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// Root route and health check
app.get('/', (req, res) => {
  res.json({ message: 'Atlas Tasks API', version: '1.0.0', status: 'ok' })
})
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api', tasksRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/users', usersRouter)
app.use('/api/tasks', commentsRouter)

startRecurringTasksJob()

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
