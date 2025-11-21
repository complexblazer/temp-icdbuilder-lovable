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

        if (newLeft < COLLAPSE_THRESHOLD && newLeft > 0) {
          onToggleLeft?.();
          return prev;
        }

        if (collapsedPanels.left && delta > 0) {
          onToggleLeft?.();
          return { ...prev, left: MIN_WIDTH_SIDE };
        }

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
        const newRight = Math.max(0, prev.right - delta);

        if (newRight < COLLAPSE_THRESHOLD && newRight > 0) {
          onToggleRight?.();
          return prev;
        }

        if (collapsedPanels.right && delta < 0) {
          onToggleRight?.();
          return { ...prev, right: MIN_WIDTH_SIDE };
        }

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
        const newBottom = Math.max(0, prev.bottom - delta);

        if (newBottom < COLLAPSE_THRESHOLD && newBottom > 0) {
          onToggleBottom?.();
          return prev;
        }

        if (collapsedPanels.bottom && delta < 0) {
          onToggleBottom?.();
          return { ...prev, bottom: MIN_HEIGHT_BOTTOM };
        }

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
        gridTemplateRows: bottomHeight > 0 ? `1fr ${bottomHeight}px` : "1fr",
        height: "100%",
        overflow: "hidden",
      }}
    >
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

      {bottomHeight > 0 && (
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
            height: bottomHeight,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: leftWidth,
              background: "var(--bg-sidebar)",
              borderRight: leftWidth > 0 ? "1px solid var(--border-subtle)" : "none",
            }}
          />

          <div style={{ width: "4px", background: "transparent" }} />

          <div
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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

          <div style={{ width: "4px", background: "transparent" }} />

          <div
            style={{
              width: rightWidth,
              background: "var(--bg-sidebar)",
              borderLeft: rightWidth > 0 ? "1px solid var(--border-subtle)" : "none",
            }}
          />
        </div>
      )}
    </div>
  );
}
