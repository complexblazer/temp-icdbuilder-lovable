import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;

export function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel,
  defaultWidths = { left: 300, center: 800, right: 300, bottom: 250 },
  collapsedPanels = { left: false, right: false, bottom: false },
  onToggleLeft,
  onToggleRight,
  onToggleBottom,
}) {
  const [widths, setWidths] = useState(defaultWidths);

  const handleLeftResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newLeft = Math.max(0, prev.left + delta);

        // Expanding from 0? Jump to minimum viable width
        if (prev.left === 0 && newLeft > 0) {
          onToggleLeft?.();
          return { ...prev, left: MIN_WIDTH_SIDE };
        }

        // Collapsing to nearly 0? Snap to 0
        if (newLeft > 0 && newLeft < 50) {
          onToggleLeft?.();
          return { ...prev, left: 0 };
        }

        // Collapsing to exactly 0? Update external state
        if (newLeft === 0 && prev.left > 0) {
          onToggleLeft?.();
          return { ...prev, left: 0 };
        }

        // Normal resize: enforce minimum only when above snap threshold
        return { 
          ...prev, 
          left: newLeft >= 50 ? Math.max(MIN_WIDTH_SIDE, newLeft) : newLeft
        };
      });
    },
    [onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newRight = Math.max(0, prev.right - delta);

        // Expanding from 0? Jump to minimum viable width
        if (prev.right === 0 && newRight > 0) {
          onToggleRight?.();
          return { ...prev, right: MIN_WIDTH_SIDE };
        }

        // Collapsing to nearly 0? Snap to 0
        if (newRight > 0 && newRight < 50) {
          onToggleRight?.();
          return { ...prev, right: 0 };
        }

        // Collapsing to exactly 0? Update external state
        if (newRight === 0 && prev.right > 0) {
          onToggleRight?.();
          return { ...prev, right: 0 };
        }

        // Normal resize: enforce minimum only when above snap threshold
        return { 
          ...prev, 
          right: newRight >= 50 ? Math.max(MIN_WIDTH_SIDE, newRight) : newRight
        };
      });
    },
    [onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newBottom = Math.max(0, prev.bottom - delta);

        // Expanding from 0? Jump to minimum viable height
        if (prev.bottom === 0 && newBottom > 0) {
          onToggleBottom?.();
          return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
        }

        // Collapsing to nearly 0? Snap to 0
        if (newBottom > 0 && newBottom < 50) {
          onToggleBottom?.();
          return { ...prev, bottom: 0 };
        }

        // Collapsing to exactly 0? Update external state
        if (newBottom === 0 && prev.bottom > 0) {
          onToggleBottom?.();
          return { ...prev, bottom: 0 };
        }

        // Normal resize: enforce minimum only when above snap threshold
        return { 
          ...prev, 
          bottom: newBottom >= 50 ? Math.max(MIN_HEIGHT_BOTTOM, newBottom) : newBottom
        };
      });
    },
    [onToggleBottom],
  );

  const toggleLeftPanel = useCallback(() => {
    onToggleLeft?.();
  }, [onToggleLeft]);

  const toggleRightPanel = useCallback(() => {
    onToggleRight?.();
  }, [onToggleRight]);

  const toggleBottomPanel = useCallback(() => {
    onToggleBottom?.();
  }, [onToggleBottom]);

  const leftWidth = collapsedPanels.left ? 0 : widths.left;
  const rightWidth = collapsedPanels.right ? 0 : widths.right;
  const bottomHeight = collapsedPanels.bottom ? 0 : widths.bottom;

  const gridColumns = [
    collapsedPanels.left ? '0px' : `${leftWidth}px`,
    "auto",
    "1fr",
    "auto",
    collapsedPanels.right ? '0px' : `${rightWidth}px`,
  ].join(" ");  // ✅ Fixed 5-column grid - always stable

  return (
    <div
      className="resizable-layout-wrapper"
      style={{
        display: "grid",
        gridTemplateRows: bottomHeight > 0 ? `1fr auto ${bottomHeight}px` : "1fr",
        height: "100%", // FIXED: Inherit height from parent cascade
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* TOP ROW - Three-column layout */}
      <div
        className="resizable-layout"
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* LEFT PANEL - always rendered to maintain grid structure */}
        <div 
          className="resizable-panel left" 
          style={{ 
            width: leftWidth,
            overflow: "hidden",
            display: leftWidth === 0 ? 'none' : 'block'
          }}
        >
          {leftWidth > 0 && leftPanel}
        </div>

        {/* LEFT HANDLE - always rendered */}
        <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />

        {/* CENTER PANEL - always rendered */}
        <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: "auto" }}>
          {centerPanel}
        </div>

        {/* RIGHT HANDLE - always rendered */}
        <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />

        {/* RIGHT PANEL - always rendered to maintain grid structure */}
        <div 
          className="resizable-panel right" 
          style={{ 
            width: rightWidth,
            overflow: "hidden",
            display: rightWidth === 0 ? 'none' : 'block'
          }}
        >
          {rightWidth > 0 && rightPanel}
        </div>
      </div>

      {/* BOTTOM PANEL RESIZE HANDLE - always rendered when bottom panel exists */}
      {bottomPanel && (
        <ResizeHandle 
          onDrag={handleBottomResize} 
          onDoubleClick={toggleBottomPanel} 
          orientation="horizontal"
          style={{ visibility: bottomHeight > 0 ? 'visible' : 'hidden' }}
        />
      )}

      {/* BOTTOM PANEL */}
      {bottomHeight > 0 && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: `${bottomHeight}px`,
            marginLeft: !collapsedPanels.left ? `${leftWidth + 4}px` : "0",
            marginRight: !collapsedPanels.right ? `${rightWidth + 4}px` : "0",
          }}
        >
          <div className="resizable-panel bottom" style={{ flex: 1, overflow: "hidden" }}>
            {bottomPanel}
          </div>
        </div>
      )}
    </div>
  );
}
