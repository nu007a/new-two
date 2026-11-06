import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
}
const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export function Button({ variant = 'primary', size = 'md', block, className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn('btn', variantClass[variant], sizeClass[size], block && 'btn-block', className)}
      {...rest}
    />
  )
}

// ---------- Card ----------
export function Card({
  children,
  className,
  onClick,
  hover,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}) {
  return (
    <div className={cn('card', hover && 'card-hover', onClick && 'card-clickable', className)} onClick={onClick}>
      {children}
    </div>
  )
}

// ---------- Badge / Tag ----------
export function Badge({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={cn('badge', className)} style={color ? { background: `${color}1a`, color } : undefined}>
      {children}
    </span>
  )
}

// ---------- Progress bar ----------
export function ProgressBar({ value, max = 100, color, height = 8 }: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ---------- Progress ring ----------
export function ProgressRing({
  value,
  max = 100,
  size = 88,
  stroke = 8,
  color = '#6366f1',
  children,
}: {
  value: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(1, max > 0 ? value / max : 0)
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-inner">{children}</div>
    </div>
  )
}

// ---------- Modal ----------
export function Modal({
  open,
  onClose,
  children,
  width = 440,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  if (!open) return null
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// ---------- Empty state ----------
export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  )
}

// ---------- Page header ----------
export function PageHeader({ title, subtitle, extra }: { title: string; subtitle?: string; extra?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {extra && <div className="page-header-extra">{extra}</div>}
    </div>
  )
}

// ---------- Stat tile ----------
export function StatTile({ icon, label, value, color, sub }: { icon: string; label: string; value: ReactNode; color?: string; sub?: string }) {
  return (
    <Card className="stat-tile">
      <div className="stat-icon" style={color ? { background: `${color}1a`, color } : undefined}>
        {icon}
      </div>
      <div className="stat-meta">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </Card>
  )
}
