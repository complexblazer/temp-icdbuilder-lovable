export const layoutPresets = {
  focus: { 
    left: 0, 
    center: 100, 
    right: 0,
    description: 'Hide sidebars, focus on workspace'
  },
  balanced: { 
    left: 300, 
    center: 800, 
    right: 300,
    description: 'Equal distribution across panels'
  },
  browse: { 
    left: 200, 
    center: 600, 
    right: 500,
    description: 'Wide field browser for exploration'
  },
};

export const activityItems = [
  { id: 'flows', icon: '📦', label: 'Flows' },
  { id: 'systems', icon: '🔌', label: 'Systems' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];
