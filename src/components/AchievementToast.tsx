import type { Achievement } from '@/types'
import { Modal } from '@/components/ui'

const tierName = { bronze: '铜牌', silver: '银牌', gold: '金牌' } as const

/** 完成练习/课程后，展示新解锁成就 */
export default function AchievementToast({
  items,
  onClose,
}: {
  items: Achievement[]
  onClose: () => void
}) {
  return (
    <Modal open={items.length > 0} onClose={onClose}>
      <div className="ach-toast">
        <div className="ach-toast-head">
          <span className="ach-toast-confetti">🎉</span>
          <h2>解锁新成就！</h2>
        </div>
        <div className="ach-toast-list">
          {items.map((a) => (
            <div key={a.id} className={`ach-toast-item tier-${a.tier}`}>
              <div className="ach-toast-icon">{a.icon}</div>
              <div>
                <div className="ach-toast-name">
                  {a.name}
                  <span className={`ach-tier tier-badge-${a.tier}`}>{tierName[a.tier]}</span>
                </div>
                <div className="ach-toast-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          太棒了，继续！
        </button>
      </div>
    </Modal>
  )
}
