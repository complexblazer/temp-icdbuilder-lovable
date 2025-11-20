import React, { useState, useEffect } from 'react';
import FieldBrowser from '../FieldBrowser';

export function BottomPanel({ 
  activeBrowser, 
  openTabs, 
  onTabClick, 
  onTabClose,
  fields,
  onAddField,
  onBulkAddFields,
  sourceSystem,
  targetSystem,
  usedFieldIds = new Set()
}) {
  // Local state for each browser's filters
  const [browserState, setBrowserState] = useState({
    source: { system: sourceSystem || '', object: '' },
    target: { system: targetSystem || '', object: '' },
    custom: { system: '', object: '' }
  });

  // Update source/target systems when flow changes
  useEffect(() => {
    setBrowserState(prev => ({
      ...prev,
      source: { system: sourceSystem || '', object: '' },
      target: { system: targetSystem || '', object: '' }
    }));
  }, [sourceSystem, targetSystem]);

  if (!openTabs || openTabs.length === 0) {
    return (
      <div className="bottom-panel-empty">
        <p className="text-muted">Click SOURCE, TARGET, or CUSTOM in the sidebar to open field browsers</p>
      </div>
    );
  }

  const browserLabels = {
    source: 'SOURCE',
    target: 'TARGET',
    custom: 'CUSTOM'
  };

  const handleSystemChange = (browserType, system) => {
    setBrowserState(prev => ({
      ...prev,
      [browserType]: { ...prev[browserType], system, object: '' }
    }));
  };

  const handleObjectChange = (browserType, object) => {
    setBrowserState(prev => ({
      ...prev,
      [browserType]: { ...prev[browserType], object }
    }));
  };

  // Filter fields by browser type
  const getFieldsForBrowser = (browserType) => {
    if (browserType === 'custom') {
      return fields.filter(f => f.is_custom);
    }
    // For source/target, filter by active flow's system
    const system = browserType === 'source' ? sourceSystem : targetSystem;
    if (!system) return [];
    return fields.filter(f => f.system === system && !f.is_custom);
  };

  return (
    <div className="bottom-panel">
      <div className="bottom-panel-tabs">
        {openTabs.map(tab => (
          <button
            key={tab}
            className={`bottom-panel-tab ${activeBrowser === tab ? 'active' : ''}`}
            onClick={() => onTabClick(tab)}
          >
            <span className="tab-label">{browserLabels[tab]}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab);
              }}
              aria-label={`Close ${browserLabels[tab]}`}
            >
              ×
            </button>
          </button>
        ))}
      </div>
      
      <div className="bottom-panel-content">
        {activeBrowser && (
          <FieldBrowser
            title={browserLabels[activeBrowser]}
            system={browserState[activeBrowser].system}
            objectFilter={browserState[activeBrowser].object}
            fields={getFieldsForBrowser(activeBrowser)}
            onSystemChange={(system) => handleSystemChange(activeBrowser, system)}
            onObjectFilterChange={(object) => handleObjectChange(activeBrowser, object)}
            onAddField={(field) => onAddField(field, activeBrowser)}
            onBulkAdd={(fields) => onBulkAddFields(fields, activeBrowser)}
            usedFieldIds={usedFieldIds}
            systemLocked={activeBrowser !== 'custom'}
            sidebarMode={false}
          />
        )}
      </div>
    </div>
  );
}
