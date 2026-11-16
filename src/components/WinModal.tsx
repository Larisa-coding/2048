import { Modal } from './Modal'

interface WinModalProps {
  score: number
  onContinue: () => void
  onNewGame: () => void
}

export const WinModal = ({ score, onContinue, onNewGame }: WinModalProps) => (
  <Modal title="Поздравляем!">
    <p>Вы собрали плитку 2048! Можно продолжить игру или начать заново.</p>
    <div className="modal-stats">
      <div>
        <span className="label">Счёт</span>
        <span className="value">{score}</span>
      </div>
      <div>
        <span className="label">Достижение</span>
        <span className="value">2048</span>
      </div>
    </div>
    <div className="modal-actions">
      <button type="button" className="btn btn-primary" onClick={onContinue}>
        Продолжить
      </button>
      <button type="button" className="btn btn-secondary" onClick={onNewGame}>
        Новая игра
      </button>
    </div>
  </Modal>
)
