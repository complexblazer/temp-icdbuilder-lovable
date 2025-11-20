import React from 'react';
import '../styles/components/modal.css';

export function ImportStrategyModal({ isOpen, onClose, onConfirm, conflictCount }) {
  const [strategy, setStrategy] = React.useState('replace');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(strategy);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Catalog Strategy</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Choose how to handle the imported catalog:
          </p>

          <div className="strategy-options">
            <label className="strategy-option">
              <input
                type="radio"
                name="strategy"
                value="replace"
                checked={strategy === 'replace'}
                onChange={(e) => setStrategy(e.target.value)}
              />
              <div className="strategy-details">
                <strong>Replace</strong>
                <span>Clear existing catalog and import new fields</span>
              </div>
            </label>

            <label className="strategy-option">
              <input
                type="radio"
                name="strategy"
                value="merge"
                checked={strategy === 'merge'}
                onChange={(e) => setStrategy(e.target.value)}
              />
              <div className="strategy-details">
                <strong>Update/Merge</strong>
                <span>
                  Keep existing fields and add new ones. 
                  {conflictCount > 0 && (
                    <span className="conflict-note"> ({conflictCount} conflicts will update existing fields)</span>
                  )}
                </span>
              </div>
            </label>
          </div>

          {strategy === 'replace' && (
            <div className="strategy-warning">
              ⚠️ Warning: All existing catalog data and custom fields will be removed. Mappings referencing deleted fields will be cleared.
            </div>
          )}

          {strategy === 'merge' && conflictCount > 0 && (
            <div className="strategy-info">
              ℹ️ Fields with matching identifiers (system.object.field) will be updated with imported data.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
