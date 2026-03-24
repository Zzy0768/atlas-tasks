import express from 'express'
import { rateLimit } from 'express-rate-limit'
import authRouter from './routes/auth'
import projectsRouter from './routes/projects'
import tasksRouter from './routes/tasks'
import commentsRouter from './routes/comments'
import notificationsRouter from './routes/notifications'
import usersRouter from './routes/users'
import { startRecurringTasksJob } from './jobs/recurringTasks'

const app = express()

app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/users', usersRouter)
app.use('/api/tasks', commentsRouter)

startRecurringTasksJob()

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
