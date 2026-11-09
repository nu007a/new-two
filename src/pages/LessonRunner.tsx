import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, getLesson, LESSONS, LEVELS } from '@/data/content'
import { asrSupported, recognize, speak, stopSpeak, ttsSupported } from '@/lib/speech'
import type { Language, Lesson, Word } from '@/types'
import { cn, similarity } from '@/lib/utils'
import { Button, ProgressBar, ProgressRing } from '@/components/ui'
import { useAchievementPopup } from '@/components/exercise'

type TabKey = 'vocab' | 'grammar' | 'listening' | 'speaking'
const TABS: { key: TabKey; icon: string; name: string }[] = [
  { key: 'vocab', icon: '🃏', name: '单词' },
  { key: 'grammar', icon: '✏️', name: '语法' },
  { key: 'listening', icon: '🎧', name: '听力' },
  { key: 'speaking', icon: '🎙️', name: '口语' },
]

export default function LessonRunner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progress, markLessonTab, completeLesson } = useAppData()
  const lesson = id ? getLesson(id) : undefined
  const { show, node } = useAchievementPopup()

  const [tab, setTab] = useState<TabKey>('vocab')
  const [finished, setFinished] = useState(false)

  useEffect(() => () => stopSpeak(), [])

  const doneTabs = useMemo(() => new Set(progress.lessonTabs[id ?? ''] ?? []), [progress.lessonTabs, id])
  const allDone = TABS.every((t) => doneTabs.has(t.key))

  if (!lesson) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>课程不存在</h3>
        <p>可能链接已失效，请返回课程列表重新选择</p>
        <Button onClick={() => navigate('/courses')}>返回课程列表</Button>
      </div>
    )
  }

  const lang = getLanguage(lesson.lang)
  const level = LEVELS[lesson.lang][lesson.level]
  const isDone = progress.completedLessons.includes(lesson.id)

  const completeTab = (key: TabKey) => markLessonTab(lesson.id, key)

  const finishLesson = () => {
    const res = completeLesson(lesson.id)
    setFinished(true)
    if (res.newAchievements.length) show(res.newAchievements)
  }

  const goNext = () => {
    const list = LESSONS[lesson.lang]
    const cur = list.findIndex((l) => l.id === lesson.id)
    const nextLesson = list[cur + 1]
    navigate(nextLesson ? `/learn/lesson/${nextLesson.id}` : '/courses')
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/courses" className="text-muted text-sm" style={{ fontWeight: 600 }}>← 返回课程列表</Link>
      </div>

      <div className="lesson-intro">
        <div className="text-muted text-sm" style={{ fontWeight: 700 }}>
          {lang.flag} {lang.name} · {level.code} {level.title} · 第 {lesson.unit * 2 + lesson.order + 1} 课
        </div>
        <h2>{lesson.title}</h2>
        <p>{lesson.summary}</p>
      </div>

      <div className="text-center" style={{ margin: '16px 0 22px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span className="text-sm text-muted">环节完成度 {doneTabs.size}/4</span>
          <div style={{ width: 200 }}>
            <ProgressBar value={doneTabs.size} max={4} color={lang.color} />
          </div>
        </div>
      </div>

      <div className="lesson-tabs" style={{ margin: '0 auto 24px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={cn('lesson-tab', tab === t.key && 'active')}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span>
            {t.name}
            {doneTabs.has(t.key) && <span className="lt-done">✓</span>}
          </button>
        ))}
      </div>

      {tab === 'vocab' && <VocabTab lang={lang} words={lesson.words} onDone={() => completeTab('vocab')} done={doneTabs.has('vocab')} />}
      {tab === 'grammar' && <GrammarTab lang={lang} lesson={lesson} onDone={() => completeTab('grammar')} done={doneTabs.has('grammar')} />}
      {tab === 'listening' && <ListeningTab lang={lang} lesson={lesson} onDone={() => completeTab('listening')} done={doneTabs.has('listening')} />}
      {tab === 'speaking' && <SpeakingTab lang={lang} lesson={lesson} onDone={() => completeTab('speaking')} done={doneTabs.has('speaking')} />}

      <div className="text-center mt-24">
        {!allDone ? (
          <div className="text-muted text-sm">完成全部四个环节后即可结课并获得 50 XP</div>
        ) : !isDone ? (
          <Button size="lg" variant="success" onClick={finishLesson}>
            🎓 完成课程，领取 50 XP
          </Button>
        ) : (
          <div className="flex-center gap-12">
            <span style={{ color: 'var(--green)', fontWeight: 800 }}>✅ 本课已完成</span>
            <Button onClick={goNext}>下一课 →</Button>
          </div>
        )}
      </div>

      {finished && (
        <div className="card mt-24 text-center" style={{ maxWidth: 520, margin: '24px auto 0', borderColor: 'var(--green)' }}>
          <div style={{ fontSize: 42 }}>🎉</div>
          <h3 style={{ margin: '8px 0' }}>课程完成！</h3>
          <p className="text-muted">你获得了 50 XP，连续学习记录已更新</p>
          <div className="result-actions">
            <Button variant="secondary" onClick={() => navigate('/courses')}>返回课程</Button>
            <Button onClick={goNext}>继续下一课 →</Button>
          </div>
        </div>
      )}
      {node}
    </div>
  )
}

// ================= 单词环节 =================
function VocabTab({ lang, words, onDone, done }: { lang: Language; words: Word[]; onDone: () => void; done: boolean }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  return (
    <div className="quiz-shell">
      <div className="text-muted text-sm mb-16">🃏 点击单词卡翻面，学习释义与例句，点击喇叭听发音</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
        {words.map((w) => {
          const open = !!revealed[w.id]
          return (
            <div
              key={w.id}
              className="card card-clickable"
              style={{ padding: 18, minHeight: 150, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              onClick={() => setRevealed((r) => ({ ...r, [w.id]: !open }))}
            >
              {!open ? (
                <>
                  <button
                    className="speak-btn"
                    style={{ margin: '0 auto 8px', width: 40, height: 40, fontSize: 18 }}
                    disabled={!ttsSupported}
                    onClick={(e) => { e.stopPropagation(); speak(w.text, lang.locale, 0.9) }}
                  >🔊</button>
                  <div style={{ fontSize: 21, fontWeight: 800 }}>{w.text}</div>
                  <div className="text-muted text-sm">{w.phonetic}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--primary-dark)' }}>{w.meaning}</div>
                  <div className="text-sm mt-8">{w.example}</div>
                  <div className="text-muted text-sm">{w.exampleZh}</div>
                </>
              )}
            </div>
          )
        })}
      </div>
      <div className="text-center mt-20">
        <Button variant={done ? 'secondary' : 'success'} onClick={onDone} disabled={done}>
          {done ? '✓ 单词环节已完成' : '我已学完这些单词'}
        </Button>
      </div>
    </div>
  )
}

// ================= 语法环节 =================
function GrammarTab({ lang: _lang, lesson, onDone, done }: { lang: Language; lesson: Lesson; onDone: () => void; done: boolean }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const all = lesson.grammar.every((g) => answers[g.id] === g.answer)
  return (
    <div className="quiz-shell">
      <div className="text-muted text-sm mb-16">✏️ 完成本课的 {lesson.grammar.length} 道语法题</div>
      {lesson.grammar.map((g, gi) => {
        const sel = answers[g.id]
        const answered = sel !== undefined
        return (
          <div key={g.id} className="card mb-16">
            <div style={{ fontWeight: 800, marginBottom: 12 }}>{gi + 1}. {g.prompt}</div>
            <div className="quiz-options">
              {g.options.map((opt, oi) => {
                let cls = ''
                if (answered) {
                  if (oi === g.answer) cls = 'correct'
                  else if (oi === sel) cls = 'wrong'
                }
                return (
                  <button
                    key={oi}
                    className={`quiz-option ${cls}`}
                    style={{ padding: '11px 16px', fontSize: 15 }}
                    disabled={answered}
                    onClick={() => setAnswers((a) => ({ ...a, [g.id]: oi }))}
                  >
                    <span className="qo-key">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {answered && (
              <div className="quiz-explain" style={{ marginTop: 12 }}>
                <strong>{sel === g.answer ? '✅ 正确' : '❌ 再理解一下'}</strong>
                {g.explanation}
              </div>
            )}
          </div>
        )
      })}
      <div className="text-center">
        <Button variant={done ? 'secondary' : all ? 'success' : 'secondary'} disabled={!all} onClick={onDone}>
          {done ? '✓ 语法环节已完成' : all ? '全部答对，完成本环节' : '答对全部题目后完成'}
        </Button>
      </div>
    </div>
  )
}

// ================= 听力环节 =================
function ListeningTab({ lang, lesson, onDone, done }: { lang: Language; lesson: Lesson; onDone: () => void; done: boolean }) {
  const q = lesson.listening
  const [sel, setSel] = useState<number | null>(null)
  const [showText, setShowText] = useState(false)
  const [playing, setPlaying] = useState(false)
  const correct = sel === q.answer

  const play = async () => {
    setPlaying(true)
    await speak(q.audioText, lang.locale, 0.95)
    setPlaying(false)
  }

  return (
    <div className="quiz-shell">
      <div className="card listen-card">
        <button className={`listen-play ${playing ? 'playing' : ''}`} onClick={play} disabled={playing}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="wave-hint"><span /><span /><span /><span /><span /></div>
        <Button variant="secondary" size="sm" onClick={() => setShowText((s) => !s)}>
          {showText ? '隐藏原文' : '👁 查看原文'}
        </Button>
        {showText && <div className="quiz-explain" style={{ textAlign: 'left', marginTop: 14 }}><strong>原文</strong>{q.audioText}</div>}
      </div>
      <h3 className="text-center mt-20 mb-16">{q.title}</h3>
      <div className="quiz-options">
        {q.options.map((opt, oi) => {
          let cls = ''
          if (sel !== null) {
            if (oi === q.answer) cls = 'correct'
            else if (oi === sel) cls = 'wrong'
          }
          return (
            <button key={oi} className={`quiz-option ${cls}`} disabled={sel !== null} onClick={() => setSel(oi)}>
              <span className="qo-key">{String.fromCharCode(65 + oi)}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {sel !== null && (
        <div className="text-center mt-20">
          <Button variant={done ? 'secondary' : correct ? 'success' : 'secondary'} onClick={onDone} disabled={done || !correct}>
            {done ? '✓ 听力环节已完成' : correct ? '答对了，完成本环节' : '答错了，再听一次试试'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ================= 口语环节 =================
function SpeakingTab({ lang, lesson, onDone, done }: { lang: Language; lesson: Lesson; onDone: () => void; done: boolean }) {
  const sp = lesson.speaking
  const [recording, setRecording] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  const startRec = () => {
    setRecording(true)
    setScore(null)
    if (!asrSupported()) {
      setRecording(false)
      return
    }
    cancelRef.current = recognize(lang.locale, {
      onResult: (text) => {
        setRecording(false)
        setScore(text ? Math.round(similarity(text, sp.text) * 100) : 0)
      },
      onError: () => setRecording(false),
    })
  }

  return (
    <div className="quiz-shell">
      <div className="card">
        <div className="speak-sentence">
          <button
            className="speak-btn"
            style={{ width: 54, height: 54, fontSize: 23, marginBottom: 12 }}
            disabled={!ttsSupported}
            onClick={() => speak(sp.text, lang.locale, 0.9)}
          >🔊</button>
          <div className="ss-text">{sp.text}</div>
          <div className="ss-zh">{sp.zh}</div>
          <div className="ss-tip">💡 {sp.tip}</div>
        </div>

        <div className="text-center mt-20">
          {asrSupported() ? (
            <>
              <button className={`mic-btn ${recording ? 'recording' : ''}`} onClick={startRec}>
                {recording ? '⏹' : '🎤'}
              </button>
              <div className="text-muted text-sm mt-12">{recording ? '正在聆听…' : '点击麦克风跟读'}</div>
            </>
          ) : (
            <div className="quiz-explain" style={{ textAlign: 'left' }}>
              <strong>自评模式</strong>
              当前浏览器不支持语音识别，听示范后跟读，然后按实际发挥自评：
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Button size="sm" variant="secondary" onClick={() => setScore(90)}>😎 很流利</Button>
                <Button size="sm" variant="secondary" onClick={() => setScore(68)}>🙂 基本可以</Button>
                <Button size="sm" style={{ background: '#fee2e2', color: 'var(--red)' }} onClick={() => setScore(45)}>😣 还需练</Button>
              </div>
            </div>
          )}
        </div>

        {score !== null && (
          <div className="score-detail mt-20">
            <div className="score-ring-wrap">
              <ProgressRing value={score} color={score >= 60 ? 'var(--green)' : 'var(--pink)'} size={104} stroke={9}>
                <span style={{ fontSize: 24, fontWeight: 900 }}>{score}</span>
              </ProgressRing>
            </div>
            <div className="text-center">
              <Button variant={done ? 'secondary' : score >= 60 ? 'success' : 'secondary'} onClick={onDone} disabled={done || score < 60}>
                {done ? '✓ 口语环节已完成' : score >= 60 ? '完成本环节' : '分数达到 60 即可完成，再试一次'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
