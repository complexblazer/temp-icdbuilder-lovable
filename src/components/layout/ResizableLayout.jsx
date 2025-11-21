import { useState, useCallback } from "react";
import { ResizeHandle } from "./ResizeHandle";

const MIN_WIDTH_SIDE = 200;
const MIN_WIDTH_CENTER = 400;
const MIN_HEIGHT_BOTTOM = 150;
const COLLAPSE_THRESHOLD = 100;

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
        if (collapsedPanels.left) {
          if (delta > 10) {
            onToggleLeft?.();
            return { ...prev, left: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        const newLeft = Math.max(0, prev.left + delta);

        if (newLeft < COLLAPSE_THRESHOLD) {
          onToggleLeft?.();
          return { ...prev, left: 0 };
        }

        if (newLeft >= MIN_WIDTH_SIDE) {
          return { ...prev, left: newLeft };
        }

        return { ...prev, left: MIN_WIDTH_SIDE };
      });
    },
    [collapsedPanels.left, onToggleLeft],
  );

  const handleRightResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        if (collapsedPanels.right) {
          if (delta < -10) {
            onToggleRight?.();
            return { ...prev, right: MIN_WIDTH_SIDE };
          }
          return prev;
        }

        const newRight = Math.max(0, prev.right - delta);

        if (newRight < COLLAPSE_THRESHOLD) {
          onToggleRight?.();
          return { ...prev, right: 0 };
        }

        if (newRight >= MIN_WIDTH_SIDE) {
          return { ...prev, right: newRight };
        }

        return { ...prev, right: MIN_WIDTH_SIDE };
      });
    },
    [collapsedPanels.right, onToggleRight],
  );

  const handleBottomResize = useCallback(
    (delta) => {
      setWidths((prev) => {
        if (collapsedPanels.bottom) {
          if (delta < -10) {
            onToggleBottom?.();
            return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
          }
          return prev;
        }

        const newBottom = Math.max(0, prev.bottom - delta);

        if (newBottom < COLLAPSE_THRESHOLD) {
          onToggleBottom?.();
          return { ...prev, bottom: 0 };
        }

        if (newBottom >= MIN_HEIGHT_BOTTOM) {
          return { ...prev, bottom: newBottom };
        }

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

  const gridColumns = [
    !collapsedPanels.left && `${leftWidth}px`,
    !collapsedPanels.left && "auto",
    "1fr",
    !collapsedPanels.right && "auto",
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
        {/* LEFT PANEL + HANDLE */}
        {!collapsedPanels.left && (
          <>
            <div className="resizable-panel left" style={{ width: leftWidth, overflow: "hidden" }}>
              {leftPanel}
            </div>
            <ResizeHandle onDrag={handleLeftResize} onDoubleClick={toggleLeftPanel} />
          </>
        )}

        {/* CENTER PANEL */}
        <div className="resizable-panel center" style={{ minWidth: MIN_WIDTH_CENTER, overflow: "auto" }}>
          {centerPanel}
        </div>

        {/* RIGHT PANEL + HANDLE */}
        {!collapsedPanels.right && (
          <>
            <ResizeHandle onDrag={handleRightResize} onDoubleClick={toggleRightPanel} />
            <div className="resizable-panel right" style={{ width: rightWidth, overflow: "hidden" }}>
              {rightPanel}
            </div>
          </>
        )}
      </div>

      {/* BOTTOM PANEL RESIZE HANDLE */}
      {bottomHeight > 0 && (
        <ResizeHandle onDrag={handleBottomResize} onDoubleClick={toggleBottomPanel} orientation="horizontal" />
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
