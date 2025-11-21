import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;
const COLLAPSE_THRESHOLD = 150; // ✅ Increased from 100 for better UX
const EXPAND_THRESHOLD = 50;    // ✅ Threshold to re-expand from collapsed state

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
        // ✅ Handle expansion from collapsed state
        if (collapsedPanels.left) {
          if (delta > EXPAND_THRESHOLD) {
            onToggleLeft?.();
            return { ...prev, left: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        const newLeft = Math.max(0, prev.left + delta);

        // ✅ Collapse if dragged below threshold
        if (newLeft < COLLAPSE_THRESHOLD) {
          onToggleLeft?.();
          return { ...prev, left: 0 };
        }

        // ✅ Enforce minimum width
        return { ...prev, left: Math.max(MIN_WIDTH_SIDE, newLeft) };
      });
    },
    [collapsedPanels.left, onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        // ✅ Handle expansion from collapsed state
        if (collapsedPanels.right) {
          if (delta < -EXPAND_THRESHOLD) {
            onToggleRight?.();
            return { ...prev, right: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        const newRight = Math.max(0, prev.right - delta);

        // ✅ Collapse if dragged below threshold
        if (newRight < COLLAPSE_THRESHOLD) {
          onToggleRight?.();
          return { ...prev, right: 0 };
        }

        // ✅ Enforce minimum width
        return { ...prev, right: Math.max(MIN_WIDTH_SIDE, newRight) };
      });
    },
    [collapsedPanels.right, onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        // ✅ Handle expansion from collapsed state
        if (collapsedPanels.bottom) {
          if (delta < -EXPAND_THRESHOLD) {
            onToggleBottom?.();
            return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
          }
          return prev;
        }

        const newBottom = Math.max(0, prev.bottom - delta);

        // ✅ Collapse if dragged below threshold
        if (newBottom < COLLAPSE_THRESHOLD) {
          onToggleBottom?.();
          return { ...prev, bottom: 0 };
        }

        // ✅ Enforce minimum height
        return { ...prev, bottom: Math.max(MIN_HEIGHT_BOTTOM, newBottom) };
      });
    },
    [collapsedPanels.bottom, onToggleBottom],
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
    !collapsedPanels.left && `${leftWidth}px`,
    "auto", // ✅ Always include left handle column
    "1fr",
    "auto", // ✅ Always include right handle column
    !collapsedPanels.right && `${rightWidth}px`,
  ]
    .filter(Boolean)
    .join(" ");

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
        {/* LEFT PANEL - conditionally rendered */}
        {!collapsedPanels.left && (
          <div className="resizable-panel left" style={{ width: leftWidth, overflow: "hidden" }}>
            {leftPanel}
          </div>
        )}

        {/* LEFT HANDLE - always rendered */}
        <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />

        {/* CENTER PANEL - always rendered */}
        <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: "auto" }}>
          {centerPanel}
        </div>

        {/* RIGHT HANDLE - always rendered */}
        <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />

        {/* RIGHT PANEL - conditionally rendered */}
        {!collapsedPanels.right && (
          <div className="resizable-panel right" style={{ width: rightWidth, overflow: "hidden" }}>
            {rightPanel}
          </div>
        )}
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
