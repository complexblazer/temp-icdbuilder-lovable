import React from 'react';

export function SettingsModal({ 
  isOpen, 
  onClose,
  dataSubsections,
  setDataSubsections,
  fileInputRef,
  workspaceInputRef,
  handleCatalogUpload,
  handleImportWorkspace,
  exportMappingsCsv,
  exportDataContractJson,
  exportBooEngineProfile,
  handleExportWorkspace,
  activeFlow,
  activeFlowId
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button 
            className="settings-modal-close" 
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        
        <div className="settings-modal-body">
          {/* DATA SECTION */}
          <div className="settings-section">
            <h3 className="settings-section-title">Data Management</h3>
            
            {/* IMPORTS Subsection */}
            <div className="settings-subsection">
              <div 
                className="settings-subsection-header"
                onClick={() => setDataSubsections(prev => ({ ...prev, imports: !prev.imports }))}
              >
                <span className="nav-chevron">{dataSubsections.imports ? '▾' : '▸'}</span>
                <span>IMPORTS</span>
              </div>
              {dataSubsections.imports && (
                <div className="settings-subsection-body">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCatalogUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="data-item-icon">↓</span>
                    <span>Load fields catalog</span>
                  </button>
                  <input
                    ref={workspaceInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportWorkspace}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => workspaceInputRef.current?.click()}
                  >
                    <span className="data-item-icon">↓</span>
                    <span>Import workspace</span>
                  </button>
                </div>
              )}
            </div>

            {/* EXPORTS Subsection */}
            <div className="settings-subsection">
              <div 
                className="settings-subsection-header"
                onClick={() => setDataSubsections(prev => ({ ...prev, exports: !prev.exports }))}
              >
                <span className="nav-chevron">{dataSubsections.exports ? '▾' : '▸'}</span>
                <span>EXPORTS</span>
              </div>
              {dataSubsections.exports && (
                <div className="settings-subsection-body">
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => exportMappingsCsv(activeFlow?.mappings || [])}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>ICD CSV</span>
                  </button>
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => exportDataContractJson(activeFlow?.mappings || [], activeFlowId)}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>JSON Contract</span>
                  </button>
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => exportBooEngineProfile(activeFlow?.mappings || [], activeFlowId)}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>BOO Profile</span>
                  </button>
                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={handleExportWorkspace}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>Export workspace</span>
                  </button>
                </div>
              )}
            </div>

            {/* ISSUES Subsection */}
            <div className="settings-subsection">
              <div 
                className="settings-subsection-header"
                onClick={() => setDataSubsections(prev => ({ ...prev, issues: !prev.issues }))}
              >
                <span className="nav-chevron">{dataSubsections.issues ? '▾' : '▸'}</span>
                <span>ISSUES</span>
              </div>
              {dataSubsections.issues && (
                <div className="settings-subsection-body">
                  <div className="placeholder-content">
                    No issues detected
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
