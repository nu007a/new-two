import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  Achievement,
  AchievementContext,
  Comment,
  Post,
  Progress,
  SkillKey,
} from '@/types'
import { useAuth } from '@/context/AuthContext'
import { createDefaultProgress, store } from '@/lib/storage'
import { daysBetween, todayStr, uid } from '@/lib/utils'
import { ACHIEVEMENTS } from '@/data/achievements'
import { SEED_POSTS } from '@/data/communitySeed'

interface RecordInput {
  skill: SkillKey
  correct: number
  total: number
  xp: number
  lang?: Progress['currentLang']
  minutes?: number
}

interface AppDataValue {
  progress: Progress
  posts: Post[]
  setCurrentLang: (lang: Progress['currentLang']) => void
  setDailyGoal: (xp: number) => void
  recordSession: (input: RecordInput) => Achievement[]
  updateWordBox: (wordId: string, known: boolean) => void
  markLessonTab: (lessonId: string, tab: string) => string[]
  completeLesson: (lessonId: string) => { completed: boolean; newAchievements: Achievement[]; xpGained: number }
  addPost: (content: string, tag: string, lang: Post['lang']) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, content: string) => void
  resetProgress: () => void
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const username = user?.username ?? ''

  const [progress, setProgressState] = useState<Progress>(() =>
    user ? store.getProgress(user.username) ?? createDefaultProgress() : createDefaultProgress(),
  )
  const [posts, setPostsState] = useState<Post[]>(() => store.getPosts() ?? SEED_POSTS)

  const persist = useCallback(
    (next: Progress) => {
      setProgressState(next)
      if (username) store.setProgress(username, next)
    },
    [username],
  )

  const persistPosts = useCallback((next: Post[]) => {
    setPostsState(next)
    store.setPosts(next)
  }, [])

  const buildAchievementContext = useCallback(
    (p: Progress, allPosts: Post[]): AchievementContext => {
      const sessionsBySkill = { vocab: 0, grammar: 0, listening: 0, speaking: 0 }
      const correctBySkill: AchievementContext['correctBySkill'] = {
        vocab: { correct: 0, total: 0 },
        grammar: { correct: 0, total: 0 },
        listening: { correct: 0, total: 0 },
        speaking: { correct: 0, total: 0 },
      }
      p.sessions.forEach((s) => {
        sessionsBySkill[s.skill] += 1
        correctBySkill[s.skill].correct += s.correct
        correctBySkill[s.skill].total += s.total
      })
      return {
        xp: p.xp,
        streak: p.streak.current,
        completedLessons: p.completedLessons.length,
        wordLearned: Object.values(p.wordBoxes).filter((b) => b >= 2).length,
        sessionsBySkill,
        correctBySkill,
        postCount: allPosts.filter((pt) => pt.author === username).length,
        languages: new Set(p.completedLessons.map((id) => id.split('-')[0])).size,
      }
    },
    [username],
  )

  /** 评估并解锁成就，返回新解锁列表 */
  const evaluate = useCallback(
    (p: Progress, allPosts: Post[]): { next: Progress; unlocked: Achievement[] } => {
      const ctx = buildAchievementContext(p, allPosts)
      const newly = ACHIEVEMENTS.filter((a) => !p.unlockedAchievements.includes(a.id) && a.check(ctx))
      if (!newly.length) return { next: p, unlocked: [] }
      return {
        next: { ...p, unlockedAchievements: [...p.unlockedAchievements, ...newly.map((a) => a.id)] },
        unlocked: newly,
      }
    },
    [buildAchievementContext],
  )

  const bumpStreak = (p: Progress, minutes: number): Progress => {
    const today = todayStr()
    if (p.streak.lastStudyDate === today) {
      return { ...p, minutes: p.minutes + minutes }
    }
    const current =
      p.streak.lastStudyDate && daysBetween(p.streak.lastStudyDate, today) === 1
        ? p.streak.current + 1
        : 1
    return {
      ...p,
      streak: { current, best: Math.max(p.streak.best, current), lastStudyDate: today },
      studyDays: p.studyDays.includes(today) ? p.studyDays : [...p.studyDays, today],
      minutes: p.minutes + minutes,
    }
  }

  const recordSession = useCallback(
    (input: RecordInput): Achievement[] => {
      const lang = input.lang ?? progress.currentLang
      let next: Progress = {
        ...progress,
        xp: progress.xp + input.xp,
        currentLang: lang,
        sessions: [
          ...progress.sessions,
          {
            date: todayStr(),
            skill: input.skill,
            lang,
            correct: input.correct,
            total: input.total,
            xp: input.xp,
          },
        ],
      }
      next = bumpStreak(next, input.minutes ?? Math.max(1, Math.round(input.total * 0.6)))
      const res = evaluate(next, posts)
      persist(res.next)
      return res.unlocked
    },
    [progress, posts, evaluate, persist],
  )

  const updateWordBox = useCallback(
    (wordId: string, known: boolean) => {
      const cur = progress.wordBoxes[wordId] ?? 0
      const nextBox = known ? Math.min(5, cur + 1) : 1
      persist({ ...progress, wordBoxes: { ...progress.wordBoxes, [wordId]: nextBox } })
    },
    [progress, persist],
  )

  const markLessonTab = useCallback(
    (lessonId: string, tab: string): string[] => {
      const tabs = new Set(progress.lessonTabs[lessonId] ?? [])
      if (tabs.has(tab)) return [...tabs]
      tabs.add(tab)
      persist({ ...progress, lessonTabs: { ...progress.lessonTabs, [lessonId]: [...tabs] } })
      return [...tabs]
    },
    [progress, persist],
  )

  const completeLesson = useCallback(
    (lessonId: string) => {
      if (progress.completedLessons.includes(lessonId)) {
        return { completed: false, newAchievements: [] as Achievement[], xpGained: 0 }
      }
      let next: Progress = {
        ...progress,
        xp: progress.xp + 50,
        completedLessons: [...progress.completedLessons, lessonId],
      }
      next = bumpStreak(next, 5)
      const res = evaluate(next, posts)
      persist(res.next)
      return { completed: true, newAchievements: res.unlocked, xpGained: 50 }
    },
    [progress, posts, evaluate, persist],
  )

  const setCurrentLang = useCallback(
    (lang: Progress['currentLang']) => persist({ ...progress, currentLang: lang }),
    [persist, progress],
  )

  const setDailyGoal = useCallback(
    (xp: number) => persist({ ...progress, dailyGoal: xp }),
    [persist, progress],
  )

  const addPost = useCallback(
    (content: string, tag: string, lang: Post['lang']) => {
      if (!user) return
      const post: Post = {
        id: uid('post'),
        author: user.username,
        avatar: user.avatar,
        lang,
        tag: tag || '日常分享',
        content: content.trim(),
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      }
      const nextPosts = [post, ...posts]
      persistPosts(nextPosts)
      const res = evaluate(progress, nextPosts)
      persist(res.next)
    },
    [evaluate, persist, persistPosts, posts, progress, user],
  )

  const toggleLike = useCallback(
    (postId: string) => {
      if (!user) return
      persistPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: p.likes.includes(user.username)
                  ? p.likes.filter((n) => n !== user.username)
                  : [...p.likes, user.username],
              }
            : p,
        ),
      )
    },
    [posts, persistPosts, user],
  )

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!user || !content.trim()) return
      const comment: Comment = {
        id: uid('c'),
        author: user.username,
        avatar: user.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      persistPosts(posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)))
    },
    [posts, persistPosts, user],
  )

  const resetProgress = useCallback(() => {
    persist(createDefaultProgress(progress.currentLang))
  }, [persist, progress.currentLang])

  const value = useMemo<AppDataValue>(
    () => ({
      progress,
      posts,
      setCurrentLang,
      setDailyGoal,
      recordSession,
      updateWordBox,
      markLessonTab,
      completeLesson,
      addPost,
      toggleLike,
      addComment,
      resetProgress,
    }),
    [
      progress,
      posts,
      setCurrentLang,
      setDailyGoal,
      recordSession,
      updateWordBox,
      markLessonTab,
      completeLesson,
      addPost,
      toggleLike,
      addComment,
      resetProgress,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
