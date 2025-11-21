import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;
const COLLAPSE_THRESHOLD = 100; // Increased for better drag-to-collapse feel

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
        // If collapsed, only expand on significant drag right
        if (collapsedPanels.left) {
          if (delta > 10) {
            onToggleLeft?.();
            return { ...prev, left: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        // Calculate new width
        const newLeft = Math.max(0, prev.left + delta);

        // Collapse if dragged below threshold
        if (newLeft < COLLAPSE_THRESHOLD) {
          onToggleLeft?.();
          return { ...prev, left: 0 };
        }

        // Normal resize with minimum width
        if (newLeft >= MIN_WIDTH_SIDE) {
          return { ...prev, left: newLeft };
        }

        // Snap to minimum
        return { ...prev, left: MIN_WIDTH_SIDE };
      });
    },
    [collapsedPanels.left, onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        // If collapsed, only expand on significant drag left
        if (collapsedPanels.right) {
          if (delta < -10) {
            onToggleRight?.();
            return { ...prev, right: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        // Calculate new width (inverse delta for right panel)
        const newRight = Math.max(0, prev.right - delta);

        // Collapse if dragged below threshold
        if (newRight < COLLAPSE_THRESHOLD) {
          onToggleRight?.();
          return { ...prev, right: 0 };
        }

        // Normal resize with minimum width
        if (newRight >= MIN_WIDTH_SIDE) {
          return { ...prev, right: newRight };
        }

        // Snap to minimum
        return { ...prev, right: MIN_WIDTH_SIDE };
      });
    },
    [collapsedPanels.right, onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        // If collapsed, only expand on significant drag up
        if (collapsedPanels.bottom) {
          if (delta < -10) {
            onToggleBottom?.();
            return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
          }
          return prev;
        }

        // Calculate new height (inverse delta for bottom panel)
        const newBottom = Math.max(0, prev.bottom - delta);

        // Collapse if dragged below threshold
        if (newBottom < COLLAPSE_THRESHOLD) {
          onToggleBottom?.();
          return { ...prev, bottom: 0 };
        }

        // Normal resize with minimum height
        if (newBottom >= MIN_HEIGHT_BOTTOM) {
          return { ...prev, bottom: newBottom };
        }

        // Snap to minimum
        return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
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
        gridTemplateRows: bottomHeight > 0 ? `1fr auto ${bottomHeight}px` : "1fr",
        height: "100vh", // FIXED: Force full viewport height
        width: "100vw",
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
            <div
              className="resizable-panel left"
              style={{
                width: leftWidth,
                height: "100vh", // FIXED: Full viewport height
                overflow: "hidden",
              }}
            >
              {leftPanel}
            </div>
            <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />
          </>
        )}

        {/* CENTER PANEL (always visible) */}
        <div
          className="resizable-panel center"
          style={{
            minWidth: MIN_WIDTH_CENTER,
            height: "100vh", // FIXED: Full viewport height
            overflow: "auto",
          }}
        >
          {centerPanel}
        </div>

        {/* RIGHT PANEL + HANDLE (only if not collapsed) */}
        {!collapsedPanels.right && (
          <>
            <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />
            <div
              className="resizable-panel right"
              style={{
                width: rightWidth,
                height: "100vh", // FIXED: Full viewport height
                overflow: "hidden",
              }}
            >
              {rightPanel}
            </div>
          </>
        )}
      </div>

      {/* BOTTOM PANEL RESIZE HANDLE */}
      {bottomHeight > 0 && (
        <ResizeHandle onDrag={handleBottomResize} onDoubleClick={toggleBottomPanel} orientation="horizontal" />
      )}

      {/* BOTTOM PANEL - Spans full width beneath center column only */}
      {bottomHeight > 0 && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: `${bottomHeight}px`,
            // Calculate margins to align with center panel
            marginLeft: !collapsedPanels.left ? `${leftWidth + 4}px` : "0",
            marginRight: !collapsedPanels.right ? `${rightWidth + 4}px` : "0",
          }}
        >
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
