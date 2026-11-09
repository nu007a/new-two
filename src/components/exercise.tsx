import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Achievement } from '@/types'
import AchievementToast from '@/components/AchievementToast'
import { Button } from '@/components/ui'

// ---------- 选项列表 ----------
const KEYS = ['A', 'B', 'C', 'D', 'E']

export function OptionList({
  options,
  answer,
  selected,
  disabled,
  onSelect,
}: {
  options: string[]
  answer?: number // 公布正确答案时传入
  selected: number | null
  disabled?: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div className="quiz-options">
      {options.map((opt, i) => {
        let cls = ''
        if (answer !== undefined) {
          if (i === answer) cls = 'correct'
          else if (i === selected) cls = 'wrong'
        }
        return (
          <button
            key={i}
            className={`quiz-option ${cls}`}
            disabled={disabled || answer !== undefined}
            onClick={() => onSelect(i)}
          >
            <span className="qo-key">{KEYS[i]}</span>
            <span>{opt}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---------- 结算屏 ----------
export function ResultScreen({
  correct,
  total,
  xp,
  title,
  praise,
  emoji,
  color = '#6366f1',
  extra,
  retryLabel = '再练一组',
  onRetry,
  continueTo,
  continueLabel,
}: {
  correct: number
  total: number
  xp: number
  title: string
  praise: string
  emoji: string
  color?: string
  extra?: React.ReactNode
  retryLabel?: string
  onRetry: () => void
  continueTo?: string
  continueLabel?: string
}) {
  const navigate = useNavigate()
  const pct = total ? Math.round((correct / total) * 100) : 0
  return (
    <div className="card quiz-shell" style={{ marginTop: 10 }}>
      <div className="result-hero">
        <div className="result-emoji">{emoji}</div>
        <div className="result-title">{title}</div>
        <div className="result-sub">{praise}</div>
      </div>
      <div className="result-stats">
        <div className="result-stat">
          <div className="rs-num" style={{ color }}>{pct}%</div>
          <div className="rs-label">正确率</div>
        </div>
        <div className="result-stat">
          <div className="rs-num">{correct}/{total}</div>
          <div className="rs-label">答对题数</div>
        </div>
        <div className="result-stat">
          <div className="rs-num" style={{ color: 'var(--amber)' }}>+{xp}</div>
          <div className="rs-label">获得 XP</div>
        </div>
      </div>
      {extra}
      <div className="result-actions">
        <Button variant="secondary" onClick={onRetry}>↻ {retryLabel}</Button>
        {continueTo && (
          <Button onClick={() => navigate(continueTo)}>{continueLabel ?? '继续'} →</Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          返回首页
        </Button>
      </div>
    </div>
  )
}

// ---------- 成就弹窗 Hook ----------
export function useAchievementPopup() {
  const [items, setItems] = useState<Achievement[]>([])
  const show = useCallback((a: Achievement[]) => {
    if (a.length) setItems(a)
  }, [])
  const node = <AchievementToast items={items} onClose={() => setItems([])} />
  return { show, node }
}

// ---------- XP 计算 ----------
export function calcXp(correct: number, total: number, base = 10): number {
  if (!total) return 5
  const accuracy = correct / total
  return Math.round(base * total * (0.4 + 0.6 * accuracy))
}
