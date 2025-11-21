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
        gridTemplateColumns: `${leftWidth}px auto 1fr auto ${rightWidth}px`,
        gridTemplateRows: bottomHeight > 0 ? `1fr auto ${bottomHeight}px` : "1fr",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Row 1: Main content panels */}
      <div
        className="resizable-panel left"
        style={{
          width: leftWidth,
          overflow: "hidden",
          gridColumn: "1",
          gridRow: "1",
        }}
      >
        {leftPanel}
      </div>

      <ResizeHandle
        onDrag={handleLeftResize}
        onDoubleClick={toggleLeftPanel}
        style={{ gridColumn: "2", gridRow: "1" }}
      />

      <div
        className="resizable-panel center"
        style={{
          minWidth: MIN_WIDTH_CENTER,
          overflow: "auto",
          gridColumn: "3",
          gridRow: "1",
        }}
      >
        {centerPanel}
      </div>

      <ResizeHandle
        onDrag={handleRightResize}
        onDoubleClick={toggleRightPanel}
        style={{ gridColumn: "4", gridRow: "1" }}
      />

      <div
        className="resizable-panel right"
        style={{
          width: rightWidth,
          overflow: "hidden",
          gridColumn: "5",
          gridRow: "1",
        }}
      >
        {rightPanel}
      </div>

      {/* Row 2: Bottom panel resize handle (centered between sidebars) */}
      {bottomHeight > 0 && (
        <>
          <ResizeHandle
            onDrag={handleBottomResize}
            onDoubleClick={toggleBottomPanel}
            orientation="horizontal"
            style={{
              gridColumn: "3", // Only spans center column
              gridRow: "2",
            }}
          />

          {/* Row 3: Bottom panel (centered between sidebars) */}
          <div
            className="resizable-panel bottom"
            style={{
              height: bottomHeight,
              overflow: "hidden",
              gridColumn: "3", // Only spans center column
              gridRow: "3",
            }}
          >
            {bottomPanel}
          </div>
        </>
      )}
    </div>
  );
}
