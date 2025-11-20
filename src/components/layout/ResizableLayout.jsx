import { useState, useCallback } from 'react';
import { ResizeHandle } from './ResizeHandle';

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;

export function ResizableLayout({ 
  leftPanel, 
  centerPanel, 
  rightPanel, 
  defaultWidths = { left: 300, center: 800, right: 300 },
  collapsedPanels = { left: false, right: false },
  onToggleLeft,
  onToggleRight
}) {
  const [widths, setWidths] = useState(defaultWidths);

  const handleLeftResize = useCallback((delta) => {
    setWidths(prev => {
      const newLeft = Math.max(MIN_WIDTH_SIDE, prev.left + delta);
      return { ...prev, left: newLeft };
    });
  }, []);

  const handleRightResize = useCallback((delta) => {
    setWidths(prev => {
      const newRight = Math.max(MIN_WIDTH_SIDE, prev.right - delta);
      return { ...prev, right: newRight };
    });
  }, []);

  const toggleLeftPanel = useCallback(() => {
    onToggleLeft?.();
  }, [onToggleLeft]);

  const toggleRightPanel = useCallback(() => {
    onToggleRight?.();
  }, [onToggleRight]);

  const leftWidth = collapsedPanels.left ? 0 : widths.left;
  const rightWidth = collapsedPanels.right ? 0 : widths.right;

  return (
    <div 
      className="resizable-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div className="resizable-panel left" style={{ width: leftWidth, overflow: 'hidden' }}>
        {leftPanel}
      </div>

      <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />

      <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: 'auto' }}>
        {centerPanel}
      </div>

      <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />

      <div className="resizable-panel right" style={{ width: rightWidth, overflow: 'hidden' }}>
        {rightPanel}
      </div>
    </div>
  );
}
