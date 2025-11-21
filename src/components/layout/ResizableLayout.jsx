import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;
const COLLAPSE_THRESHOLD = 50;

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

        // Collapse if dragged below threshold
        if (newLeft > 0 && newLeft < COLLAPSE_THRESHOLD) {
          onToggleLeft?.();
          return prev;
        }

        // Expand from collapsed state
        if (collapsedPanels.left && delta > 5) {
          onToggleLeft?.();
          return { ...prev, left: MIN_WIDTH_SIDE };
        }

        // Normal resize (only when not collapsed)
        if (!collapsedPanels.left && newLeft >= MIN_WIDTH_SIDE) {
          return { ...prev, left: newLeft };
        }

        return prev;
      });
    },
    [collapsedPanels.left, onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newRight = Math.max(0, prev.right - delta);

        // Collapse if dragged below threshold
        if (newRight > 0 && newRight < COLLAPSE_THRESHOLD) {
          onToggleRight?.();
          return prev;
        }

        // Expand from collapsed state
        if (collapsedPanels.right && delta < -5) {
          onToggleRight?.();
          return { ...prev, right: MIN_WIDTH_SIDE };
        }

        // Normal resize (only when not collapsed)
        if (!collapsedPanels.right && newRight >= MIN_WIDTH_SIDE) {
          return { ...prev, right: newRight };
        }

        return prev;
      });
    },
    [collapsedPanels.right, onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        const newBottom = Math.max(0, prev.bottom - delta);

        // Collapse if dragged below threshold
        if (newBottom > 0 && newBottom < COLLAPSE_THRESHOLD) {
          onToggleBottom?.();
          return prev;
        }

        // Expand from collapsed state
        if (collapsedPanels.bottom && delta < -5) {
          onToggleBottom?.();
          return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
        }

        // Normal resize (only when not collapsed)
        if (!collapsedPanels.bottom && newBottom >= MIN_HEIGHT_BOTTOM) {
          return { ...prev, bottom: newBottom };
        }

        return prev;
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

  // Build dynamic grid template - hide collapsed columns entirely
  const gridColumns = [
    !collapsedPanels.left && `${leftWidth}px`,
    !collapsedPanels.left && "auto", // left handle
    "1fr", // center always visible
    !collapsedPanels.right && "auto", // right handle
    !collapsedPanels.right && `${rightWidth}px`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="resizable-layout-wrapper"
      style={{
        display: "grid",
        gridTemplateRows: bottomHeight > 0 ? `1fr ${bottomHeight}px` : "1fr",
        height: "100%",
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
        {/* LEFT PANEL + HANDLE (only if not collapsed) */}
        {!collapsedPanels.left && (
          <>
            <div className="resizable-panel left" style={{ width: leftWidth, overflow: "hidden" }}>
              {leftPanel}
            </div>
            <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />
          </>
        )}

        {/* CENTER PANEL (always visible) */}
        <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: "auto" }}>
          {centerPanel}
        </div>

        {/* RIGHT PANEL + HANDLE (only if not collapsed) */}
        {!collapsedPanels.right && (
          <>
            <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />
            <div className="resizable-panel right" style={{ width: rightWidth, overflow: "hidden" }}>
              {rightPanel}
            </div>
          </>
        )}
      </div>

      {/* BOTTOM PANEL - Spans full width beneath center column only */}
      {bottomHeight > 0 && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            // Calculate margins to align with center panel
            marginLeft: !collapsedPanels.left ? `${leftWidth + 4}px` : "0",
            marginRight: !collapsedPanels.right ? `${rightWidth + 4}px` : "0",
          }}
        >
          <ResizeHandle onDrag={handleBottomResize} onDoubleClick={toggleBottomPanel} orientation="horizontal" />

          <div
            className="resizable-panel bottom"
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            {bottomPanel}
          </div>
        </div>
      )}
    </div>
  );
}
