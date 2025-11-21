import React from 'react';
import { icons } from 'lucide-react';

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
  // For panel controls, icon is still a string (unicode)
  // For activity items, icon is a Lucide component name (e.g., "Boxes")
  const isLucideIcon = typeof icon === 'string' && icons[icon];
  const LucideIcon = isLucideIcon ? icons[icon] : null;
  
  return (
    <button
      className={`activity-bar-icon ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {LucideIcon ? (
        <LucideIcon size={20} strokeWidth={2} />
      ) : (
        <span className="icon">{icon}</span>
      )}
    </button>
  );
}
