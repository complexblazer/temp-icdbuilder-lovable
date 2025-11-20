import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Checkbox } from "./primitives/Checkbox";

function getSystemColor(system) {
  const sys = system.toLowerCase();
  if (sys.includes('centric')) return 'var(--centric)';
  if (sys.includes('fulfil')) return 'var(--fulfil)';
  if (sys.includes('salsify')) return 'var(--salsify)';
  return 'var(--text-muted)';
}

function DraggableField({ field, side, onAddField, usedFieldIds, multiSelectMode, isSelected, onToggleSelect }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${side}:${field.id}`,
    data: {
      kind: 'field',
      field,
      side,
    },
  });

  const handleClick = () => {
    if (multiSelectMode) {
      onToggleSelect(field.id);
    } else {
      onAddField(field);
    }
  };

  return (
    <button
      ref={setNodeRef}
      {...(multiSelectMode ? {} : listeners)}
      {...(multiSelectMode ? {} : attributes)}
      type="button"
      className={`field-pill ${isDragging ? "dragging" : ""} ${usedFieldIds.has(field.id) ? "used-in-mapping" : ""} ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
      title={field.description || ""}
      style={{ borderLeft: `3px solid ${getSystemColor(field.system)}` }}
    >
      <span className={`field-pill-drag-handle ${multiSelectMode ? 'is-disabled' : ''}`}>⋮⋮</span>
      <span className="field-pill-content">
        <span className="field-pill-name">
          {field.field}
          {field.is_custom && <span className="custom-badge">CUSTOM</span>}
          {usedFieldIds.has(field.id) && <span className="used-badge">✓</span>}
        </span>
        <span className="field-pill-meta">
          <span style={{ color: getSystemColor(field.system) }}>{field.system}</span> · {field.object} · {field.data_type}
        </span>
      </span>
      <span className={`field-pill-trailing ${multiSelectMode ? 'visible' : ''}`}>
        <div className="field-checkbox">
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(field.id)}
          />
        </div>
      </span>
    </button>
  );
}

export default function FieldBrowser({
  title,
  system,
  objectFilter,
  fields,
  onSystemChange,
  onObjectFilterChange,
  onAddField,
  onBulkAdd,
  droppableId,
  usedFieldIds = new Set(),
  systemLocked = false,
  collapsed = false,
  onToggleCollapse = null,
  sidebarMode = false, // NEW: Suppress header when embedded in sidebar
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMapped, setShowMapped] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedFields, setSelectedFields] = useState(new Set());

  const side = title.toLowerCase().includes('source') ? 'source' : 'target';

  const toggleSelect = (fieldId) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleBulkAdd = () => {
    const fieldsToAdd = fields.filter(f => selectedFields.has(f.id));
    if (onBulkAdd && fieldsToAdd.length > 0) {
      onBulkAdd(fieldsToAdd);
      setSelectedFields(new Set());
      setMultiSelectMode(false);
    }
  };

  const handleToggleMultiSelect = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedFields(new Set());
  };

  const systems = Array.from(new Set(fields.map((f) => f.system))).sort();

  const objects = Array.from(
    new Set(
      fields
        .filter((f) => !system || f.system === system)
        .map((f) => f.object)
    )
  ).sort();

  const filteredFields = fields.filter((f) => {
    if (system && f.system !== system) return false;
    if (objectFilter && f.object !== objectFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesField = f.field.toLowerCase().includes(term);
      const matchesObject = f.object.toLowerCase().includes(term);
      if (!matchesField && !matchesObject) return false;
    }

    if (!showMapped && usedFieldIds.has(f.id)) return false;

    return true;
  });

  return (
    <div className={`panel ${collapsed ? 'collapsed' : ''} ${sidebarMode ? 'sidebar-mode' : ''}`}>
      {!sidebarMode && (
        <div 
          className="panel-header" 
          onClick={onToggleCollapse}
          style={{ cursor: onToggleCollapse ? 'pointer' : 'default' }}
        >
          {onToggleCollapse && <span className="nav-chevron">{collapsed ? '▸' : '▾'}</span>}
          <h3>{title}</h3>
          {system && systemLocked && (
            <span className="system-badge" style={{ color: getSystemColor(system) }}>
              {system}
            </span>
          )}
        </div>
      )}
      <div className="panel-body">
        <div className="field-controls">
          {!systemLocked && (
            <div className="field-row">
              <label>System</label>
              <select value={system} onChange={(e) => onSystemChange(e.target.value)}>
                <option value="">All</option>
                {systems.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field-row">
            <label>Object</label>
            <select
              value={objectFilter}
              onChange={(e) => onObjectFilterChange(e.target.value)}
            >
              <option value="">All</option>
              {objects.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="field-row field-toolbar">
            <button
              type="button"
              className={`field-action-btn ${showMapped ? 'active' : ''}`}
              onClick={() => setShowMapped(!showMapped)}
              title={showMapped ? "Hide mapped fields" : "Show mapped fields"}
            >
              {showMapped ? '☑' : '○'} Show All
            </button>
            <button
              type="button"
              className={`field-action-btn ${multiSelectMode ? 'active' : ''}`}
              onClick={handleToggleMultiSelect}
              title={multiSelectMode ? "Exit multi-select mode" : "Enable multi-select mode"}
            >
              ☑ Multi
            </button>
          </div>
          {multiSelectMode && selectedFields.size > 0 && (
            <div className="bulk-add-bar">
              <span className="selected-count">{selectedFields.size} selected</span>
              <button
                type="button"
                className="bulk-add-btn"
                onClick={handleBulkAdd}
              >
                Add to Mapping
              </button>
            </div>
          )}
        </div>
        <div className="field-list">
          {systemLocked && !system ? (
            <div className="empty-hint">
              Set Source and Target systems in the Flow config to see fields.
            </div>
          ) : (
            <>
              {filteredFields.map((f) => (
                <DraggableField
                  key={f.id}
                  field={f}
                  side={side}
                  onAddField={onAddField}
                  usedFieldIds={usedFieldIds}
                  multiSelectMode={multiSelectMode}
                  isSelected={selectedFields.has(f.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
              {filteredFields.length === 0 && (
                <div className="empty-hint">No fields for this filter.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

