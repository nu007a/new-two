import { useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { ACHIEVEMENTS } from '@/data/achievements'
import type { AchievementContext } from '@/types'
import { cn } from '@/lib/utils'
import { Card, PageHeader, ProgressBar, StatTile } from '@/components/ui'

export default function Achievements() {
  const { user } = useAuth()
  const { progress, posts } = useAppData()

  const ctx = useMemo<AchievementContext>(() => {
    const sessionsBySkill = { vocab: 0, grammar: 0, listening: 0, speaking: 0 }
    const correctBySkill: AchievementContext['correctBySkill'] = {
      vocab: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      speaking: { correct: 0, total: 0 },
    }
    progress.sessions.forEach((s) => {
      sessionsBySkill[s.skill] += 1
      correctBySkill[s.skill].correct += s.correct
      correctBySkill[s.skill].total += s.total
    })
    return {
      xp: progress.xp,
      streak: progress.streak.current,
      completedLessons: progress.completedLessons.length,
      wordLearned: Object.values(progress.wordBoxes).filter((b) => b >= 2).length,
      sessionsBySkill,
      correctBySkill,
      postCount: posts.filter((p) => p.author === user?.username).length,
      languages: new Set(progress.completedLessons.map((id) => id.split('-')[0])).size,
    }
  }, [progress, posts, user])

  const unlocked = new Set(progress.unlockedAchievements)
  const tiers = { bronze: '铜牌', silver: '银牌', gold: '金牌' } as const

  const countByTier = (tier: string) => ACHIEVEMENTS.filter((a) => a.tier === tier && unlocked.has(a.id)).length
  const totalByTier = (tier: string) => ACHIEVEMENTS.filter((a) => a.tier === tier).length

  return (
    <div>
      <PageHeader title="成就墙" subtitle={`每一个徽章都是坚持的见证 · 已解锁 ${unlocked.size}/${ACHIEVEMENTS.length}`} />

      <div className="ach-summary">
        <StatTile icon="🥉" label="铜牌成就" value={`${countByTier('bronze')}/${totalByTier('bronze')}`} color="#b4794f" />
        <StatTile icon="🥈" label="银牌成就" value={`${countByTier('silver')}/${totalByTier('silver')}`} color="#8a93ab" />
        <StatTile icon="🥇" label="金牌成就" value={`${countByTier('gold')}/${totalByTier('gold')}`} color="#d4a017" />
        <StatTile icon="🔥" label="最长连击" value={`${progress.streak.best} 天`} color="#f97316" />
      </div>

      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id)
          const prog = a.progress?.(ctx)
          return (
            <Card key={a.id} className={cn('ach-card', isUnlocked ? 'unlocked' : 'locked')}>
              <div className="ach-icon-xl">{isUnlocked ? a.icon : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div className="ach-name">
                  {a.name}
                  <span className={`tier-badge-${a.tier}`}>{tiers[a.tier]}</span>
                </div>
                <div className="ach-desc">{a.desc}</div>
                {isUnlocked ? (
                  <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ 已解锁</span>
                ) : prog ? (
                  <div>
                    <ProgressBar value={prog.current} max={prog.target} height={6} color="#d4a017" />
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      {prog.current}/{prog.target}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
