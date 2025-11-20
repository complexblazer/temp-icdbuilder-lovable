export function ActivityBar({ items, activeItem, onItemClick }) {
  return (
    <div className="activity-bar">
      {items.map(item => (
        <ActivityBarIcon
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeItem === item.id}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  );
}

function ActivityBarIcon({ icon, label, active, onClick }) {
  return (
    <button
      className={`activity-bar-icon ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="icon">{icon}</span>
    </button>
  );
}
