import type { Post, Progress, User } from '@/types'

const KEYS = {
  users: 'lv.users',
  session: 'lv.session',
  progress: (u: string) => `lv.progress.${u}`,
  posts: 'lv.posts',
  onboarded: 'lv.onboarded',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const store = {
  getUsers: (): User[] => read<User[]>(KEYS.users, []),
  setUsers: (users: User[]) => write(KEYS.users, users),

  getSession: (): string | null => read<string | null>(KEYS.session, null),
  setSession: (username: string | null) => write(KEYS.session, username),

  getProgress: (username: string): Progress | null => read<Progress | null>(KEYS.progress(username), null),
  setProgress: (username: string, p: Progress) => write(KEYS.progress(username), p),

  getPosts: (): Post[] | null => read<Post[] | null>(KEYS.posts, null),
  setPosts: (posts: Post[]) => write(KEYS.posts, posts),

  getOnboarded: (): boolean => read<boolean>(KEYS.onboarded, false),
  setOnboarded: () => write(KEYS.onboarded, true),
}

/** 非加密强度的演示用哈希（djb2 + base64） */
export function hashPassword(raw: string): string {
  let h = 5381
  const salted = `lv::${raw}::salt`
  for (let i = 0; i < salted.length; i++) {
    h = (h * 33) ^ salted.charCodeAt(i)
  }
  return (h >>> 0).toString(36) + '-' + raw.length.toString(36)
}

export function createDefaultProgress(currentLang: Progress['currentLang'] = 'en'): Progress {
  return {
    currentLang,
    xp: 0,
    dailyGoal: 50,
    completedLessons: [],
    wordBoxes: {},
    sessions: [],
    streak: { current: 0, best: 0, lastStudyDate: null },
    studyDays: [],
    unlockedAchievements: [],
    minutes: 0,
    lessonTabs: {},
  }
}
