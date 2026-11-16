import { Modal } from './Modal'

interface RulesModalProps {
  onClose: () => void
}

export const RulesModal = ({ onClose }: RulesModalProps) => (
  <Modal title="Правила" onClose={onClose}>
    <p>
      Передвигай плитки по полю. Когда две плитки с одинаковым числом сталкиваются, они
      объединяются в одну с удвоенным значением. Цель — собрать 2048!
    </p>
    <div className="rules-examples" aria-label="Примеры объединений">
      <span className="chip">2 + 2 → 4</span>
      <span className="chip">4 + 4 → 8</span>
      <span className="chip">8 + 8 → 16</span>
    </div>
    <ul className="rules-list">
      <li>На компьютере: стрелки или WASD. Z — отменить ход, R — новая игра.</li>
      <li>На телефоне: свайпайте по полю в нужную сторону.</li>
      <li>Новая плитка появляется только после удачного хода.</li>
    </ul>
  </Modal>
)
