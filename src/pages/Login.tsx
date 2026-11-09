import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!account.trim() || !password) {
      setError('请输入账号和密码')
      return
    }
    const res = login(account, password)
    if (!res.ok) {
      setError(res.message ?? '登录失败')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand">
          <span className="logo-badge">语</span>
          语界 LinguaVerse
        </div>
        <div>
          <h2>欢迎回来，<br />继续你的语言之旅 🌍</h2>
          <div className="aside-points" style={{ marginTop: 30 }}>
            <div className="aside-point"><span className="ap-dot">🔥</span>别让连续打卡在今天中断</div>
            <div className="aside-point"><span className="ap-dot">🃏</span>有单词正在等待复习巩固</div>
            <div className="aside-point"><span className="ap-dot">🎯</span>个性化推荐已为你准备好</div>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, position: 'relative', zIndex: 2 }}>
          英语 · 日语 · 韩语 沉浸式学习
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>登录账号</h1>
          <p className="auth-sub">输入用户名或邮箱，回到你的学习空间</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>用户名 / 邮箱</label>
              <input
                className="input"
                placeholder="例如：nu007a 或 you@example.com"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label>密码</label>
              <input
                className="input"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="field-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}
            <Button type="submit" block size="lg">
              登 录
            </Button>
          </form>

          <div className="auth-switch">
            还没有账号？<Link to="/register">立即注册</Link>
          </div>
          <div className="auth-switch" style={{ marginTop: 8 }}>
            <Link to="/">← 返回首页</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
