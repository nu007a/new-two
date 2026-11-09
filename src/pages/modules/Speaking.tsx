import { useEffect, useRef, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { getLanguage, LESSONS } from '@/data/content'
import type { SpeakingSentence } from '@/types'
import { asrSupported, recognize, speak, stopSpeak, ttsSupported } from '@/lib/speech'
import { shuffle, similarity } from '@/lib/utils'
import { Button, PageHeader, ProgressRing } from '@/components/ui'
import { calcXp, ResultScreen, useAchievementPopup } from '@/components/exercise'

type Phase = 'intro' | 'practice' | 'result'
const ROUND_COUNT = 6

interface ScoreRecord {
  sentence: SpeakingSentence
  score: number
}

export default function Speaking() {
  const { progress, recordSession } = useAppData()
  const lang = getLanguage(progress.currentLang)

  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [sentences, setSentences] = useState<SpeakingSentence[]>([])
  const [idx, setIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [partial, setPartial] = useState('')
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [xp, setXp] = useState(0)
  const cancelRef = useRef<(() => void) | null>(null)
  const { show, node } = useAchievementPopup()

  useEffect(() => () => { cancelRef.current?.(); stopSpeak() }, [])

  const start = () => {
    const pool = LESSONS[progress.currentLang].map((l) => l.speaking)
    setSentences(shuffle(pool).slice(0, ROUND_COUNT))
    setIdx(0)
    setScores([])
    setLastScore(null)
    setHeard('')
    setPartial('')
    setPhase('practice')
  }

  const s = sentences[idx]

  const record = () => {
    if (!s) return
    setRecording(true)
    setPartial('')
    setHeard('')
    setLastScore(null)
    cancelRef.current = recognize(lang.locale, {
      onPartial: (t) => setPartial(t),
      onResult: (text) => {
        setRecording(false)
        setHeard(text)
        const sc = text ? Math.round(similarity(text, s.text) * 100) : 0
        setLastScore(sc)
      },
      onError: () => setRecording(false),
    })
  }

  const stop = () => {
    cancelRef.current?.()
    setRecording(false)
  }

  /** 无 ASR 环境下的自评模式 */
  const selfGrade = (sc: number) => {
    setLastScore(sc)
    setHeard('（自评模式）')
  }

  const nextSentence = () => {
    if (lastScore === null) return
    const nextScores = [...scores, { sentence: s, score: lastScore }]
    setScores(nextScores)
    if (idx + 1 < sentences.length) {
      setIdx(idx + 1)
      setLastScore(null)
      setHeard('')
      setPartial('')
    } else {
      const avg = Math.round(nextScores.reduce((n, r) => n + r.score, 0) / nextScores.length)
      // 口语以平均分/100 折算 correct
      const correct = Math.round((avg / 100) * nextScores.length)
      const earned = calcXp(correct, nextScores.length, 14)
      setXp(earned)
      const unlocked = recordSession({
        skill: 'speaking',
        correct,
        total: nextScores.length,
        xp: earned,
      })
      show(unlocked)
      setPhase('result')
    }
  }

  if (phase === 'intro') {
    return (
      <div>
        <PageHeader title="🎙️ 口语跟读" subtitle={`${lang.flag} ${lang.name} · 大胆开口，AI 实时打分`} />
        <div className="card quiz-shell text-center" style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🎙️</div>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>{ROUND_COUNT} 句跟读挑战</h2>
          <p className="text-muted mt-8" style={{ lineHeight: 1.8 }}>
            先听母语者示范朗读，再长按麦克风跟读。
            <br />
            系统通过语音识别对比你的发音与标准句子，给出实时相似度评分。
          </p>
          {!asrSupported() && (
            <div className="quiz-explain" style={{ textAlign: 'left', marginTop: 18 }}>
              <strong>ℹ️ 当前浏览器不支持语音识别</strong>
              将使用「自评模式」：听示范后根据自己的发挥打分。如需 AI 打分，请使用 Chrome / Edge 并允许麦克风权限。
            </div>
          )}
          <Button size="lg" onClick={start} className="mt-20">
            开始跟读 →
          </Button>
        </div>
        {node}
      </div>
    )
  }

  if (phase === 'result') {
    const avg = Math.round(scores.reduce((n, r) => n + r.score, 0) / scores.length)
    return (
      <div>
        <PageHeader title="🎙️ 口语跟读" subtitle={`${lang.flag} ${lang.name}`} />
        <ResultScreen
          key={round}
          correct={Math.round((avg / 100) * scores.length)}
          total={scores.length}
          xp={xp}
          emoji={avg >= 80 ? '🌟' : avg >= 60 ? '🎯' : '💪'}
          title={avg >= 80 ? '发音非常地道！' : avg >= 60 ? '已经很不错了' : '多跟读几遍，嘴巴会记住'}
          praise={`平均发音相似度 ${avg} 分，继续模仿语调和节奏`}
          color="#ec4899"
          onRetry={() => { setRound((r) => r + 1); start() }}
          retryLabel="再练一轮"
          continueTo="/dashboard"
          continueLabel="返回首页"
          extra={
            <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
              {scores.map((r, i) => (
                <div key={i} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ flex: 1, marginRight: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.sentence.text}
                  </span>
                  <strong style={{ color: r.score >= 80 ? 'var(--green)' : r.score >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                    {r.score}
                  </strong>
                </div>
              ))}
            </div>
          }
        />
        {node}
      </div>
    )
  }

  const scoreColor = lastScore !== null && lastScore >= 80 ? 'var(--green)' : lastScore !== null && lastScore >= 60 ? 'var(--amber)' : 'var(--pink)'

  return (
    <div>
      <PageHeader title="🎙️ 口语跟读" subtitle={`${lang.flag} ${lang.name} · 第 ${idx + 1}/${sentences.length} 句`} />
      <div className="quiz-shell">
        <div className="quiz-top">
          <span className="quiz-count">{idx + 1}/{sentences.length}</span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(idx / sentences.length) * 100}%`, background: 'var(--pink)' }} />
          </div>
        </div>

        <div className="card">
          <div className="speak-sentence">
            <button
              className="speak-btn"
              style={{ width: 54, height: 54, fontSize: 23, marginBottom: 14 }}
              disabled={!ttsSupported}
              onClick={() => speak(s.text, lang.locale, 0.9)}
            >🔊</button>
            <div className="ss-text">{s.text}</div>
            <div className="ss-zh">{s.zh}</div>
            <div className="ss-tip">💡 {s.tip}</div>
          </div>

          <div className="text-center" style={{ marginTop: 24 }}>
            {asrSupported() ? (
              <>
                <button className={`mic-btn ${recording ? 'recording' : ''}`} onClick={recording ? stop : record}>
                  {recording ? '⏹' : '🎤'}
                </button>
                <div className="text-muted text-sm mt-12">
                  {recording ? '正在聆听，请大声跟读…' : '点击麦克风开始录音'}
                </div>
                {recording && partial && <div className="heard-text" style={{ marginTop: 12 }}>{partial}</div>}
              </>
            ) : (
              <div className="quiz-explain" style={{ textAlign: 'left' }}>
                <strong>自评模式</strong>
                点击上方喇叭反复听示范，大声跟读后按自己的发挥选择：
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button size="sm" variant="secondary" onClick={() => selfGrade(90)}>😎 很流利</Button>
                  <Button size="sm" variant="secondary" onClick={() => selfGrade(70)}>🙂 基本可以</Button>
                  <Button size="sm" style={{ background: '#fee2e2', color: 'var(--red)' }} onClick={() => selfGrade(45)}>😣 还需练</Button>
                </div>
              </div>
            )}
          </div>

          {lastScore !== null && (
            <div className="score-detail mt-20">
              <div className="score-ring-wrap">
                <ProgressRing value={lastScore} color={scoreColor} size={110} stroke={10}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: scoreColor }}>{lastScore}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>发音相似度</span>
                </ProgressRing>
              </div>
              {heard && (
                <div className="heard-text">
                  识别结果：<strong>{heard}</strong>
                </div>
              )}
              <div className="text-muted text-sm">
                {lastScore >= 80 ? '太棒了，发音清晰又标准！' : lastScore >= 60 ? '不错！注意个别单词的发音和连读' : '再听一遍示范，放慢速度跟读试试'}
              </div>
              <div className="result-actions" style={{ marginTop: 18 }}>
                <Button variant="secondary" onClick={() => { setLastScore(null); setHeard(''); setPartial('') }}>↻ 再读一次</Button>
                <Button onClick={nextSentence}>{idx + 1 < sentences.length ? '下一句 →' : '查看成绩 🏁'}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {node}
    </div>
  )
}
