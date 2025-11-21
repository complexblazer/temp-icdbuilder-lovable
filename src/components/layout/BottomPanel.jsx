import React, { useState, useEffect } from 'react';
import FieldBrowser from '../FieldBrowser';

export function BottomPanel({ 
  activeBrowsers = ['source'],
  onBrowserSwitch,
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

  const browserLabels = {
    source: 'SOURCE',
    target: 'TARGET',
    custom: 'CUSTOM'
  };
  
  const activeBrowser = activeBrowsers[0]; // For Phase 1, only one active browser

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
        {['source', 'target', 'custom'].map(browserType => {
          const isActive = activeBrowser === browserType;
          const label = browserLabels[browserType];
          
          return (
            <button
              key={browserType}
              className={`bottom-panel-tab ${isActive ? 'active' : ''}`}
              onClick={() => onBrowserSwitch(browserType)}
            >
              <span className="tab-label">{label}</span>
              
              {/* Show system badge for source/target */}
              {browserType === 'source' && sourceSystem && (
                <span className="system-badge">{sourceSystem}</span>
              )}
              {browserType === 'target' && targetSystem && (
                <span className="system-badge">{targetSystem}</span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="bottom-panel-content">
        {activeBrowsers.map(browserType => (
          <FieldBrowser
            key={browserType}
            title={browserLabels[browserType]}
            system={browserState[browserType].system}
            objectFilter={browserState[browserType].object}
            fields={getFieldsForBrowser(browserType)}
            onSystemChange={(system) => handleSystemChange(browserType, system)}
            onObjectFilterChange={(object) => handleObjectChange(browserType, object)}
            onAddField={(field) => onAddField(field, browserType)}
            onBulkAdd={(fields) => onBulkAddFields(fields, browserType)}
            usedFieldIds={usedFieldIds}
            systemLocked={browserType !== 'custom'}
            sidebarMode={false}
          />
        ))}
      </div>
    </div>
  );
}
