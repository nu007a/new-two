import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { createDefaultProgress, hashPassword, store } from '@/lib/storage'
import { AVATARS } from '@/lib/utils'

interface AuthContextValue {
  user: User | null
  login: (account: string, password: string) => { ok: boolean; message?: string }
  register: (username: string, email: string, password: string, avatar: string) => { ok: boolean; message?: string }
  logout: () => void
  updateAvatar: (avatar: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const name = store.getSession()
    if (!name) return null
    return store.getUsers().find((u) => u.username === name) ?? null
  })

  const login = useCallback((account: string, password: string) => {
    const users = store.getUsers()
    const u = users.find((x) => x.username === account.trim() || x.email === account.trim())
    if (!u) return { ok: false, message: '账号不存在，请先注册' }
    if (u.passwordHash !== hashPassword(password)) return { ok: false, message: '密码不正确' }
    store.setSession(u.username)
    setUser(u)
    return { ok: true }
  }, [])

  const register = useCallback((username: string, email: string, password: string, avatar: string) => {
    const name = username.trim()
    const mail = email.trim()
    if (!/^[\w一-龥·]{2,16}$/.test(name)) return { ok: false, message: '用户名需为 2-16 位中英文、数字或下划线' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return { ok: false, message: '邮箱格式不正确' }
    if (password.length < 6) return { ok: false, message: '密码至少 6 位' }
    const users = store.getUsers()
    if (users.some((u) => u.username === name)) return { ok: false, message: '用户名已被占用' }
    if (users.some((u) => u.email === mail)) return { ok: false, message: '邮箱已注册' }

    const newUser: User = {
      username: name,
      email: mail,
      passwordHash: hashPassword(password),
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      createdAt: new Date().toISOString(),
    }
    store.setUsers([...users, newUser])
    store.setProgress(name, createDefaultProgress())
    store.setSession(name)
    setUser(newUser)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    store.setSession(null)
    setUser(null)
  }, [])

  const updateAvatar = useCallback(
    (avatar: string) => {
      if (!user) return
      const users = store.getUsers()
      const next = users.map((u) => (u.username === user.username ? { ...u, avatar } : u))
      store.setUsers(next)
      setUser({ ...user, avatar })
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, login, register, logout, updateAvatar }),
    [user, login, register, logout, updateAvatar],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
