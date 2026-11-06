import type { Progress, SkillKey } from '@/types'
import { LESSONS, SKILL_META } from '@/data/content'
import { todayStr } from '@/lib/utils'

export interface SkillStat {
  key: SkillKey
  name: string
  sessions: number
  correct: number
  total: number
  accuracy: number
}

export function computeSkillStats(p: Progress, lang?: string): SkillStat[] {
  return (['vocab', 'grammar', 'listening', 'speaking'] as SkillKey[]).map((key) => {
    const meta = SKILL_META.find((s) => s.key === key)!
    const rows = p.sessions.filter((s) => s.skill === key && (!lang || s.lang === lang))
    const correct = rows.reduce((n, r) => n + r.correct, 0)
    const total = rows.reduce((n, r) => n + r.total, 0)
    return {
      key,
      name: meta.name,
      sessions: rows.length,
      correct,
      total,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
    }
  })
}

export interface Recommendation {
  id: string
  icon: string
  title: string
  reason: string
  cta: string
  to: string
  color: string
  priority: number
}

export function buildRecommendations(p: Progress): Recommendation[] {
  const recs: Recommendation[] = []
  const lang = p.currentLang
  const lessons = LESSONS[lang]
  const done = new Set(p.completedLessons)

  // 1. 下一节未完成的课
  const next = lessons.find((l) => !done.has(l.id))
  if (next) {
    const started = p.completedLessons.length > 0
    recs.push({
      id: 'next-lesson',
      icon: started ? '🚩' : '👋',
      title: started ? `继续学习：${next.title}` : `从「${next.title}」开始`,
      reason: started
        ? `按 ${lang.toUpperCase()} 课程路径，这是你的下一节课，预计 5 分钟`
        : '欢迎来到语界！先完成你的第一节课，开启沉浸式学习之旅',
      cta: started ? '继续课程' : '开始第一课',
      to: `/learn/lesson/${next.id}`,
      color: '#6366f1',
      priority: 100,
    })
  } else {
    recs.push({
      id: 'all-done',
      icon: '🏆',
      title: '当前语言课程已全部完成！',
      reason: '试试切换到另一种语言，成为真正的多语者',
      cta: '去选课',
      to: '/courses',
      color: '#f59e0b',
      priority: 100,
    })
  }

  // 2. 薄弱技能专项训练
  const stats = computeSkillStats(p, lang)
  const practiced = stats.filter((s) => s.total > 0)
  if (practiced.length) {
    const weakest = [...practiced].sort((a, b) => a.accuracy - b.accuracy)[0]
    if (weakest.accuracy < 80) {
      const map: Record<SkillKey, string> = {
        vocab: '/learn/vocab',
        grammar: '/learn/grammar',
        listening: '/learn/listening',
        speaking: '/learn/speaking',
      }
      const icon = SKILL_META.find((s) => s.key === weakest.key)!.icon
      recs.push({
        id: 'weak-skill',
        icon,
        title: `${weakest.name}专项强化`,
        reason: `你在${weakest.name}上的正确率为 ${weakest.accuracy}%，低于 80%，针对性训练提升最快`,
        cta: '立即强化',
        to: map[weakest.key],
        color: SKILL_META.find((s) => s.key === weakest.key)!.color,
        priority: 90 - weakest.accuracy,
      })
    }
  } else {
    recs.push({
      id: 'try-modules',
      icon: '🧩',
      title: '体验四大互动模块',
      reason: '闪卡单词、语法练习、母语听力与口语跟读，找到你最喜欢的学习方式',
      cta: '去练习',
      to: '/learn',
      color: '#ec4899',
      priority: 80,
    })
  }

  // 3. 单词复习（Leitner 低盒子单词需要巩固）
  const dueWords = Object.entries(p.wordBoxes).filter(
    ([id, box]) => id.startsWith(lang) && box <= 2,
  ).length
  if (dueWords >= 5) {
    recs.push({
      id: 'review-words',
      icon: '🃏',
      title: `${dueWords} 个单词等待复习`,
      reason: '基于艾宾浩斯间隔记忆原理，及时复习能把短期记忆转化为长期记忆',
      cta: '去复习',
      to: '/learn/vocab',
      color: '#0ea5e9',
      priority: 70,
    })
  }

  // 4. 连续打卡保护
  if (p.streak.current > 0 && p.streak.lastStudyDate !== todayStr()) {
    recs.push({
      id: 'protect-streak',
      icon: '🔥',
      title: `守护 ${p.streak.current} 天连续打卡`,
      reason: '今天还没有学习记录，完成任意练习即可延续连击',
      cta: '马上学习',
      to: '/learn',
      color: '#f97316',
      priority: 95,
    })
  }

  // 5. 每日目标进度
  const todayXp = p.sessions
    .filter((s) => s.date === todayStr())
    .reduce((n, s) => n + s.xp, 0)
  if (todayXp < p.dailyGoal) {
    recs.push({
      id: 'daily-goal',
      icon: '🎯',
      title: `今日目标还差 ${p.dailyGoal - todayXp} XP`,
      reason: `每天 ${p.dailyGoal} XP，约 3-5 分钟，稳定的小目标造就大进步`,
      cta: '去完成',
      to: '/learn',
      color: '#14b8a6',
      priority: 60,
    })
  }

  // 6. 多语言拓展
  const langsStarted = new Set(
    p.completedLessons.map((id) => id.split('-')[0] as string),
  ).size
  if (langsStarted >= 1 && langsStarted < 3 && p.xp > 150) {
    recs.push({
      id: 'new-language',
      icon: '🌍',
      title: '解锁一门新语言？',
      reason: '日语和韩语的语法结构相似，英语词汇量又能反哺两者，多语学习事半功倍',
      cta: '探索语言',
      to: '/courses',
      color: '#8b5cf6',
      priority: 40,
    })
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 4)
}
