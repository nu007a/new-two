export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86_400_000)
}

/** 最近 n 天日期数组（含今天，旧→新） */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(todayStr(new Date(Date.now() - i * 86_400_000)))
  }
  return out
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 相对时间，如 "3 小时前" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

/** 语音识别结果与目标句的归一化相似度（0~1） */
export function similarity(heardRaw: string, targetRaw: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u4e00-\u9fff\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const heard = normalize(heardRaw)
  const target = normalize(targetRaw)
  if (!heard || !target) return 0
  if (heard === target) return 1

  // 英文按词，日韩按字符
  const isLatin = /^[a-z0-9\s]+$/.test(target)
  if (isLatin) {
    const tw = target.split(' ').filter(Boolean)
    const hw = new Set(heard.split(' ').filter(Boolean))
    const hit = tw.filter((w) => hw.has(w)).length
    // 0.7 词命中 + 0.3 长度覆盖
    const recall = hit / tw.length
    const coverage = Math.min(1, hw.size / tw.length)
    return Math.round((recall * 0.7 + coverage * 0.3) * 100) / 100
  }

  // 字符级最长公共子序列
  const a = target.replace(/\s/g, '')
  const b = heard.replace(/\s/g, '')
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return Math.round((dp[a.length][b.length] / a.length) * 100) / 100
}

export const AVATARS = ['🦊', '🐱', '🐰', '🦁', '🐼', '🐨', '🦉', '🐧', '🐳', '🦄', '🌸', '⭐', '🚀', '🎯', '🌈']
