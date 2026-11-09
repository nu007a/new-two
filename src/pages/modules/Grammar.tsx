import { useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, LESSONS } from '@/data/content'
import type { GrammarQuestion } from '@/types'
import { shuffle } from '@/lib/utils'
import { Button, PageHeader } from '@/components/ui'
import { calcXp, OptionList, ResultScreen, useAchievementPopup } from '@/components/exercise'

type Phase = 'intro' | 'quiz' | 'result'
const QUIZ_COUNT = 8

export default function Grammar() {
  const { progress, recordSession } = useAppData()
  const lang = getLanguage(progress.currentLang)

  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [questions, setQuestions] = useState<GrammarQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState(0)
  const { show, node } = useAchievementPopup()

  const start = () => {
    // 汇总当前语言所有课程的语法题，随机抽取
    const pool = LESSONS[progress.currentLang].flatMap((l) => l.grammar)
    setQuestions(shuffle(pool).slice(0, QUIZ_COUNT))
    setIdx(0)
    setSelected(null)
    setCorrect(0)
    setPhase('quiz')
  }

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === questions[idx].answer) setCorrect((n) => n + 1)
  }

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setSelected(null)
    } else {
      const earned = calcXp(correct, questions.length, 12)
      setXp(earned)
      const unlocked = recordSession({ skill: 'grammar', correct, total: questions.length, xp: earned })
      show(unlocked)
      setPhase('result')
    }
  }

  if (phase === 'intro') {
    return (
      <div>
        <PageHeader title="✏️ 语法练习" subtitle={`${lang.flag} ${lang.name} · 即时解析，学懂每一个句型`} />
        <div className="card quiz-shell text-center" style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>✏️</div>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>{QUIZ_COUNT} 道精选语法题</h2>
          <p className="text-muted mt-8" style={{ lineHeight: 1.8 }}>
            选择或填空完成句子，提交后立刻看到答案与语法讲解。
            <br />
            题目覆盖当前语言课程中的全部核心语法点。
          </p>
          <Button size="lg" onClick={start} className="mt-20">
            开始答题 →
          </Button>
        </div>
        {node}
      </div>
    )
  }

  if (phase === 'result') {
    const pct = correct / questions.length
    return (
      <div>
        <PageHeader title="✏️ 语法练习" subtitle={`${lang.flag} ${lang.name}`} />
        <ResultScreen
          key={round}
          correct={correct}
          total={questions.length}
          xp={xp}
          emoji={pct >= 0.8 ? '🧠' : pct >= 0.6 ? '✍️' : '📚'}
          title={pct >= 0.8 ? '语法功底扎实！' : pct >= 0.6 ? '差一点点满分' : '回头复习一下讲解吧'}
          praise="错题解析已经展示在答题过程中，牢记规则下次一定对"
          color="#f59e0b"
          onRetry={() => { setRound((r) => r + 1); start() }}
          retryLabel="再练一组"
          continueTo="/learn/listening"
          continueLabel="去练听力"
        />
        {node}
      </div>
    )
  }

  const q = questions[idx]
  return (
    <div>
      <PageHeader title="✏️ 语法练习" subtitle={`${lang.flag} ${lang.name} · 第 ${idx + 1}/${questions.length} 题`} />
      <div className="quiz-shell">
        <div className="quiz-top">
          <span className="quiz-count">{idx + 1}/{questions.length}</span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(idx / questions.length) * 100}%`, background: 'var(--amber)' }} />
          </div>
          <span className="quiz-count">✅ {correct}</span>
        </div>

        <div className="card" style={{ padding: '30px 26px' }}>
          <div className="text-muted text-sm mb-16" style={{ fontWeight: 700 }}>📝 选择最合适的选项补全句子</div>
          <div className="quiz-prompt" style={{ textAlign: 'left', fontSize: 24 }}>{q.prompt}</div>
        </div>

        <div className="mt-16">
          <OptionList
            options={q.options}
            answer={selected !== null ? q.answer : undefined}
            selected={selected}
            onSelect={answer}
          />
        </div>

        {selected !== null && (
          <>
            <div className="quiz-explain">
              <strong>{selected === q.answer ? '✅ 回答正确！' : '❌ 答错了，看看解析'}</strong>
              {q.explanation}
            </div>
            <div className="text-center mt-20">
              <Button onClick={next}>{idx + 1 < questions.length ? '下一题 →' : '查看成绩 🏁'}</Button>
            </div>
          </>
        )}
      </div>
      {node}
    </div>
  )
}
