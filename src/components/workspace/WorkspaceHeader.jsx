import React, { useState, useRef, useEffect } from 'react';
import { HierarchyPicker } from './HierarchyPicker';
import { ChevronDown, ChevronUp, MoreVertical, Plus } from 'lucide-react';

function ContextMenu({ onSave, onSaveAs, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSaveAs = () => {
    const newName = prompt('Enter new map name:');
    if (newName && newName.trim()) {
      onSaveAs(newName.trim());
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this map and all its mappings?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="context-menu" ref={menuRef}>
      <button className="context-menu-item" onClick={() => { onSave(); onClose(); }}>
        Save Map
      </button>
      <button className="context-menu-item" onClick={handleSaveAs}>
        Save Map As...
      </button>
      <div className="context-menu-divider" />
      <button className="context-menu-item danger" onClick={handleDelete}>
        Delete Map
      </button>
    </div>
  );
}

export function WorkspaceHeader({
  packages,
  sequences,
  flows,
  maps,
  activePackageId,
  activeSequenceId,
  activeFlowId,
  activeMapId,
  onPackageChange,
  onSequenceChange,
  onFlowChange,
  onMapChange,
  toolbarExpanded,
  onToggleToolbar,
  hideMapped,
  onToggleHideMapped,
  onSaveMap,
  onSaveMapAs,
  onDeleteMap,
  onNewRow,
}) {
  const [showContextMenu, setShowContextMenu] = useState(false);

  return (
    <div className="workspace-header">
      {/* Main row - always visible */}
      <div className="workspace-header-main">
        <HierarchyPicker
          packages={packages}
          sequences={sequences}
          flows={flows}
          maps={maps}
          activePackageId={activePackageId}
          activeSequenceId={activeSequenceId}
          activeFlowId={activeFlowId}
          activeMapId={activeMapId}
          onPackageChange={onPackageChange}
          onSequenceChange={onSequenceChange}
          onFlowChange={onFlowChange}
          onMapChange={onMapChange}
        />
        
        <div className="workspace-header-actions">
          <button
            className="workspace-header-action-btn"
            onClick={onToggleToolbar}
            title={toolbarExpanded ? 'Hide toolbar' : 'Show toolbar'}
          >
            {toolbarExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="context-menu-wrapper">
            <button
              className="workspace-header-action-btn"
              onClick={() => setShowContextMenu(!showContextMenu)}
              title="Actions"
              disabled={!activeMapId}
            >
              <MoreVertical size={16} />
            </button>
            {showContextMenu && (
              <ContextMenu
                onSave={onSaveMap}
                onSaveAs={onSaveMapAs}
                onDelete={() => onDeleteMap(activeMapId)}
                onClose={() => setShowContextMenu(false)}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Collapsible toolbar */}
      <div className={`workspace-toolbar ${toolbarExpanded ? 'expanded' : ''}`}>
        <label className="workspace-toolbar-filter">
          <input
            type="checkbox"
            checked={hideMapped}
            onChange={(e) => onToggleHideMapped(e.target.checked)}
          />
          <span>Hide Mapped</span>
        </label>
        
        <button
          className="workspace-toolbar-btn"
          onClick={onNewRow}
          disabled={!activeMapId}
        >
          <Plus size={16} />
          <span>New Row</span>
        </button>
      </div>
    </div>
  );
}
