import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import client from '../api/client'
import TaskComments from './TaskComments'
import SubtaskList from './SubtaskList'
import TaskModal from './TaskModal'
import type { Task } from 'shared'

const PRIORITY_COLOR = { low: 'bg-gray-200 text-gray-600', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-600' }

interface Props { task: Task; projectId: string; onUpdate: () => void }

export default function TaskCard({ task, projectId, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const deleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await client.delete(`/tasks/${task.id}`)
    onUpdate()
  }

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes}
        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm cursor-pointer select-none">
        <div {...listeners} className="space-y-1" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-start justify-between gap-1">
            <span className="text-sm font-medium leading-snug">{task.title}</span>
            <div className="flex gap-1 shrink-0">
              <button onClick={e => { e.stopPropagation(); setEditing(true) }}
                className="text-gray-300 hover:text-blue-400 text-xs">✎</button>
              <button onClick={deleteTask} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
            {task.labels.map(l => (
              <span key={l} className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{l}</span>
            ))}
          </div>
          {task.dueDate && (
            <p className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</p>
          )}
          {task.assignee && (
            <p className="text-xs text-gray-400">→ {task.assignee.name}</p>
          )}
        </div>

        {expanded && (
          <div className="mt-3 border-t dark:border-gray-600 pt-3 space-y-3" onClick={e => e.stopPropagation()}>
            <SubtaskList taskId={task.id} subtasks={task.subtasks || []} onUpdate={onUpdate} />
            <TaskComments taskId={task.id} />
          </div>
        )}
      </div>

      {editing && (
        <TaskModal task={task} projectId={projectId}
          onClose={() => setEditing(false)} onUpdate={onUpdate} />
      )}
    </>
  )
}
