import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { getLanguage, LESSONS, SKILL_META } from '@/data/content'
import { buildRecommendations, computeSkillStats } from '@/lib/recommend'
import { lastNDays, todayStr } from '@/lib/utils'
import { Card, PageHeader, ProgressBar, ProgressRing, StatTile } from '@/components/ui'

export default function Dashboard() {
  const { user } = useAuth()
  const { progress } = useAppData()
  const navigate = useNavigate()
  const lang = getLanguage(progress.currentLang)

  const recs = useMemo(() => buildRecommendations(progress), [progress])
  const stats = useMemo(() => computeSkillStats(progress, progress.currentLang), [progress])

  const todayXp = progress.sessions.filter((s) => s.date === todayStr()).reduce((n, s) => n + s.xp, 0)
  const lessonsDone = LESSONS[progress.currentLang].filter((l) => progress.completedLessons.includes(l.id)).length
  const wordsMastered = Object.entries(progress.wordBoxes).filter(
    ([id, b]) => id.startsWith(progress.currentLang) && b >= 2,
  ).length

  // 最近 15 天热力图
  const days = lastNDays(15)
  const xpByDay = useMemo(() => {
    const map: Record<string, number> = {}
    progress.sessions.forEach((s) => {
      map[s.date] = (map[s.date] ?? 0) + s.xp
    })
    return map
  }, [progress.sessions])

  const heatLevel = (xp: number) => (xp === 0 ? 0 : xp < 30 ? 1 : xp < 60 ? 2 : xp < 100 ? 3 : 4)

  // 最近 7 天 XP 柱状图
  const week = lastNDays(7).map((d) => ({ d, xp: xpByDay[d] ?? 0 }))
  const maxXp = Math.max(40, ...week.map((w) => w.xp))

  const totalSessions = progress.sessions.length

  return (
    <div>
      <PageHeader title={`你好，${user?.username}！`} subtitle={`今天也要在${lang.name}的世界里有所收获 ${lang.flag}`} />

      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div>
          <h2>{greeting()}，保持专注 ✨</h2>
          <p>
            当前学习：{lang.flag} {lang.name} · {lang.nativeName}
            ｜ 今日已获得 <strong>{todayXp}</strong> XP
          </p>
        </div>
        <div className="wb-streak">
          <div className="ws-num">🔥 {progress.streak.current}</div>
          <div className="ws-label">连续打卡（最佳 {progress.streak.best} 天）</div>
        </div>
      </div>

      {/* 统计磁贴 */}
      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <StatTile icon="⭐" label="累计经验值" value={progress.xp} color="#f59e0b" sub="每一次练习都算数" />
        <StatTile icon="📚" label="完成课程" value={`${lessonsDone}/30`} color="#6366f1" sub={`${lang.name}课程进度`} />
        <StatTile icon="🧠" label="掌握单词" value={wordsMastered} color="#0ea5e9" sub="记忆盒 ≥ 2 级" />
        <StatTile icon="⏱️" label="学习时长" value={`${progress.minutes}`} color="#10b981" sub="累计分钟" />
        <StatTile icon="🎯" label="练习次数" value={totalSessions} color="#ec4899" sub="听说读写总计" />
      </div>

      <div className="section-grid layout-2col">
        {/* 左列 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 个性化推荐 */}
          <Card>
            <div className="section-title">🎯 为你推荐</div>
            {recs.map((r) => (
              <div key={r.id} className="rec-card" style={{ borderLeftColor: r.color }} onClick={() => navigate(r.to)}>
                <div className="rc-head">
                  <span className="rc-icon">{r.icon}</span>
                  <span className="rc-title">{r.title}</span>
                </div>
                <div className="rc-reason">{r.reason}</div>
                <button className="btn btn-sm" style={{ background: `${r.color}14`, color: r.color }}>
                  {r.cta} →
                </button>
              </div>
            ))}
          </Card>

          {/* 技能掌握度 */}
          <Card>
            <div className="section-title">🧩 技能掌握度（{lang.name}）</div>
            <div className="skill-radar-list">
              {stats.map((s) => {
                const meta = SKILL_META.find((m) => m.key === s.key)!
                return (
                  <div key={s.key} className="skill-radar-row">
                    <div className="srr-head">
                      <span>{meta.icon} {s.name}</span>
                      <span className="srr-pct">
                        {s.total > 0 ? `正确率 ${s.accuracy}% · ${s.sessions} 次` : '尚未练习'}
                      </span>
                    </div>
                    <ProgressBar value={s.accuracy} color={meta.color} height={9} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* 右列 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 每日目标 */}
          <Card className="text-center">
            <div className="section-title" style={{ justifyContent: 'center' }}>🎯 今日目标</div>
            <ProgressRing value={Math.min(todayXp, progress.dailyGoal)} max={progress.dailyGoal} size={140} stroke={12}>
              <span style={{ fontSize: 26, fontWeight: 900 }}>{Math.min(100, Math.round((todayXp / progress.dailyGoal) * 100))}%</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{todayXp}/{progress.dailyGoal} XP</span>
            </ProgressRing>
            <div className="text-muted text-sm mt-12">
              {todayXp >= progress.dailyGoal ? '🎉 今日目标已达成，太棒了！' : `再获得 ${Math.max(0, progress.dailyGoal - todayXp)} XP 即可达成`}
            </div>
          </Card>

          {/* 近 7 天 XP */}
          <Card>
            <div className="section-title">📈 近 7 天 XP</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingTop: 8 }}>
              {week.map((w) => (
                <div key={w.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>{w.xp || ''}</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${(w.xp / maxXp) * 92}px`,
                      minHeight: w.xp ? 6 : 2,
                      borderRadius: 6,
                      background: w.d === todayStr()
                        ? 'linear-gradient(180deg,#818cf8,#6366f1)'
                        : w.xp ? '#c7d2fe' : 'var(--bg-soft)',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{w.d.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 学习热力图 */}
          <Card>
            <div className="section-title">🗓️ 近 15 天足迹</div>
            <div className="heatmap">
              {days.map((d) => (
                <div key={d} className={`heat-cell h${heatLevel(xpByDay[d] ?? 0)}`} title={`${d}: ${xpByDay[d] ?? 0} XP`} />
              ))}
            </div>
            <div className="heat-legend">
              少
              <span className="heat-cell" style={{ width: 12, height: 12 }} />
              <span className="heat-cell h1" style={{ width: 12, height: 12 }} />
              <span className="heat-cell h2" style={{ width: 12, height: 12 }} />
              <span className="heat-cell h3" style={{ width: 12, height: 12 }} />
              <span className="heat-cell h4" style={{ width: 12, height: 12 }} />
              多
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}
