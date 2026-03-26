import { differenceInDays, format, startOfDay } from 'date-fns'
import type { Task } from 'shared'

interface Props { tasks: Task[] }

const STATUS_BAR = {
  todo:        'bg-stone-300 dark:bg-stone-600',
  in_progress: 'bg-stone-700 dark:bg-stone-300',
  done:        'bg-stone-400 dark:bg-stone-500',
}

export default function GanttChart({ tasks }: Props) {
  const dated = tasks.filter(t => t.startDate && t.dueDate)
  if (!dated.length) return (
    <div className="flex items-center justify-center h-48 text-sm text-stone-400 dark:text-stone-600">
      No tasks with start &amp; due dates to display.
    </div>
  )

  const minDate = startOfDay(new Date(Math.min(...dated.map(t => new Date(t.startDate!).getTime()))))
  const maxDate = startOfDay(new Date(Math.max(...dated.map(t => new Date(t.dueDate!).getTime()))))
  const totalDays = differenceInDays(maxDate, minDate) + 1

  return (
    <div className="card overflow-hidden">
      {/* Date header */}
      <div className="flex border-b border-stone-100 dark:border-stone-800">
        <div className="w-44 shrink-0 px-4 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 border-r border-stone-100 dark:border-stone-800">
          Task
        </div>
        <div className="flex-1 flex overflow-hidden">
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(minDate); d.setDate(d.getDate() + i)
            return (
              <div key={i} className="flex-1 text-center py-2 border-r border-stone-50 dark:border-stone-800/50 last:border-0">
                {i % 7 === 0 && (
                  <span className="text-xs text-stone-400 dark:text-stone-500">{format(d, 'MMM d')}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rows */}
      {dated.map((task, idx) => {
        const start    = differenceInDays(startOfDay(new Date(task.startDate!)), minDate)
        const duration = differenceInDays(startOfDay(new Date(task.dueDate!)), startOfDay(new Date(task.startDate!))) + 1
        return (
          <div key={task.id} className={`flex items-center ${idx < dated.length - 1 ? 'border-b border-stone-50 dark:border-stone-800/50' : ''}`}>
            <div className="w-44 shrink-0 px-4 py-2.5 border-r border-stone-100 dark:border-stone-800">
              <p className="text-xs text-stone-700 dark:text-stone-300 truncate">{task.title}</p>
            </div>
            <div className="flex-1 relative h-9 flex items-center">
              <div
                className={`absolute h-5 rounded-md ${STATUS_BAR[task.status]} opacity-80`}
                style={{ left: `${(start / totalDays) * 100}%`, width: `${Math.max((duration / totalDays) * 100, 1)}%` }}
                title={`${task.startDate?.slice(0,10)} → ${task.dueDate?.slice(0,10)}`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
