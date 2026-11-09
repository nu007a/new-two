import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { ALL_WORDS, getLanguage } from '@/data/content'
import type { Word } from '@/types'
import { speak, ttsSupported } from '@/lib/speech'
import { shuffle } from '@/lib/utils'
import { Button, PageHeader } from '@/components/ui'
import { calcXp, OptionList, ResultScreen, useAchievementPopup } from '@/components/exercise'

type Phase = 'intro' | 'study' | 'quiz' | 'result'
const STUDY_COUNT = 8
const QUIZ_COUNT = 6

export default function Vocabulary() {
  const { progress, recordSession, updateWordBox } = useAppData()
  const navigate = useNavigate()
  const lang = getLanguage(progress.currentLang)

  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [deck, setDeck] = useState<Word[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [knownCount, setKnownCount] = useState(0)

  // quiz
  const [quizWords, setQuizWords] = useState<Word[]>([])
  const [options, setOptions] = useState<string[][]>([])
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [earnedXp, setEarnedXp] = useState(0)

  const { show, node } = useAchievementPopup()

  const masteredCount = useMemo(
    () => Object.entries(progress.wordBoxes).filter(([id, b]) => id.startsWith(progress.currentLang) && b >= 2).length,
    [progress.wordBoxes, progress.currentLang],
  )
  const dueCount = useMemo(
    () => Object.entries(progress.wordBoxes).filter(([id, b]) => id.startsWith(progress.currentLang) && b <= 2).length,
    [progress.wordBoxes, progress.currentLang],
  )

  const buildDeck = () => {
    const all = ALL_WORDS[progress.currentLang]
    // 优先取出需要复习的单词，其余随机补充
    const dueIds = new Set(
      Object.entries(progress.wordBoxes)
        .filter(([id, b]) => id.startsWith(progress.currentLang) && b <= 2)
        .map(([id]) => id),
    )
    const due = all.filter((w) => dueIds.has(w.id))
    const pool = shuffle(all.filter((w) => !dueIds.has(w.id)))
    const picked = [...shuffle(due), ...pool].slice(0, STUDY_COUNT)
    return picked.length >= 4 ? picked : shuffle(all).slice(0, STUDY_COUNT)
  }

  const start = () => {
    const d = buildDeck()
    setDeck(d)
    setIdx(0)
    setFlipped(false)
    setKnownCount(0)
    setQuizCorrect(0)
    setPhase('study')
  }

  const gradeFlash = (known: boolean) => {
    const w = deck[idx]
    updateWordBox(w.id, known)
    if (known) setKnownCount((n) => n + 1)
    if (idx + 1 < deck.length) {
      setIdx(idx + 1)
      setFlipped(false)
    } else {
      // 进入测验阶段
      const qw = shuffle(deck).slice(0, Math.min(QUIZ_COUNT, deck.length))
      const opts = qw.map((w) => {
        const distractors = shuffle(ALL_WORDS[progress.currentLang].filter((x) => x.id !== w.id))
          .slice(0, 3)
          .map((x) => x.meaning)
        return shuffle([w.meaning, ...distractors])
      })
      setQuizWords(qw)
      setOptions(opts)
      setQIdx(0)
      setSelected(null)
      setPhase('quiz')
    }
  }

  const answerQuiz = (i: number) => {
    if (selected !== null) return
    const w = quizWords[qIdx]
    const correctIdx = options[qIdx].indexOf(w.meaning)
    setSelected(i)
    const ok = i === correctIdx
    updateWordBox(w.id, ok)
    if (ok) setQuizCorrect((n) => n + 1)
  }

  const nextQuiz = () => {
    if (qIdx + 1 < quizWords.length) {
      setQIdx(qIdx + 1)
      setSelected(null)
    } else {
      const total = quizWords.length
      const xp = calcXp(quizCorrect, total, 12) + 16 // 学习阶段奖励
      const unlocked = recordSession({ skill: 'vocab', correct: quizCorrect, total, xp })
      setEarnedXp(xp)
      show(unlocked)
      setPhase('result')
    }
  }

  const restart = () => {
    setRound((r) => r + 1)
    start()
  }

  // ---------- 介绍页 ----------
  if (phase === 'intro') {
    return (
      <div>
        <PageHeader title="🃏 单词闪卡" subtitle={`${lang.flag} ${lang.name} · 间隔重复记忆法`} />
        <div className="card quiz-shell text-center" style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🃏</div>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>每天 {STUDY_COUNT} 张卡，单词想忘都难</h2>
          <p className="text-muted mt-8" style={{ lineHeight: 1.8 }}>
            卡片正面是单词，点击卡片翻面查看释义与例句。
            <br />
            系统会根据你的熟悉程度，用 Leitner 记忆盒智能安排复习时机。
          </p>
          <div className="result-stats" style={{ gap: 48 }}>
            <div className="result-stat">
              <div className="rs-num" style={{ color: 'var(--green)' }}>{masteredCount}</div>
              <div className="rs-label">已掌握单词</div>
            </div>
            <div className="result-stat">
              <div className="rs-num" style={{ color: 'var(--amber)' }}>{dueCount}</div>
              <div className="rs-label">待复习</div>
            </div>
          </div>
          <Button size="lg" onClick={start} className="mt-12">
            开始今日单词卡 →
          </Button>
        </div>
        {node}
      </div>
    )
  }

  // ---------- 结算页 ----------
  if (phase === 'result') {
    return (
      <div>
        <PageHeader title="🃏 单词闪卡" subtitle={`${lang.flag} ${lang.name}`} />
        <ResultScreen
          key={round}
          correct={quizCorrect}
          total={quizWords.length}
          xp={earnedXp}
          emoji={quizCorrect / quizWords.length >= 0.8 ? '🎉' : quizCorrect / quizWords.length >= 0.6 ? '💪' : '📖'}
          title={quizCorrect / quizWords.length >= 0.8 ? '记忆力惊人！' : quizCorrect / quizWords.length >= 0.6 ? '继续保持！' : '多复习几次就记住了'}
          praise={`本组共学习 ${deck.length} 个单词，其中 ${knownCount} 个你已经认识`}
          color="#6366f1"
          onRetry={restart}
          retryLabel="再来一组"
          continueTo="/learn/grammar"
          continueLabel="去练语法"
        />
        {node}
      </div>
    )
  }

  // ---------- 学习阶段 ----------
  if (phase === 'study') {
    const w = deck[idx]
    return (
      <div>
        <PageHeader title="🃏 单词闪卡" subtitle={`${lang.flag} ${lang.name} · 学习阶段（${idx + 1}/${deck.length}）`} />
        <div className="flash-progress">
          <span className="quiz-count">{idx + 1}/{deck.length}</span>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${((idx) / deck.length) * 100}%` }} /></div>
        </div>
        <div className="flash-stage">
          <div className={`flash-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(true)}>
            <div className="flash-face flash-front">
              <button
                className="speak-btn"
                disabled={!ttsSupported}
                onClick={(e) => { e.stopPropagation(); speak(w.text, lang.locale, 0.9) }}
                title="朗读单词"
              >🔊</button>
              <div className="flash-word" style={{ marginTop: 14 }}>{w.text}</div>
              <div className="flash-phonetic">{w.phonetic}</div>
              <div className="flash-hint">👆 点击卡片查看释义</div>
            </div>
            <div className="flash-face flash-back">
              <div className="flash-meaning">{w.meaning}</div>
              <button
                className="speak-btn"
                onClick={(e) => { e.stopPropagation(); speak(w.example, lang.locale, 0.95) }}
                title="朗读例句"
              >🔊</button>
              <div className="flash-example" style={{ marginTop: 12 }}>{w.example}</div>
              <div className="flash-example-zh">{w.exampleZh}</div>
            </div>
          </div>
          <div className="flash-actions">
            <Button variant="danger" disabled={!flipped} onClick={() => gradeFlash(false)}>
              😣 还不认识
            </Button>
            <Button variant="secondary" onClick={() => setFlipped((f) => !f)}>
              🔄 翻面
            </Button>
            <Button variant="success" disabled={!flipped} onClick={() => gradeFlash(true)}>
              😎 认识
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- 测验阶段 ----------
  const w = quizWords[qIdx]
  const correctIdx = options[qIdx].indexOf(w.meaning)
  return (
    <div>
      <PageHeader title="🃏 单词闪卡" subtitle={`${lang.flag} ${lang.name} · 选词测验（${qIdx + 1}/${quizWords.length}）`} />
      <div className="quiz-shell">
        <div className="quiz-top">
          <span className="quiz-count">{qIdx + 1}/{quizWords.length}</span>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(qIdx / quizWords.length) * 100}%` }} /></div>
        </div>
        <div className="card text-center" style={{ padding: '30px 24px' }}>
          <button
            className="speak-btn"
            style={{ width: 54, height: 54, fontSize: 24 }}
            disabled={!ttsSupported}
            onClick={() => speak(w.text, lang.locale, 0.9)}
          >🔊</button>
          <div className="quiz-prompt" style={{ marginBottom: 4 }}>{w.text}</div>
          <div className="text-muted text-sm">{w.phonetic}</div>
        </div>
        <h3 className="text-center mt-20 mb-16" style={{ fontSize: 15 }}>选择正确的释义</h3>
        <OptionList
          options={options[qIdx]}
          answer={selected !== null ? correctIdx : undefined}
          selected={selected}
          onSelect={answerQuiz}
        />
        {selected !== null && (
          <>
            <div className="quiz-explain">
              <strong>{selected === correctIdx ? '✅ 回答正确！' : '❌ 正确答案见上方绿色选项'}</strong>
              {w.example} —— {w.exampleZh}
            </div>
            <div className="text-center mt-20">
              <Button onClick={nextQuiz}>{qIdx + 1 < quizWords.length ? '下一题 →' : '查看成绩 🏁'}</Button>
            </div>
          </>
        )}
      </div>
      {node}
    </div>
  )
}
