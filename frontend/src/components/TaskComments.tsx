import { useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/auth'
import type { Comment } from 'shared'

interface Props { taskId: string }

export default function TaskComments({ taskId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const { user } = useAuthStore()

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

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    await client.delete(`/tasks/${taskId}/comments/${commentId}`)
    setComments(c => c.filter(cm => cm.id !== commentId))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Comments</p>
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 group">
              <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-medium text-stone-500 shrink-0 mt-0.5">
                {c.author.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{c.author.name} </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{c.content}</span>
                  </div>
                  {c.authorId === user?.id && (
                    <button onClick={() => deleteComment(c.id)}
                      className="p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <input className="input text-xs py-1.5 flex-1" placeholder="Write a comment…" value={text}
          onChange={e => setText(e.target.value)} />
        <button type="submit" className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          <Send size={13} />
        </button>
      </form>
    </div>
  )
}
