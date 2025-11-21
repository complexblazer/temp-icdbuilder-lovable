import { Boxes, Waypoints, Pyramid, Zap } from 'lucide-react';

export function BlankCanvas({ onSelectModule }) {
  const modules = [
    {
      id: 'packager',
      icon: Boxes,
      label: 'Packager',
      description: 'Create and manage integration packages, sequences, and flows',
      status: 'active',
    },
    {
      id: 'explorer',
      icon: Waypoints,
      label: 'Explorer',
      description: 'Discover APIs, browse schemas, and manage connections',
      status: 'coming-soon',
    },
    {
      id: 'architect',
      icon: Pyramid,
      label: 'Architect',
      description: 'Visualize data models and analyze integration impact',
      status: 'coming-soon',
    },
    {
      id: 'observer',
      icon: Zap,
      label: 'Observer',
      description: 'Monitor integration health, SLAs, and telemetry',
      status: 'coming-soon',
    },
  ];

  return (
    <div className="blank-canvas">
      <div className="blank-canvas-content">
        <h1>ICD Builder</h1>
        <p className="subtitle">Strategic Integration Mapping Platform</p>
        
        <div className="module-grid">
          {modules.map(module => {
            const Icon = module.icon;
            const isDisabled = module.status === 'coming-soon';
            
            return (
              <button
                key={module.id}
                className={`module-card ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && onSelectModule(module.id)}
                disabled={isDisabled}
              >
                <div className="module-icon">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <div className="module-info">
                  <h3>{module.label}</h3>
                  <p>{module.description}</p>
                  {isDisabled && <span className="badge">Coming Soon</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
