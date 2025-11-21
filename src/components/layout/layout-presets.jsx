export const layoutPresets = {
  focus: {
    left: 0,
    center: 100,
    right: 0,
    bottom: 0,
    description: "Hide sidebars, focus on workspace",
  },
  balanced: {
    left: 300,
    center: 800,
    right: 300,
    bottom: 250,
    description: "Equal distribution across panels",
  },
  browse: {
    left: 200,
    center: 600,
    right: 500,
    bottom: 300,
    description: "Wide field browser for exploration",
  },
};

export const activityItems = [
  { id: "packager", icon: "Boxes", label: "Packager" },
  { id: "explorer", icon: "Waypoints", label: "Explorer" },
  { id: "architect", icon: "Pyramid", label: "Architect" },
  { id: "observer", icon: "Zap", label: "Observer" },
];

export const panelControlItems = [
  {
    id: "toggle-left",
    panel: "left",
    icon: "PanelLeft",
    iconCollapsed: "PanelLeftClose",
    label: "Toggle Flows Panel",
  },
  {
    id: "toggle-right",
    panel: "right",
    icon: "PanelRight",
    iconCollapsed: "PanelRightClose",
    label: "Toggle Right Panel",
  },
  {
    id: "toggle-bottom",
    panel: "bottom",
    icon: "PanelBottom",
    iconCollapsed: "PanelBottomClose",
    label: "Toggle Field Browser Panel",
  },
];
