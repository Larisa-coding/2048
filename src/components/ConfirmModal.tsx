import { Modal } from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: ConfirmModalProps) => (
  <Modal title={title} onClose={onCancel} closeLabel="Отмена">
    <p>{message}</p>
    <div className="modal-actions">
      <button
        type="button"
        className="btn btn-primary"
        style={danger ? { background: 'var(--danger)' } : undefined}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
)
