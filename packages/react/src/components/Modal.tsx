import { type ReactNode } from "react";

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="dc-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dc-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dc-modal-header">
          <h3 className="dc-modal-title">{title}</h3>
          <button
            type="button"
            className="dc-btn dc-btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="dc-modal-body">{children}</div>
      </div>
    </div>
  );
}
