import { useNavigate } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, LANGUAGES, LESSONS, LEVELS, COURSE_STRUCTURE } from '@/data/content'
import { cn } from '@/lib/utils'
import { PageHeader, ProgressBar } from '@/components/ui'

export default function Courses() {
  const { progress, setCurrentLang } = useAppData()
  const navigate = useNavigate()
  const lang = getLanguage(progress.currentLang)
  const lessons = LESSONS[progress.currentLang]
  const done = new Set(progress.completedLessons)

  // 计算每个等级的完成进度，并据此判断解锁状态
  const levelStats = LEVELS[progress.currentLang].map((lv) => {
    const levelLessons = lessons.filter((l) => l.level === lv.index)
    const doneCount = levelLessons.filter((l) => done.has(l.id)).length
    return { lv, total: levelLessons.length, doneCount }
  })

  // 等级解锁规则：第 0 级默认解锁；后续等级需前一级完成度 >= 60%
  const isUnlocked = (levelIdx: number) => {
    if (levelIdx === 0) return true
    const prev = levelStats[levelIdx - 1]
    return prev.total > 0 && prev.doneCount / prev.total >= 0.6
  }

  const openLesson = (lessonId: string, locked: boolean) => {
    if (locked) return
    navigate(`/learn/lesson/${lessonId}`)
  }

  return (
    <div>
      <PageHeader
        title="分级课程体系"
        subtitle="对标权威语言等级标准，循序渐进，从零基础到接近母语者"
      />

      <div className="course-lang-tabs">
        {LANGUAGES.map((l) => {
          const count = LESSONS[l.code].filter((ls) => progress.completedLessons.includes(ls.id)).length
          return (
            <div
              key={l.code}
              className={cn('course-lang-card', progress.currentLang === l.code && 'active')}
              onClick={() => setCurrentLang(l.code)}
            >
              <span className="clc-flag">{l.flag}</span>
              <div>
                <div className="clc-name">{l.name} · {l.nativeName}</div>
                <div className="clc-meta">{l.levelSystem} · 已完成 {count}/30</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="level-track">
        {levelStats.map(({ lv, total, doneCount }) => {
          const unlocked = isUnlocked(lv.index)
          const pct = total ? Math.round((doneCount / total) * 100) : 0
          const levelLessons = lessons.filter((l) => l.level === lv.index)
          return (
            <div key={lv.code} className={cn('level-block', !unlocked && 'locked')}>
              <div className="level-head">
                <div className="level-code" style={{ background: unlocked ? lang.color : '#b4b7cc' }}>
                  <span className="lc-code">{lv.code}</span>
                  <span className="lc-num">LV.{lv.index + 1}</span>
                </div>
                <div className="level-head-info">
                  <h3>{lv.title}
                    {!unlocked && <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-3)' }}>🔒 完成上一等级 60% 解锁</span>}
                  </h3>
                  <p>{lv.desc}</p>
                </div>
                <div className="level-progress-wrap">
                  <div className="lp-pct">{doneCount}/{total} · {pct}%</div>
                  <ProgressBar value={doneCount} max={total} color={lang.color} />
                </div>
              </div>

              {unlocked &&
                COURSE_STRUCTURE[lv.index].map((unit, ui) => {
                  const unitLessons = levelLessons.filter((l) => l.unit === ui)
                  return (
                    <div key={ui} className="unit-row">
                      <div className="unit-title">{unit.title}</div>
                      <div className="lesson-grid">
                        {unitLessons.map((l) => {
                          const isDone = done.has(l.id)
                          const globalOrder = l.level * 6 + l.unit * 2 + l.order + 1
                          return (
                            <div
                              key={l.id}
                              className="lesson-card"
                              onClick={() => openLesson(l.id, false)}
                            >
                              {isDone ? (
                                <span className="lc-check">✓</span>
                              ) : (
                                <span className="lc-order">{globalOrder}</span>
                              )}
                              <h4>{l.title}</h4>
                              <p>{l.summary}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
