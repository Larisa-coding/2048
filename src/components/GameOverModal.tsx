import { Modal } from './Modal'

interface GameOverModalProps {
  score: number
  best: number
  maxTile: number
  isNewRecord: boolean
  onRetry: () => void
  onHome: () => void
}

export const GameOverModal = ({
  score,
  best,
  maxTile,
  isNewRecord,
  onRetry,
  onHome,
}: GameOverModalProps) => (
  <Modal title="Игра окончена">
    <p>Ходов больше нет. Попробуйте ещё раз!</p>
    {isNewRecord ? (
      <p className="highlight-record" style={{ fontWeight: 700 }}>
        Новый рекорд!
      </p>
    ) : null}
    <div className="modal-stats">
      <div>
        <span className="label">Счёт</span>
        <span className={`value ${isNewRecord ? 'highlight-record' : ''}`}>{score}</span>
      </div>
      <div>
        <span className="label">Рекорд</span>
        <span className="value">{best}</span>
      </div>
      <div>
        <span className="label">Лучшая плитка</span>
        <span className="value">{maxTile}</span>
      </div>
    </div>
    <div className="modal-actions">
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Попробовать снова
      </button>
      <button type="button" className="btn btn-secondary" onClick={onHome}>
        На главный экран
      </button>
    </div>
  </Modal>
)
