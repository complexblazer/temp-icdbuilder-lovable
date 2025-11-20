import { useState } from 'react';
import { ResizableLayout } from './ResizableLayout';
import { ActivityBar } from './ActivityBar';
import { activityItems } from './layout-presets';

export function AppLayout({ flowsPanel, workspacePanel, fieldsPanel }) {
  const [activePanel, setActivePanel] = useState('flows');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <ActivityBar 
        items={activityItems}
        activeItem={activePanel}
        onItemClick={setActivePanel}
      />
      <ResizableLayout
        leftPanel={flowsPanel}
        centerPanel={workspacePanel}
        rightPanel={fieldsPanel}
        defaultWidths={{ left: 300, center: 800, right: 300 }}
      />
    </div>
  );
}
