import { useEffect, useId, type ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose?: () => void
  closeLabel?: string
}

export const Modal = ({ title, children, onClose, closeLabel = 'Закрыть' }: ModalProps) => {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        {onClose ? (
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
