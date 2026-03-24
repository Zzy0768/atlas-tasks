import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Comment } from 'shared'

interface Props { taskId: string }

export default function TaskComments({ taskId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    client.get(`/tasks/${taskId}/comments`).then(r => setComments(r.data))
  }, [taskId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const { data } = await client.post(`/tasks/${taskId}/comments`, { content: text })
    setComments(c => [...c, data])
    setText('')
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase">Comments</p>
      {comments.map(c => (
        <div key={c.id} className="text-xs">
          <span className="font-medium">{c.author.name}: </span>
          <span className="text-gray-600 dark:text-gray-300">{c.content}</span>
        </div>
      ))}
      <form onSubmit={submit} className="flex gap-1">
        <input className="input text-xs flex-1" placeholder="Add comment…" value={text}
          onChange={e => setText(e.target.value)} />
        <button type="submit" className="btn-primary text-xs px-2 py-1">Send</button>
      </form>
    </div>
  )
}
