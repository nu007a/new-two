import type { Post } from '@/types'

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString()

export const SEED_POSTS: Post[] = [
  {
    id: 'seed-1',
    author: '樱花馒头',
    avatar: '🌸',
    lang: 'ja',
    tag: '学习心得',
    content:
      '背五十音的时候真的很崩溃，坚持每天写两行，两周后居然能拼读出车站站牌了！大家坚持住，片假名可以靠逛日式超市货架练习哈哈 🍱',
    likes: ['Kevin', '阿光', 'Mika'],
    comments: [
      { id: 'seed-1-c1', author: 'Mika', avatar: '🐱', content: '片假名确实劝退，但熬过第一周就好多了！', createdAt: hoursAgo(20) },
      { id: 'seed-1-c2', author: '阿光', avatar: '🦊', content: '货架学习法学起来了', createdAt: hoursAgo(18) },
    ],
    createdAt: hoursAgo(26),
  },
  {
    id: 'seed-2',
    author: 'Kevin',
    avatar: '🦁',
    lang: 'en',
    tag: '口语打卡',
    content:
      'Day 30 口语打卡！今天跟读了咖啡店点单的句子，from "I want a coffee" 进化到 "Could I get a medium latte to stay?" 语调还是硬，继续练 💪',
    likes: ['樱花馒头', 'Lina'],
    comments: [
      { id: 'seed-2-c1', author: 'Lina', avatar: '🐰', content: 'could I get 这个说法真的地道！', createdAt: hoursAgo(10) },
    ],
    createdAt: hoursAgo(14),
  },
  {
    id: 'seed-3',
    author: '泡菜爱好者',
    avatar: '🥬',
    lang: 'ko',
    tag: '语法求助',
    content:
      '求助！은/는 和 이/가 到底怎么区分啊？每次写句子都凭感觉选，有没有大佬能用一句话点醒我 🥲',
    likes: ['Kevin'],
    comments: [
      {
        id: 'seed-3-c1',
        author: 'Mika',
        avatar: '🐱',
        content: '은/는 是主题（强调后面要说的内容），이/가 是主语（强调谁/什么），对比练习几组句子会更清楚～',
        createdAt: hoursAgo(6),
      },
      { id: 'seed-3-c2', author: '泡菜爱好者', avatar: '🥬', content: '懂了！这就去造十组对比句，谢谢！', createdAt: hoursAgo(5) },
    ],
    createdAt: hoursAgo(9),
  },
  {
    id: 'seed-4',
    author: 'Lina',
    avatar: '🐰',
    lang: 'all',
    tag: '资源分享',
    content:
      '分享一个听力小技巧：第一遍盲听抓大意，第二遍看文本把听不出来的连读标出来，第三遍再盲听。亲测一个月，听力题正确率从 50% 提到 85% 🎧',
    likes: ['樱花馒头', 'Kevin', '阿光', '泡菜爱好者'],
    comments: [],
    createdAt: hoursAgo(3),
  },
  {
    id: 'seed-5',
    author: '阿光',
    avatar: '🦊',
    lang: 'ja',
    tag: '每日一句',
    content: '今日の一句：「継続は力なり」——坚持就是力量。和各位共勉，连续打卡第 12 天 🔥',
    likes: ['樱花馒头', 'Mika', 'Lina'],
    comments: [
      { id: 'seed-5-c1', author: '樱花馒头', avatar: '🌸', content: 'ことわざ いいですね！收藏了', createdAt: hoursAgo(1) },
    ],
    createdAt: hoursAgo(2),
  },
]
