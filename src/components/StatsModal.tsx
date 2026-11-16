import type { StatsState } from '../game/types'
import { Modal } from './Modal'

interface StatsModalProps {
  stats: StatsState
  onClose: () => void
}

export const StatsModal = ({ stats, onClose }: StatsModalProps) => {
  const games =
    stats.classic.gamesPlayed + stats.endless.gamesPlayed + stats.daily.gamesPlayed
  const wins = stats.classic.wins + stats.endless.wins
  const maxTile = Math.max(
    stats.classic.maxTile,
    stats.endless.maxTile,
    stats.daily.maxTile,
  )
  const merges = stats.classic.totalMerges + stats.endless.totalMerges

  const cards = [
    { label: 'Партии', value: games },
    { label: 'Победы', value: wins },
    { label: 'Рекорд классика', value: stats.classic.bestScore },
    { label: 'Рекорд бесконечный', value: stats.endless.bestScore },
    { label: 'Макс. плитка', value: maxTile },
    { label: 'Слияния', value: merges },
    { label: 'Daily партий', value: stats.daily.gamesPlayed },
    { label: 'Daily рекорд', value: stats.daily.bestScore },
  ]

  return (
    <Modal title="Статистика" onClose={onClose}>
      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="label">{c.label}</span>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
