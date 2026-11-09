import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppData } from '@/context/AppDataContext'
import { LANGUAGES, LESSONS } from '@/data/content'
import { AVATARS, cn, todayStr } from '@/lib/utils'
import { Button, Card, Modal, PageHeader, StatTile } from '@/components/ui'

const GOAL_OPTIONS = [20, 50, 100, 200]

export default function Profile() {
  const { user, logout, updateAvatar } = useAuth()
  const { progress, setDailyGoal, resetProgress, posts } = useAppData()
  const navigate = useNavigate()

  const [avatarPicker, setAvatarPicker] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const todayXp = progress.sessions.filter((s) => s.date === todayStr()).reduce((n, s) => n + s.xp, 0)
  const postCount = posts.filter((p) => p.author === user?.username).length
  const langsStarted = new Set(progress.completedLessons.map((id) => id.split('-')[0])).size
  const joinDate = user ? new Date(user.createdAt).toLocaleDateString('zh-CN') : ''

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <PageHeader title="个人中心" subtitle="管理你的账号、学习偏好与成长数据" />

      <Card className="profile-head-card" style={{ marginBottom: 18 }}>
        <span className="profile-avatar-xl">{user?.avatar}</span>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{user?.username}</div>
          <div className="profile-meta">📧 {user?.email}</div>
          <div className="profile-meta">📅 加入于 {joinDate}</div>
        </div>
        <Button variant="secondary" onClick={() => setAvatarPicker(true)}>更换头像</Button>
      </Card>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <StatTile icon="⭐" label="累计 XP" value={progress.xp} color="#f59e0b" />
        <StatTile icon="📚" label="完成课程" value={progress.completedLessons.length} color="#6366f1" />
        <StatTile icon="🌍" label="涉猎语言" value={`${langsStarted}/${LANGUAGES.length}`} color="#10b981" />
        <StatTile icon="💬" label="社区发帖" value={postCount} color="#3b82f6" />
        <StatTile icon="🏆" label="成就徽章" value={progress.unlockedAchievements.length} color="#d4a017" />
      </div>

      <div className="section-grid layout-2col">
        <Card>
          <div className="section-title">⚙️ 学习偏好</div>

          <div className="setting-row">
            <div>
              <div className="sr-label">每日 XP 目标</div>
              <div className="sr-desc">今日已获得 {todayXp} XP · 目标约 {Math.round(progress.dailyGoal / 10)}-{Math.round(progress.dailyGoal / 5)} 分钟</div>
            </div>
            <div className="goal-options">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  className={cn('goal-opt', progress.dailyGoal === g && 'active')}
                  onClick={() => setDailyGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="sr-label">当前主修语言</div>
              <div className="sr-desc">在顶部导航栏可随时切换，学习数据按语言分别统计</div>
            </div>
            <div className="goal-options">
              {LANGUAGES.map((l) => {
                const count = LESSONS[l.code].filter((ls) => progress.completedLessons.includes(ls.id)).length
                return (
                  <span key={l.code} className={cn('goal-opt', progress.currentLang === l.code && 'active')}>
                    {l.flag} {count}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="sr-label">连续打卡</div>
              <div className="sr-desc">当前 {progress.streak.current} 天 · 历史最佳 {progress.streak.best} 天</div>
            </div>
            <span style={{ fontSize: 26 }}>🔥</span>
          </div>
        </Card>

        <Card>
          <div className="section-title">🔐 账号管理</div>
          <div className="setting-row">
            <div>
              <div className="sr-label">数据存储说明</div>
              <div className="sr-desc">本演示版所有账号与学习数据保存在浏览器本地（localStorage），清除浏览器数据会导致记录丢失</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" block onClick={() => navigate('/achievements')}>
              🏆 查看我的成就墙
            </Button>
            <Button variant="danger" block onClick={() => setConfirmReset(true)}>
              🗑 重置学习进度
            </Button>
            <Button variant="ghost" block onClick={handleLogout}>
              🚪 退出登录
            </Button>
          </div>
        </Card>
      </div>

      {/* 头像选择弹窗 */}
      <Modal open={avatarPicker} onClose={() => setAvatarPicker(false)}>
        <h3 style={{ marginBottom: 16 }}>选择头像</h3>
        <div className="avatar-picker" style={{ marginBottom: 20 }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              className={cn('avatar-opt', user?.avatar === a && 'selected')}
              onClick={() => updateAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <Button block onClick={() => setAvatarPicker(false)}>完成</Button>
      </Modal>

      {/* 重置确认 */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} width={400}>
        <h3 style={{ marginBottom: 10 }}>确认重置学习进度？</h3>
        <p className="text-muted" style={{ fontSize: 14, marginBottom: 20 }}>
          将清空 XP、打卡、课程进度、单词记忆盒与成就（社区帖子保留）。此操作不可撤销。
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" block onClick={() => setConfirmReset(false)}>取消</Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              resetProgress()
              setConfirmReset(false)
            }}
          >
            确认重置
          </Button>
        </div>
      </Modal>
    </div>
  )
}
