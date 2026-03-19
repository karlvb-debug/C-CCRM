import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertCircle } from 'lucide-react';
import './Modal.css';

export default function ConfirmPopup({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`modal-icon ${isDanger ? 'danger' : 'warning'}`}>
            {isDanger ? <Trash2 size={32} /> : <AlertCircle size={32} />}
          </div>
          <h3>{title}</h3>
        </div>
        <p className="modal-body">{message}</p>
        <div className="modal-actions-inline">
          <button className="btn-secondary-flat" onClick={onClose}>Cancel</button>
          <button className={isDanger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
