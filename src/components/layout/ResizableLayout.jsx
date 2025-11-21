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

  const handleLeftResize = useCallback((delta) => {
    setWidths((prev) => {
      const newLeft = Math.max(MIN_WIDTH_SIDE, prev.left + delta);
      return { ...prev, left: newLeft };
    });
  }, []);

  const handleRightResize = useCallback((delta) => {
    setWidths((prev) => {
      const newRight = Math.max(MIN_WIDTH_SIDE, prev.right - delta);
      return { ...prev, right: newRight };
    });
  }, []);

  const handleBottomResize = useCallback((delta) => {
    setWidths((prev) => {
      const newBottom = Math.max(MIN_HEIGHT_BOTTOM, prev.bottom - delta);
      return { ...prev, bottom: newBottom };
    });
  }, []);

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

      {/* Bottom panel - centered between sidebars */}
      {bottomHeight > 0 && (
        <>
          {/* Resize handle spans full width */}
          <ResizeHandle onDrag={handleBottomResize} onDoubleClick={toggleBottomPanel} orientation="horizontal" />

          {/* Bottom panel grid - matches top layout structure */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
              height: bottomHeight,
              overflow: "hidden",
            }}
          >
            {/* Empty space where left panel would be */}
            <div style={{ width: leftWidth }} />

            {/* Empty space where left handle would be */}
            <div style={{ width: "4px" }} />

            {/* Bottom panel content - only in center area */}
            <div className="resizable-panel bottom" style={{ overflow: "hidden" }}>
              {bottomPanel}
            </div>

            {/* Empty space where right handle would be */}
            <div style={{ width: "4px" }} />

            {/* Empty space where right panel would be */}
            <div style={{ width: rightWidth }} />
          </div>
        </>
      )}
    </div>
  );
}
