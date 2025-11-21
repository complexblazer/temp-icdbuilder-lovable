import React from 'react';

export function ActivityBar({ items, activeItem, onItemClick, panelControls, collapsedPanels, onPanelControlClick }) {
  return (
    <div className="activity-bar">
      <div className="activity-bar-main">
        {items.map(item => (
          <ActivityBarIcon
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
      
      {panelControls && (
        <div className="activity-bar-controls">
          {panelControls.map(control => {
            const isCollapsed = collapsedPanels?.[control.panel];
            return (
              <ActivityBarIcon
                key={control.id}
                icon={isCollapsed ? control.iconCollapsed : control.icon}
                label={control.label}
                active={!isCollapsed}
                onClick={() => onPanelControlClick(control.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivityBarIcon({ icon, label, active, onClick }) {
  return (
    <button
      className={`activity-bar-icon ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="icon">{icon}</span>
    </button>
  );
}
