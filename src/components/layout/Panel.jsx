import React from 'react';

export function Panel({ id, children, header, collapsible = false, collapsed = false, onCollapse }) {
  return (
    <div className={`panel ${collapsed ? 'collapsed' : ''}`} data-panel-id={id}>
      {header && (
        <div className="panel-header">
          {header}
          {collapsible && (
            <button
              className="panel-collapse-btn"
              onClick={onCollapse}
              aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          )}
        </div>
      )}
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}
