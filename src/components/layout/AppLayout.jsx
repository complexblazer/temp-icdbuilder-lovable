import { useState } from "react";
import { ResizableLayout } from "./ResizableLayout";
import { ActivityBar } from "./ActivityBar";
import { activityItems, panelControlItems } from "./layout-presets.jsx";

export function AppLayout({ flowsPanel, workspacePanel, fieldsPanel, bottomPanel }) {
  const [activePanel, setActivePanel] = useState("flows");
  const [collapsedPanels, setCollapsedPanels] = useState({
    left: false,
    right: false,
    bottom: false,
  });

  const toggleLeftPanel = () => {
    setCollapsedPanels((prev) => ({ ...prev, left: !prev.left }));
  };

  const toggleRightPanel = () => {
    setCollapsedPanels((prev) => ({ ...prev, right: !prev.right }));
  };

  const toggleBottomPanel = () => {
    setCollapsedPanels((prev) => ({ ...prev, bottom: !prev.bottom }));
  };

  const handlePanelControlClick = (panelId) => {
    if (panelId === "toggle-left") toggleLeftPanel();
    if (panelId === "toggle-right") toggleRightPanel();
    if (panelId === "toggle-bottom") toggleBottomPanel();
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <ActivityBar
        items={activityItems}
        activeItem={activePanel}
        onItemClick={setActivePanel}
        panelControls={panelControlItems}
        collapsedPanels={collapsedPanels}
        onPanelControlClick={handlePanelControlClick}
      />
      <ResizableLayout
        leftPanel={flowsPanel}
        centerPanel={workspacePanel}
        rightPanel={fieldsPanel}
        bottomPanel={bottomPanel}
        defaultWidths={{ left: 300, center: 800, right: 300, bottom: 250 }}
        collapsedPanels={collapsedPanels}
        onToggleLeft={toggleLeftPanel}
        onToggleRight={toggleRightPanel}
        onToggleBottom={toggleBottomPanel}
      />
    </div>
  );
}
