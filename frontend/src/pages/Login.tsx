import { useState } from 'react'
import client from '../api/client'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const setAuth = useAuthStore(s => s.setAuth)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post(`/auth/${mode}`, form)
      setAuth(data.token, data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-5 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Atlas Tasks</h1>
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            {mode === 'login' ? '欢迎回来' : '创建您的账户'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                姓名
              </label>
              <input
                className="input-base"
                placeholder="您的姓名"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              邮箱
            </label>
            <input
              type="email"
              className="input-base"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              密码
            </label>
            <input
              type="password"
              className="input-base"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-base"
          >
            {loading ? '请稍候...' : mode === 'login' ? '登录' : '创建账户'}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-8 text-center text-sm text-[var(--text-tertiary)]">
          {mode === 'login' ? '还没有账户？' : '已有账户？'}
          <button
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            className="ml-1 text-sm font-medium text-[var(--accent-primary)] hover:underline underline-offset-2"
          >
            {mode === 'login' ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
