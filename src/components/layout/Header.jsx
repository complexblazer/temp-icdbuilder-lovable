import React from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
export function Header({
  activeView = 'mapper',
  onViewChange,
  activeFlow,
  packageName,
  theme = 'dark',
  onToggleTheme
}) {
  return <header className="app-header">
      {/* Center: Breadcrumb (contextual) */}
      {activeFlow && packageName && <div className="header-breadcrumb">
          <span className="breadcrumb-package">{packageName}</span>
          <span className="breadcrumb-separator">›</span>
          
        </div>}

      {/* Right: Actions */}
      <div className="header-actions">
        <button className="icon-button" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>
        
      </div>
    </header>;
}