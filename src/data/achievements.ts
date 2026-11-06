import type { Achievement, AchievementContext, SkillKey } from '@/types'

const skillCount = (ctx: AchievementContext, key: SkillKey) => ctx.sessionsBySkill[key] ?? 0
const skillAccuracy = (ctx: AchievementContext, key: SkillKey) => {
  const s = ctx.correctBySkill[key]
  return s && s.total > 0 ? s.correct / s.total : 0
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    name: '初出茅庐',
    desc: '完成第一节课',
    icon: '🌱',
    tier: 'bronze',
    check: (c) => c.completedLessons >= 1,
    progress: (c) => ({ current: Math.min(c.completedLessons, 1), target: 1 }),
  },
  {
    id: 'lesson-10',
    name: '勤学不辍',
    desc: '累计完成 10 节课',
    icon: '📚',
    tier: 'silver',
    check: (c) => c.completedLessons >= 10,
    progress: (c) => ({ current: Math.min(c.completedLessons, 10), target: 10 }),
  },
  {
    id: 'lesson-30',
    name: '课程达人',
    desc: '累计完成 30 节课',
    icon: '🎓',
    tier: 'gold',
    check: (c) => c.completedLessons >= 30,
    progress: (c) => ({ current: Math.min(c.completedLessons, 30), target: 30 }),
  },
  {
    id: 'streak-3',
    name: '三日之约',
    desc: '连续学习 3 天',
    icon: '🔥',
    tier: 'bronze',
    check: (c) => c.streak >= 3,
    progress: (c) => ({ current: Math.min(c.streak, 3), target: 3 }),
  },
  {
    id: 'streak-7',
    name: '坚持一周',
    desc: '连续学习 7 天',
    icon: '⚡',
    tier: 'silver',
    check: (c) => c.streak >= 7,
    progress: (c) => ({ current: Math.min(c.streak, 7), target: 7 }),
  },
  {
    id: 'streak-30',
    name: '月度学霸',
    desc: '连续学习 30 天',
    icon: '👑',
    tier: 'gold',
    check: (c) => c.streak >= 30,
    progress: (c) => ({ current: Math.min(c.streak, 30), target: 30 }),
  },
  {
    id: 'words-20',
    name: '词汇新星',
    desc: '掌握 20 个单词',
    icon: '🧠',
    tier: 'bronze',
    check: (c) => c.wordLearned >= 20,
    progress: (c) => ({ current: Math.min(c.wordLearned, 20), target: 20 }),
  },
  {
    id: 'words-100',
    name: '词汇达人',
    desc: '掌握 100 个单词',
    icon: '📖',
    tier: 'gold',
    check: (c) => c.wordLearned >= 100,
    progress: (c) => ({ current: Math.min(c.wordLearned, 100), target: 100 }),
  },
  {
    id: 'xp-500',
    name: '经验积累',
    desc: '累计获得 500 XP',
    icon: '⭐',
    tier: 'silver',
    check: (c) => c.xp >= 500,
    progress: (c) => ({ current: Math.min(c.xp, 500), target: 500 }),
  },
  {
    id: 'xp-2000',
    name: '经验大师',
    desc: '累计获得 2000 XP',
    icon: '🏆',
    tier: 'gold',
    check: (c) => c.xp >= 2000,
    progress: (c) => ({ current: Math.min(c.xp, 2000), target: 2000 }),
  },
  {
    id: 'all-skills',
    name: '全能学徒',
    desc: '四种学习模块各练习 1 次',
    icon: '🧩',
    tier: 'silver',
    check: (c) =>
      skillCount(c, 'vocab') > 0 &&
      skillCount(c, 'grammar') > 0 &&
      skillCount(c, 'listening') > 0 &&
      skillCount(c, 'speaking') > 0,
    progress: (c) => ({
      current: (['vocab', 'grammar', 'listening', 'speaking'] as SkillKey[]).filter((k) => skillCount(c, k) > 0).length,
      target: 4,
    }),
  },
  {
    id: 'grammar-sharp',
    name: '语法犀利',
    desc: '语法练习累计答对 30 题',
    icon: '✏️',
    tier: 'silver',
    check: (c) => (c.correctBySkill.grammar?.correct ?? 0) >= 30,
    progress: (c) => ({ current: Math.min(c.correctBySkill.grammar?.correct ?? 0, 30), target: 30 }),
  },
  {
    id: 'ear-trained',
    name: '金耳朵',
    desc: '听力练习累计答对 15 题',
    icon: '🎧',
    tier: 'silver',
    check: (c) => (c.correctBySkill.listening?.correct ?? 0) >= 15,
    progress: (c) => ({ current: Math.min(c.correctBySkill.listening?.correct ?? 0, 15), target: 15 }),
  },
  {
    id: 'confident-speaker',
    name: '自信开口',
    desc: '完成 10 次口语跟读',
    icon: '🎙️',
    tier: 'silver',
    check: (c) => skillCount(c, 'speaking') >= 10,
    progress: (c) => ({ current: Math.min(skillCount(c, 'speaking'), 10), target: 10 }),
  },
  {
    id: 'polyglot',
    name: '多语者',
    desc: '在 2 种及以上语言中完成课程',
    icon: '🌍',
    tier: 'gold',
    check: (c) => c.languages >= 2,
    progress: (c) => ({ current: Math.min(c.languages, 2), target: 2 }),
  },
  {
    id: 'social-voice',
    name: '社区之声',
    desc: '在社区发布第一条帖子',
    icon: '💬',
    tier: 'bronze',
    check: (c) => c.postCount >= 1,
    progress: (c) => ({ current: Math.min(c.postCount, 1), target: 1 }),
  },
  {
    id: 'accuracy-master',
    name: '精益求精',
    desc: '任意模块练习 10 题且正确率 ≥ 90%',
    icon: '💯',
    tier: 'gold',
    check: (c) =>
      (['vocab', 'grammar', 'listening', 'speaking'] as SkillKey[]).some(
        (k) => (c.correctBySkill[k]?.total ?? 0) >= 10 && skillAccuracy(c, k) >= 0.9,
      ),
  },
]
