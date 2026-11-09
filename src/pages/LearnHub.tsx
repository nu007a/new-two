import { useNavigate } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, LESSONS, SKILL_META } from '@/data/content'
import { computeSkillStats } from '@/lib/recommend'
import { Card, PageHeader, ProgressBar } from '@/components/ui'

const ROUTES: Record<string, string> = {
  vocab: '/learn/vocab',
  grammar: '/learn/grammar',
  listening: '/learn/listening',
  speaking: '/learn/speaking',
}

export default function LearnHub() {
  const { progress } = useAppData()
  const navigate = useNavigate()
  const lang = getLanguage(progress.currentLang)
  const stats = computeSkillStats(progress, progress.currentLang)
  const doneCount = LESSONS[progress.currentLang].filter((l) =>
    progress.completedLessons.includes(l.id),
  ).length

  return (
    <div>
      <PageHeader
        title="互动练习中心"
        subtitle={`选择你喜欢的方式，沉浸在${lang.name}学习中 · ${lang.nativeName}`}
      />

      <div
        className="module-hero"
        style={{ background: `linear-gradient(120deg, ${lang.color}, #a855f7)` }}
      >
        <span className="mh-icon">{lang.flag}</span>
        <div style={{ flex: 1 }}>
          <h2>{lang.name}专项训练</h2>
          <p>听说读写四位一体，每个模块都会计入学习进度与成长档案</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{doneCount}/30</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>已完成课程</div>
        </div>
      </div>

      <div className="module-grid">
        {SKILL_META.map((m) => {
          const st = stats.find((s) => s.key === m.key)!
          return (
            <button key={m.key} className="module-entry" onClick={() => navigate(ROUTES[m.key])}>
              <div className="me-icon">{m.icon}</div>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <div className="me-stat">
                {st.total > 0 ? (
                  <>
                    已练习 {st.sessions} 次 · 正确率 {st.accuracy}%
                  </>
                ) : (
                  '还没有练习记录，来试试吧'
                )}
              </div>
              {st.total > 0 && (
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={st.accuracy} color={m.color} height={6} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <Card className="mt-24">
        <div className="section-title">💡 学习建议</div>
        <div style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.9 }}>
          <p>① <strong>新内容学习顺序：</strong>先通过「单词记忆」掌握核心词汇，再到「语法练习」理解句型，然后用「听力」输入、「口语」输出。</p>
          <p>② <strong>碎片时间：</strong>通勤时适合听力与单词闪卡，安静环境下更适合口语跟读。</p>
          <p>③ <strong>效果最佳的秘诀：</strong>每天完成当日 XP 目标，比周末突击 3 小时有效得多。</p>
        </div>
      </Card>
    </div>
  )
}
