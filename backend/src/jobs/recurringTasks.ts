import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function startRecurringTasksJob() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    const now = new Date()
    const tasks = await prisma.task.findMany({
      where: { recurrenceRule: { not: null }, status: 'done' },
    })
    for (const task of tasks) {
      const next = new Date(task.dueDate || now)
      if (task.recurrenceRule === 'daily') next.setDate(next.getDate() + 1)
      else if (task.recurrenceRule === 'weekly') next.setDate(next.getDate() + 7)
      else if (task.recurrenceRule === 'monthly') next.setMonth(next.getMonth() + 1)

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description ?? undefined,
          priority: task.priority,
          labels: task.labels,
          status: 'todo',
          order: 0,
          dueDate: next,
          startDate: task.startDate ? new Date(next.getTime() - (task.dueDate!.getTime() - task.startDate.getTime())) : undefined,
          recurrenceRule: task.recurrenceRule,
          projectId: task.projectId,
          ownerId: task.ownerId,
          assigneeId: task.assigneeId ?? undefined,
        },
      })
    }

    // Due-soon notifications (tasks due in 24h, not yet notified today)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const dueSoon = await prisma.task.findMany({
      where: { dueDate: { gte: now, lte: tomorrow }, status: { not: 'done' }, assigneeId: { not: null } },
    })
    for (const task of dueSoon) {
      await prisma.notification.create({
        data: { type: 'due_soon', message: `"${task.title}" is due soon`, userId: task.assigneeId!, taskId: task.id },
      })
    }
  })
}
