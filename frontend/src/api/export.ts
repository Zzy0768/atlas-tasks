import type { Task } from 'shared'

export function exportTasks(tasks: Task[], format: 'csv' | 'json', filename: string) {
  let content: string
  let mime: string

  if (format === 'json') {
    content = JSON.stringify(tasks, null, 2)
    mime = 'application/json'
    filename += '.json'
  } else {
    const headers = ['id', 'title', 'status', 'priority', 'labels', 'dueDate', 'startDate', 'assignee']
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      `"${t.labels.join(';')}"`,
      t.dueDate || '',
      t.startDate || '',
      t.assignee?.name || '',
    ])
    content = [headers, ...rows].map(r => r.join(',')).join('\n')
    mime = 'text/csv'
    filename += '.csv'
  }

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
