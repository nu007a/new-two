import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LANGUAGES } from '@/data/content'

const features = [
  { icon: '🗂️', color: '#6366f1', title: '科学分级课程', desc: '对标 CEFR、JLPT、TOPIK 三大权威体系，5 个等级 30 节精品课，从入门到精通路径清晰。' },
  { icon: '🃏', color: '#0ea5e9', title: '单词闪卡记忆', desc: '基于艾宾浩斯遗忘曲线的 Leitner 记忆盒算法，智能安排复习，把短期记忆固化为长期记忆。' },
  { icon: '✏️', color: '#f59e0b', title: '语法即时精讲', desc: '选择、填空互动练习，答错立刻看到语法解析，每个知识点都能真正学懂而不是死记。' },
  { icon: '🎧', color: '#10b981', title: '沉浸式听力训练', desc: '母语级语音合成朗读，贴近真实场景的对话与广播，三遍听写法全面提升听音辨义能力。' },
  { icon: '🎙️', color: '#ec4899', title: 'AI 口语跟读', desc: '浏览器内置语音识别实时打分，逐句模仿母语者语音语调，从不敢开口到自信表达。' },
  { icon: '📊', color: '#8b5cf6', title: '学习进度追踪', desc: 'XP 经验值、连续打卡、技能雷达与学习热力图，每一份努力都清晰可见。' },
  { icon: '🎯', color: '#14b8a6', title: '个性化路径推荐', desc: '根据你的正确率、学习习惯与记忆曲线，智能推荐下一步最该学的内容。' },
  { icon: '🏆', color: '#f97316', title: '成就激励系统', desc: '17 枚铜银金成就徽章，学习之路的每一个里程碑都值得被庆祝。' },
  { icon: '💬', color: '#3b82f6', title: '学习者社区', desc: '与同好交流心得、组队打卡、互相答疑，一个人走得快，一群人走得远。' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div>
      <div className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-logo">
            <span className="logo-badge">语</span>
            语界 LinguaVerse
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <Link to="/dashboard" className="btn-hero-white" style={{ padding: '9px 22px', fontSize: 14 }}>
                进入学习
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-hero-ghost" style={{ padding: '9px 20px', fontSize: 14 }}>
                  登录
                </Link>
                <Link to="/register" className="btn-hero-white" style={{ padding: '9px 22px', fontSize: 14 }}>
                  免费注册
                </Link>
              </>
            )}
          </div>
        </nav>

        <span className="hero-floating" style={{ top: '18%', left: '8%' }}>🇬🇧</span>
        <span className="hero-floating" style={{ top: '28%', right: '10%', animationDelay: '1.2s' }}>🇯🇵</span>
        <span className="hero-floating" style={{ bottom: '20%', left: '14%', animationDelay: '2s' }}>🇰🇷</span>
        <span className="hero-floating" style={{ bottom: '26%', right: '16%', animationDelay: '0.6s' }}>🎌</span>

        <div className="hero-body">
          <div className="hero-badge">✨ 英语 · 日语 · 韩语 一站式沉浸式学习</div>
          <h1 className="hero-title">
            打开语言的边界，
            <br />
            遇见<span className="grad-word">更大的世界</span>
          </h1>
          <p className="hero-sub">
            分级课程、闪卡记忆、AI 口语跟读、智能推荐与学习社区，
            把科学的学习方法装进每天 10 分钟，让坚持变得像游戏一样自然。
          </p>
          <div className="hero-cta">
            <Link to={user ? '/dashboard' : '/register'} className="btn-hero-white">
              {user ? '继续我的学习之旅 🚀' : '立即免费开始 🚀'}
            </Link>
            <Link to="/login" className="btn-hero-ghost">
              已有账号，去登录
            </Link>
          </div>
          <div style={{ marginTop: 44, display: 'flex', gap: 28, fontSize: 15, opacity: 0.92, fontWeight: 600 }}>
            {LANGUAGES.map((l) => (
              <span key={l.code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 26 }}>{l.flag}</span>
                {l.nativeName}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-section">
        <h2>为高效学习而生的完整体系</h2>
        <p className="sec-desc">从输入到输出，从坚持到陪伴，语界覆盖语言学习的每一个关键环节</p>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="fc-icon" style={{ background: `${f.color}18`, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-cta-band">
          <h2>今天，就是开始的最好时机</h2>
          <p>注册即可解锁全部课程与互动模块，无需下载，浏览器直接学</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn-hero-white" style={{ display: 'inline-flex' }}>
            {user ? '进入学习首页' : '免费创建账号'}
          </Link>
        </div>
      </div>

      <footer className="landing-footer">
        语界 LinguaVerse · 多语种沉浸式在线学习平台 · 数据保存在本地浏览器，演示版本无需服务器
      </footer>
    </div>
  )
}
