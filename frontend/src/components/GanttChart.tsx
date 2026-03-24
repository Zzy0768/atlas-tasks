import { differenceInDays, format, startOfDay } from 'date-fns'
import type { Task } from 'shared'

interface Props { tasks: Task[] }

const STATUS_COLOR = { todo: 'bg-gray-400', in_progress: 'bg-blue-500', done: 'bg-green-500' }

export default function GanttChart({ tasks }: Props) {
  const dated = tasks.filter(t => t.startDate && t.dueDate)
  if (!dated.length) return <p className="text-gray-400 text-sm p-4">No tasks with start & due dates.</p>

  const minDate = startOfDay(new Date(Math.min(...dated.map(t => new Date(t.startDate!).getTime()))))
  const maxDate = startOfDay(new Date(Math.max(...dated.map(t => new Date(t.dueDate!).getTime()))))
  const totalDays = differenceInDays(maxDate, minDate) + 1

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="flex mb-2 pl-40">
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(minDate)
            d.setDate(d.getDate() + i)
            return (
              <div key={i} className="flex-1 text-center text-xs text-gray-400 border-l dark:border-gray-700">
                {i % 7 === 0 ? format(d, 'MM/dd') : ''}
              </div>
            )
          })}
        </div>
        {/* Rows */}
        {dated.map(task => {
          const start = differenceInDays(startOfDay(new Date(task.startDate!)), minDate)
          const duration = differenceInDays(startOfDay(new Date(task.dueDate!)), startOfDay(new Date(task.startDate!))) + 1
          return (
            <div key={task.id} className="flex items-center mb-1 h-7">
              <div className="w-40 shrink-0 text-xs truncate pr-2 text-gray-700 dark:text-gray-300">{task.title}</div>
              <div className="flex-1 relative h-5">
                <div
                  className={`absolute h-full rounded ${STATUS_COLOR[task.status]} opacity-80`}
                  style={{ left: `${(start / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` }}
                  title={`${task.startDate} → ${task.dueDate}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
