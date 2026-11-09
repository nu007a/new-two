import { useMemo, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { LANGUAGES } from '@/data/content'
import type { Post } from '@/types'
import { cn, timeAgo } from '@/lib/utils'
import { Button, EmptyState, PageHeader } from '@/components/ui'

type LangFilter = 'all' | 'en' | 'ja' | 'ko'
const TAGS = ['全部', '学习心得', '口语打卡', '语法求助', '资源分享', '每日一句', '日常分享']

export default function Community() {
  const { user } = useAuth()
  const { posts, addPost, toggleLike, addComment } = useAppData()

  const [content, setContent] = useState('')
  const [tag, setTag] = useState('学习心得')
  const [postLang, setPostLang] = useState<Post['lang']>('all')
  const [langFilter, setLangFilter] = useState<LangFilter>('all')
  const [tagFilter, setTagFilter] = useState('全部')
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (langFilter !== 'all' && p.lang !== 'all' && p.lang !== langFilter) return false
      if (tagFilter !== '全部' && p.tag !== tagFilter) return false
      return true
    })
  }, [posts, langFilter, tagFilter])

  const submitPost = () => {
    if (content.trim().length < 4) return
    addPost(content, tag, postLang)
    setContent('')
  }

  const langOf = (code: Post['lang']) => LANGUAGES.find((l) => l.code === code)

  return (
    <div>
      <PageHeader title="学习社区" subtitle="和全球语言学习者交流心得、组队打卡、互相答疑" />

      {/* 发帖框 */}
      <div className="card post-composer">
        <div className="post-head">
          <span className="post-avatar">{user?.avatar}</span>
          <div>
            <div className="post-author">{user?.username}</div>
            <div className="post-time">分享你的学习瞬间</div>
          </div>
        </div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="今天学到了什么？有什么疑问或心得？说给大家听吧…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="pc-meta">
          <select className="select" value={postLang} onChange={(e) => setPostLang(e.target.value as Post['lang'])}>
            <option value="all">🌐 不限语言</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
          <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
            {TAGS.filter((t) => t !== '全部').map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <Button onClick={submitPost} disabled={content.trim().length < 4}>发布</Button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="community-filter">
        <button className={cn('filter-chip', langFilter === 'all' && 'active')} onClick={() => setLangFilter('all')}>
          🌐 全部语言
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            className={cn('filter-chip', langFilter === l.code && 'active')}
            onClick={() => setLangFilter(l.code)}
          >
            {l.flag} {l.name}
          </button>
        ))}
      </div>
      <div className="community-filter">
        {TAGS.map((t) => (
          <button key={t} className={cn('filter-chip', tagFilter === t && 'active')} onClick={() => setTagFilter(t)}>
            # {t}
          </button>
        ))}
      </div>

      {/* 帖子列表 */}
      {filtered.length === 0 ? (
        <EmptyState icon="💭" title="还没有相关帖子" desc="来发布第一条帖子，开启话题吧" />
      ) : (
        filtered.map((p) => {
          const liked = user ? p.likes.includes(user.username) : false
          const showComments = openComments[p.id]
          const pl = langOf(p.lang)
          return (
            <div key={p.id} className="card post-item">
              <div className="post-head">
                <span className="post-avatar">{p.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div className="post-author">{p.author}</div>
                  <div className="post-time">{timeAgo(p.createdAt)}</div>
                </div>
                <span className="badge" style={pl ? { background: `${pl.color}1a`, color: pl.color } : undefined}>
                  {p.lang === 'all' ? '🌐 通用' : `${pl?.flag} ${pl?.name}`}
                </span>
              </div>

              <div className="post-tags">
                <span className="badge"># {p.tag}</span>
              </div>
              <div className="post-content">{p.content}</div>

              <div className="post-actions">
                <button className={cn('post-action', liked && 'liked')} onClick={() => toggleLike(p.id)}>
                  {liked ? '❤️' : '🤍'} {p.likes.length || '点赞'}
                </button>
                <button className="post-action" onClick={() => setOpenComments((o) => ({ ...o, [p.id]: !o[p.id] }))}>
                  💬 {p.comments.length || '评论'}
                </button>
              </div>

              {showComments && (
                <div className="comments-list">
                  {p.comments.map((c) => (
                    <div key={c.id} className="comment-item">
                      <span className="comment-avatar">{c.avatar}</span>
                      <div className="comment-body">
                        <div className="comment-author">{c.author}</div>
                        <div className="comment-text">{c.content}</div>
                        <div className="comment-time">{timeAgo(c.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="comment-input-row">
                    <input
                      className="input"
                      placeholder="写下你的评论…"
                      value={commentDrafts[p.id] ?? ''}
                      onChange={(e) => setCommentDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (commentDrafts[p.id] ?? '').trim()) {
                          addComment(p.id, commentDrafts[p.id])
                          setCommentDrafts((d) => ({ ...d, [p.id]: '' }))
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if ((commentDrafts[p.id] ?? '').trim()) {
                          addComment(p.id, commentDrafts[p.id])
                          setCommentDrafts((d) => ({ ...d, [p.id]: '' }))
                        }
                      }}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
