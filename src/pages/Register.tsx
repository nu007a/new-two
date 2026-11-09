import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui'
import { AVATARS } from '@/lib/utils'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    const res = register(username, email, password, avatar)
    if (!res.ok) {
      setError(res.message ?? '注册失败')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand">
          <span className="logo-badge">语</span>
          语界 LinguaVerse
        </div>
        <div>
          <h2>你好，新同学！<br />从今天起爱上一门语言 🎌</h2>
          <div className="aside-points" style={{ marginTop: 30 }}>
            <div className="aside-point"><span className="ap-dot">🗂️</span>3 大语言 × 5 个等级的完整课程</div>
            <div className="aside-point"><span className="ap-dot">🎙️</span>AI 口语跟读，随时随地大胆开口</div>
            <div className="aside-point"><span className="ap-dot">🏆</span>17 枚成就徽章等待你来收集</div>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, position: 'relative', zIndex: 2 }}>
          30 秒完成注册，立即开始第一课
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>创建账号</h1>
          <p className="auth-sub">所有数据保存在本地浏览器，安全无忧</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>选择头像</label>
              <div className="avatar-picker">
                {AVATARS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    className={`avatar-opt ${avatar === a ? 'selected' : ''}`}
                    onClick={() => setAvatar(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>用户名</label>
              <input
                className="input"
                placeholder="2-16 位中英文、数字或下划线"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label>邮箱</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label>密码</label>
              <input
                className="input"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label>确认密码</label>
              <input
                className="input"
                type="password"
                placeholder="再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <div className="field-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}
            <Button type="submit" block size="lg">
              注册并开始学习
            </Button>
          </form>

          <div className="auth-switch">
            已有账号？<Link to="/login">直接登录</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
