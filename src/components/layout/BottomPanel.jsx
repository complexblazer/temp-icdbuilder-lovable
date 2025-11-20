import FieldBrowser from '../FieldBrowser';

export function BottomPanel({ 
  activeBrowser, 
  openTabs, 
  onTabClick, 
  onTabClose,
  fields,
  onFieldClick,
  mappings
}) {
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
            type={activeBrowser}
            fields={fields}
            onFieldClick={onFieldClick}
            mappings={mappings}
            hideHeader={true}
          />
        )}
      </div>
    </div>
  );
}
