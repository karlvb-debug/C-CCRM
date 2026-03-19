import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import './Modal.css';

export default function UnsavedChangesPopup({ onSave, onDiscard, onCancel }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon warning">
            <AlertCircle size={32} />
          </div>
          <h3>Unsaved Changes</h3>
        </div>
        <p className="modal-body">
          You have unsaved changes to this record. Would you like to save them before closing?
        </p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onSave}>Save Changes</button>
          <button className="btn-secondary-flat" onClick={onDiscard}>Discard Changes</button>
          <button className="btn-ghost-muted" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
