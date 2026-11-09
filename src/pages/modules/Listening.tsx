import { useEffect, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, LESSONS } from '@/data/content'
import type { ListeningQuestion } from '@/types'
import { speak, stopSpeak, ttsSupported } from '@/lib/speech'
import { shuffle } from '@/lib/utils'
import { Button, PageHeader } from '@/components/ui'
import { calcXp, OptionList, ResultScreen, useAchievementPopup } from '@/components/exercise'

type Phase = 'intro' | 'quiz' | 'result'
const QUIZ_COUNT = 6

export default function Listening() {
  const { progress, recordSession } = useAppData()
  const lang = getLanguage(progress.currentLang)

  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [questions, setQuestions] = useState<ListeningQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [showText, setShowText] = useState(false)
  const { show, node } = useAchievementPopup()

  useEffect(() => () => stopSpeak(), [])

  const start = () => {
    const pool = LESSONS[progress.currentLang].map((l) => l.listening)
    setQuestions(shuffle(pool).slice(0, QUIZ_COUNT))
    setIdx(0)
    setSelected(null)
    setCorrect(0)
    setPlayCount(0)
    setShowText(false)
    setPhase('quiz')
  }

  const play = async (rate = 1) => {
    setPlaying(true)
    await speak(questions[idx].audioText, lang.locale, rate)
    setPlaying(false)
    if (rate >= 1) setPlayCount((n) => n + 1)
  }

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === questions[idx].answer) setCorrect((n) => n + 1)
  }

  const next = () => {
    stopSpeak()
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setSelected(null)
      setPlayCount(0)
      setShowText(false)
    } else {
      const earned = calcXp(correct, questions.length, 14)
      setXp(earned)
      const unlocked = recordSession({ skill: 'listening', correct, total: questions.length, xp: earned })
      show(unlocked)
      setPhase('result')
    }
  }

  if (phase === 'intro') {
    return (
      <div>
        <PageHeader title="🎧 听力训练" subtitle={`${lang.flag} ${lang.name} · 真实场景，磨出金耳朵`} />
        <div className="card quiz-shell text-center" style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🎧</div>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>{QUIZ_COUNT} 段场景听力</h2>
          <p className="text-muted mt-8" style={{ lineHeight: 1.8 }}>
            先听音频回答问题，没听清可以反复播放、放慢语速。
            <br />
            答题后可查看原文，对照发现自己的听力盲区。
          </p>
          {!ttsSupported && (
            <div className="quiz-explain" style={{ textAlign: 'left', marginTop: 18 }}>
              <strong>⚠️ 当前浏览器可能不支持语音合成</strong>
              推荐使用 Chrome / Edge 浏览器以获得最佳听力体验。
            </div>
          )}
          <Button size="lg" onClick={start} className="mt-20">
            开始听力训练 →
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
        <PageHeader title="🎧 听力训练" subtitle={`${lang.flag} ${lang.name}`} />
        <ResultScreen
          key={round}
          correct={correct}
          total={questions.length}
          xp={xp}
          emoji={pct >= 0.8 ? '🎧' : pct >= 0.6 ? '👂' : '🔁'}
          title={pct >= 0.8 ? '金耳朵就是你！' : pct >= 0.6 ? '听力感觉不错' : '多听几遍就会越来越顺'}
          praise="坚持盲听—看原文—再盲听的三遍法，进步会非常快"
          color="#10b981"
          onRetry={() => { setRound((r) => r + 1); start() }}
          retryLabel="再听一组"
          continueTo="/learn/speaking"
          continueLabel="去练口语"
        />
        {node}
      </div>
    )
  }

  const q = questions[idx]
  return (
    <div>
      <PageHeader title="🎧 听力训练" subtitle={`${lang.flag} ${lang.name} · 第 ${idx + 1}/${questions.length} 段`} />
      <div className="quiz-shell">
        <div className="quiz-top">
          <span className="quiz-count">{idx + 1}/{questions.length}</span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(idx / questions.length) * 100}%`, background: 'var(--green)' }} />
          </div>
          <span className="quiz-count">✅ {correct}</span>
        </div>

        <div className="card listen-card">
          <div className="text-muted text-sm" style={{ fontWeight: 700 }}>🔈 点击播放，听音频回答问题</div>
          <div style={{ margin: '18px 0 4px' }}>
            <button className={`listen-play ${playing ? 'playing' : ''}`} onClick={() => play(1)} disabled={playing}>
              {playing ? '⏸' : '▶'}
            </button>
          </div>
          <div className="wave-hint">
            <span /><span /><span /><span /><span />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => play(0.7)} disabled={playing}>🐢 慢速播放</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowText((s) => !s)}>
              {showText ? '隐藏原文' : '👁 查看原文'}
            </Button>
          </div>
          <div className="text-muted text-sm mt-12">已播放 {playCount} 次</div>

          {showText && (
            <div className="quiz-explain" style={{ textAlign: 'left', marginTop: 16 }}>
              <strong>📄 听力原文</strong>
              {q.audioText}
            </div>
          )}
        </div>

        <h3 className="text-center mt-20 mb-16" style={{ fontSize: 17 }}>{q.title}</h3>
        <OptionList
          options={q.options}
          answer={selected !== null ? q.answer : undefined}
          selected={selected}
          onSelect={answer}
        />

        {selected !== null && (
          <>
            <div className="quiz-explain">
              <strong>{selected === q.answer ? '✅ 听对了！' : '❌ 正确答案见上方绿色选项'}</strong>
              原文：{q.audioText}
            </div>
            <div className="text-center mt-20">
              <Button onClick={next}>{idx + 1 < questions.length ? '下一段 →' : '查看成绩 🏁'}</Button>
            </div>
          </>
        )}
      </div>
      {node}
    </div>
  )
}
