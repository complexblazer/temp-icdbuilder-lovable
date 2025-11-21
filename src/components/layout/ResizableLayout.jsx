import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;
const COLLAPSE_THRESHOLD = 50; // Drag within 50px of 0 = auto-collapse

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
        const newLeft = Math.max(0, prev.left + delta); // Allow 0

        // Auto-collapse if dragged below threshold
        if (newLeft < COLLAPSE_THRESHOLD && newLeft > 0) {
          onToggleLeft?.();
          return prev; // Keep previous width for when we expand again
        }

        // Auto-expand if dragging from collapsed state
        if (collapsedPanels.left && delta > 0) {
          onToggleLeft?.();
          return { ...prev, left: MIN_WIDTH_SIDE };
        }

        // Normal resize (respects minimum when expanded)
        if (!collapsedPanels.left && newLeft < MIN_WIDTH_SIDE) {
          return { ...prev, left: MIN_WIDTH_SIDE };
        }

        return { ...prev, left: newLeft };
      });
    },
    [collapsedPanels.left, onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newRight = Math.max(0, prev.right - delta); // Allow 0

        // Auto-collapse if dragged below threshold
        if (newRight < COLLAPSE_THRESHOLD && newRight > 0) {
          onToggleRight?.();
          return prev; // Keep previous width for when we expand again
        }

        // Auto-expand if dragging from collapsed state
        if (collapsedPanels.right && delta < 0) {
          onToggleRight?.();
          return { ...prev, right: MIN_WIDTH_SIDE };
        }

        // Normal resize (respects minimum when expanded)
        if (!collapsedPanels.right && newRight < MIN_WIDTH_SIDE) {
          return { ...prev, right: MIN_WIDTH_SIDE };
        }

        return { ...prev, right: newRight };
      });
    },
    [collapsedPanels.right, onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newBottom = Math.max(0, prev.bottom - delta); // Allow 0

        // Auto-collapse if dragged below threshold
        if (newBottom < COLLAPSE_THRESHOLD && newBottom > 0) {
          onToggleBottom?.();
          return prev; // Keep previous width for when we expand again
        }

        // Auto-expand if dragging from collapsed state
        if (collapsedPanels.bottom && delta < 0) {
          onToggleBottom?.();
          return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
        }

        // Normal resize (respects minimum when expanded)
        if (!collapsedPanels.bottom && newBottom < MIN_HEIGHT_BOTTOM) {
          return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
        }

        return { ...prev, bottom: newBottom };
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

  return (
    <div
      className="resizable-layout-wrapper"
      style={{
        display: "grid",
        gridTemplateRows: bottomHeight > 0 ? `1fr auto ${bottomHeight}px` : "1fr",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Top section with 3-panel layout */}
      <div
        className="resizable-layout"
        style={{
          display: "grid",
          gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div className="resizable-panel left" style={{ width: leftWidth, overflow: "hidden" }}>
          {leftPanel}
        </div>

        <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />

        <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: "auto" }}>
          {centerPanel}
        </div>

        <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />

        <div className="resizable-panel right" style={{ width: rightWidth, overflow: "hidden" }}>
          {rightPanel}
        </div>
      </div>

      {/* Bottom panel - BOUNDED by sidebars (spans left → right, not full width) */}
      {bottomHeight > 0 && (
        <>
          {/* Resize handle row - only visible in center, invisible in sidebar areas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
              height: "4px",
              overflow: "hidden",
            }}
          >
            {/* Left sidebar space - no handle here */}
            <div style={{ width: leftWidth, background: "var(--bg-sidebar)" }} />

            {/* Left handle space - no handle here */}
            <div style={{ width: "4px", background: "transparent" }} />

            {/* Resize handle ONLY in center area */}
            <ResizeHandle onDrag={handleBottomResize} onDoubleClick={toggleBottomPanel} orientation="horizontal" />

            {/* Right handle space - no handle here */}
            <div style={{ width: "4px", background: "transparent" }} />

            {/* Right sidebar space - no handle here */}
            <div style={{ width: rightWidth, background: "var(--bg-sidebar)" }} />
          </div>

          {/* Bottom panel bounded by sidebar widths */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
              height: bottomHeight,
              overflow: "hidden",
            }}
          >
            {/* Left sidebar space - BOTTOM PANEL STARTS AFTER THIS */}
            <div style={{ width: leftWidth, background: "var(--bg-sidebar)" }} />

            {/* Left handle space */}
            <div style={{ width: "4px", background: "transparent" }} />

            {/* Bottom panel content - BOUNDED between sidebars */}
            <div className="resizable-panel bottom" style={{ overflow: "hidden" }}>
              {bottomPanel}
            </div>

            {/* Right handle space */}
            <div style={{ width: "4px", background: "transparent" }} />

            {/* Right sidebar space - BOTTOM PANEL ENDS BEFORE THIS */}
            <div style={{ width: rightWidth, background: "var(--bg-sidebar)" }} />
          </div>
        </>
      )}
    </div>
  );
}
