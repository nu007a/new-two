// ============ 课程内容相关类型 ============
export type LanguageCode = 'en' | 'ja' | 'ko'

export interface Language {
  code: LanguageCode
  name: string // 中文名
  nativeName: string // 母语名
  flag: string // emoji
  locale: string // TTS locale
  color: string // 主题色
  levelSystem: string // 等级体系名称
}

export interface LevelInfo {
  index: number
  code: string // 等级代号，如 A1 / N5 / TOPIK1
  title: string
  desc: string
}

/** 单词卡 */
export interface Word {
  id: string
  text: string // 外文单词/短语
  phonetic: string // 音标/假名/罗马音
  meaning: string // 中文释义
  example: string // 外例句
  exampleZh: string // 例句中文
}

/** 语法练习题（选择 / 填空） */
export interface GrammarQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

/** 听力题 */
export interface ListeningQuestion {
  id: string
  audioText: string // TTS 朗读文本
  title: string
  options: string[]
  answer: number
}

/** 口语跟读句 */
export interface SpeakingSentence {
  id: string
  text: string
  zh: string
  tip: string // 发音要点
}

export interface Lesson {
  id: string // 全局唯一
  lang: LanguageCode
  level: number
  unit: number
  order: number
  title: string
  summary: string
  words: Word[]
  grammar: GrammarQuestion[]
  listening: ListeningQuestion
  speaking: SpeakingSentence
}

export interface Unit {
  index: number
  title: string
  lessons: Lesson[]
}

// ============ 用户与权限 ============
export interface User {
  username: string
  email: string
  passwordHash: string
  avatar: string // emoji
  createdAt: string
}

// ============ 学习进度 ============
export type SkillKey = 'vocab' | 'grammar' | 'listening' | 'speaking'

export interface SessionRecord {
  date: string // YYYY-MM-DD
  skill: SkillKey
  lang: LanguageCode
  correct: number
  total: number
  xp: number
}

export interface Progress {
  currentLang: LanguageCode
  xp: number
  dailyGoal: number // 每日目标 XP
  completedLessons: string[] // lesson id
  wordBoxes: Record<string, number> // wordId -> Leitner 盒子 1..5
  sessions: SessionRecord[]
  streak: {
    current: number
    best: number
    lastStudyDate: string | null
  }
  studyDays: string[] // 有学习记录的日期
  unlockedAchievements: string[]
  minutes: number // 累计学习分钟
  lessonTabs: Record<string, string[]> // lessonId -> 已完成的 tab
}

// ============ 社区 ============
export interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  author: string
  avatar: string
  lang: LanguageCode | 'all'
  tag: string
  content: string
  likes: string[] // 点赞用户名
  comments: Comment[]
  createdAt: string
}

// ============ 成就 ============
export interface Achievement {
  id: string
  name: string
  desc: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold'
  check: (ctx: AchievementContext) => boolean
  progress?: (ctx: AchievementContext) => { current: number; target: number }
}

export interface AchievementContext {
  xp: number
  streak: number
  completedLessons: number
  wordLearned: number // 盒子 >= 2 的单词数
  sessionsBySkill: Record<SkillKey, number>
  correctBySkill: Record<SkillKey, { correct: number; total: number }>
  postCount: number
  languages: number
}
