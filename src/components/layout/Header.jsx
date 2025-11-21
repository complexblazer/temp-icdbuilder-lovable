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
      {/* Left: Navigation Tabs */}
      <nav className="header-nav">
        <button className={`nav-tab ${activeView === 'mapper' ? 'active' : ''}`} onClick={() => onViewChange?.('mapper')}>
          MAPPER
        </button>
        <button className={`nav-tab ${activeView === 'flows' ? 'active' : ''}`} onClick={() => onViewChange?.('flows')}>
          FLOWS
        </button>
        <button className={`nav-tab ${activeView === 'fields' ? 'active' : ''}`} onClick={() => onViewChange?.('fields')}>
          FIELDS
        </button>
        <button className={`nav-tab ${activeView === 'data' ? 'active' : ''}`} onClick={() => onViewChange?.('data')}>
          DATA
        </button>
      </nav>

      {/* Center: Breadcrumb (contextual) */}
      {activeFlow && packageName && <div className="header-breadcrumb">
          <span className="breadcrumb-package">{packageName}</span>
          <span className="breadcrumb-separator">›</span>
          
        </div>}

      {/* Right: Actions */}
      <div className="header-actions">
        <button className="icon-button" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
      </div>
    </header>;
}