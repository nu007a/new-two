import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppData } from '@/context/AppDataContext'
import { LANGUAGES } from '@/data/content'
import { cn, todayStr } from '@/lib/utils'

const navGroups: { label: string; items: { to: string; icon: string; label: string; end?: boolean }[] }[] = [
  {
    label: '学习',
    items: [
      { to: '/dashboard', icon: '🏠', label: '学习首页', end: true },
      { to: '/courses', icon: '🗂️', label: '分级课程' },
      { to: '/learn', icon: '🧠', label: '互动练习' },
    ],
  },
  {
    label: '社区',
    items: [
      { to: '/community', icon: '💬', label: '学习社区' },
      { to: '/achievements', icon: '🏆', label: '成就墙' },
    ],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { progress, setCurrentLang } = useAppData()
  const navigate = useNavigate()

  const todayXp = progress.sessions
    .filter((s) => s.date === todayStr())
    .reduce((n, s) => n + s.xp, 0)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-badge">语</span>
          语界
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((g) => (
            <div key={g.label}>
              <div className="nav-section-label">{g.label}</div>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn('nav-item', isActive && 'active')}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <span className="su-avatar">{user?.avatar}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="su-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div className="su-xp">⭐ {progress.xp} XP</div>
          </div>
          <button
            title="退出登录"
            className="btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 8, fontSize: 15 }}
            onClick={(e) => {
              e.stopPropagation()
              logout()
              navigate('/')
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            {progress.streak.current > 0 && (
              <span style={{ marginRight: 14 }}>🔥 连续 {progress.streak.current} 天</span>
            )}
            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>
              今日 {todayXp}/{progress.dailyGoal} XP
            </span>
          </div>
          <div className="topbar-right">
            <div className="lang-switcher">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={cn('lang-btn', progress.currentLang === l.code && 'active')}
                  onClick={() => setCurrentLang(l.code)}
                  title={l.nativeName}
                >
                  <span>{l.flag}</span>
                  <span className="hidden-mini">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
