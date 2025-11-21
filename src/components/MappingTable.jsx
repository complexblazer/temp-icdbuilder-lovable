import React, { useState, useRef, useEffect } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getSystemColor(system) {
  const sys = system?.toLowerCase() || '';
  if (sys.includes('centric')) return 'var(--centric)';
  if (sys.includes('fulfil')) return 'var(--fulfil)';
  if (sys.includes('salsify')) return 'var(--salsify)';
  return 'var(--text-muted)';
}

const TRANSFORM_RULES = [
  "identity",
  "enum_lookup",
  "cnl_resolve",
  "string_to_number",
  "number_to_string",
  "compose",
  "uppercase",
  "lowercase",
];

function RowDropZone({ rowId, side, field, onFieldSelect, systemName, availableFields, onCreateCustomField }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFieldData, setCustomFieldData] = useState({ field: "", object: "", data_type: "string" });
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const customFormRef = useRef(null);

  const { setNodeRef, isOver } = useDroppable({
    id: `mapping-row-${rowId}-${side}`,
    data: {
      kind: 'row-drop-zone',
      rowId,
      side,
    },
  });

  const draggable = useDraggable({
    id: `filled-dropzone-${rowId}-${side}`,
    data: {
      kind: 'filled-field',
      field,
      rowId,
      side,
    },
    disabled: !field,
  });

  // Click outside to close suggestions and custom form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        customFormRef.current &&
        !customFormRef.current.contains(event.target)
      ) {
        setShowCustomForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateCustomField = () => {
    if (!systemName) {
      alert('Please configure the flow system before creating custom fields.');
      return;
    }

    if (!customFieldData.field || !customFieldData.object) return;

    const newField = onCreateCustomField({
      system: systemName,
      object: customFieldData.object,
      field: customFieldData.field,
      data_type: customFieldData.data_type,
    });

    if (newField) {
      onFieldSelect(newField);
      setCustomFieldData({ field: "", object: "", data_type: "string" });
      setShowCustomForm(false);
    }
  };

  if (!field) {
    // Filter fields by system and search term
    const filteredFields = (availableFields || [])
      .filter(f => f.system === systemName)
      .filter(f => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          f.field.toLowerCase().includes(term) ||
          f.object.toLowerCase().includes(term)
        );
      })
      .slice(0, 10); // Limit to 10 suggestions

    return (
      <div
        ref={setNodeRef}
        className={`row-drop-zone empty ${isOver ? 'drag-over' : ''}`}
      >
        <div className="color-indicator" style={{ backgroundColor: getSystemColor(systemName) }}></div>
        <div className="field-info">
          <div className="field-search-container" ref={searchRef}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="field-search-input"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                style={{ flex: 1 }}
              />
              <button
                className="icon-button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                title="Add custom field"
                aria-label="Add custom field"
              >
                +
              </button>
            </div>
            {showSuggestions && filteredFields.length > 0 && (
              <div className="field-suggestions" ref={suggestionsRef}>
                {filteredFields.map((f) => (
                  <div
                    key={f.id}
                    className="field-suggestion-item"
                    onClick={() => {
                      onFieldSelect(f);
                      setSearchTerm("");
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="suggestion-name">{f.field}</div>
                    <div className="suggestion-meta">
                      <span style={{ color: getSystemColor(f.system) }}>{f.system}</span> · {f.object} · {f.data_type}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showCustomForm && (
              <div className="custom-field-form" ref={customFormRef}>
                <div className="form-header">Create Custom Field</div>
                <div className="form-field">
                  <label>Field Name</label>
                  <input
                    type="text"
                    value={customFieldData.field}
                    onChange={(e) => setCustomFieldData({ ...customFieldData, field: e.target.value })}
                    placeholder="e.g. product_sku"
                  />
                </div>
                <div className="form-field">
                  <label>Object</label>
                  <input
                    type="text"
                    list={`object-suggestions-${systemName}`}
                    value={customFieldData.object}
                    onChange={(e) => setCustomFieldData({ ...customFieldData, object: e.target.value })}
                    placeholder="e.g. Product"
                  />
                  <datalist id={`object-suggestions-${systemName}`}>
                    {systemName && Array.from(new Set(
                      (availableFields || [])
                        .filter(f => f.system === systemName)
                        .map(f => f.object)
                    )).sort().map(obj => (
                      <option key={obj} value={obj} />
                    ))}
                  </datalist>
                </div>
                <div className="form-field">
                  <label>Type</label>
                  <input
                    type="text"
                    value={customFieldData.data_type}
                    onChange={(e) => setCustomFieldData({ ...customFieldData, data_type: e.target.value })}
                    placeholder="e.g. string, number, boolean"
                  />
                </div>
                <button
                  className="save-custom-field-btn"
                  onClick={handleCreateCustomField}
                  disabled={!customFieldData.field || !customFieldData.object}
                >
                  Save Field
                </button>
              </div>
            )}
          </div>
          <div className="field-meta">
            <span style={{ color: getSystemColor(systemName) }}>{systemName}</span> · Object · Type
          </div>
        </div>
      </div>
    );
  }

  const handleFilledClick = (e) => {
    // Allow clicking to clear/change the field
    if (e.target.closest('.clear-field-btn')) {
      onFieldSelect(null);
      e.stopPropagation();
    }
  };

  return (
    <div 
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      className={`row-drop-zone filled ${draggable.isDragging ? 'dragging' : ''}`}
      style={{ cursor: 'grab' }}
      onClick={handleFilledClick}
    >
      <div className="field-info">
        <div className="field-name" style={{ borderLeftColor: getSystemColor(field.system) }}>
          {field.field}
          {field.is_custom && <span className="custom-badge-inline">C</span>}
          <button 
            className="clear-field-btn"
            onClick={(e) => {
              e.stopPropagation();
              onFieldSelect(null);
            }}
            title="Clear field"
          >
            ×
          </button>
        </div>
        <div className="field-meta">
          <span style={{ color: getSystemColor(field.system) }}>{field.system}</span> · {field.object} · {field.data_type}
        </div>
      </div>
    </div>
  );
}

function SortableMappingRow({ row, idx, handleChange, onRemove, validateRow, sourceSystem, targetSystem, availableFields, onFieldSelect, onCreateCustomField, showFlowName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      kind: 'mapping-row',
      index: idx,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFieldChange = (side, field, value) => {
    handleChange(idx, side, field, value);
  };

  const issues = validateRow(row);
  const severity = issues.some((i) => i.includes("Missing"))
    ? "error"
    : issues.length
    ? "warning"
    : "ok";

  // Use flow-specific systems when available (Show All mode), otherwise use props
  const rowSourceSystem = row._sourceSystem || sourceSystem;
  const rowTargetSystem = row._targetSystem || targetSystem;

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="drag-handle" {...attributes} {...listeners}>
        <span className="drag-icon">⋮⋮</span>
      </td>
      {showFlowName && (
        <td>
          <span className="flow-name-cell">
            {row._packageName && row._flowName && `${row._packageName} > ${row._flowName}`}
          </span>
        </td>
      )}
      <td className="drop-zone-cell">
        <RowDropZone
          rowId={row.id}
          side="source"
          field={row.source}
          onFieldSelect={(field) => onFieldSelect(idx, 'source', field)}
          systemName={rowSourceSystem}
          availableFields={availableFields}
          onCreateCustomField={onCreateCustomField}
        />
      </td>
      <td className="metadata-cell">
        <input
          type="checkbox"
          checked={row.source?.required_by_system || false}
          onChange={(e) => handleChange(idx, "source", "required_by_system", e.target.checked)}
          disabled={!row.source}
        />
      </td>
      <td className="metadata-cell">
        <input
          type="checkbox"
          checked={row.source?.required_in_integration || false}
          onChange={(e) => handleChange(idx, "source", "required_in_integration", e.target.checked)}
          disabled={!row.source}
        />
      </td>
      <td className="metadata-cell">
        <select
          value={row.source?.priority_level || ""}
          onChange={(e) => handleChange(idx, "source", "priority_level", e.target.value)}
          className="priority-select"
          disabled={!row.source}
        >
          <option value="">-</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
      </td>
      <td>
        <select
          value={row.shared?.transform_rule || ""}
          onChange={(e) => handleChange(idx, "shared", "transform_rule", e.target.value)}
          className="shared-select"
        >
          <option value="">(none)</option>
          {TRANSFORM_RULES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="drop-zone-cell">
        <RowDropZone
          rowId={row.id}
          side="target"
          field={row.target}
          onFieldSelect={(field) => onFieldSelect(idx, 'target', field)}
          systemName={rowTargetSystem}
          availableFields={availableFields}
          onCreateCustomField={onCreateCustomField}
        />
      </td>
      <td className="metadata-cell">
        <input
          type="checkbox"
          checked={row.target?.required_by_system || false}
          onChange={(e) => handleChange(idx, "target", "required_by_system", e.target.checked)}
          disabled={!row.target}
        />
      </td>
      <td className="metadata-cell">
        <input
          type="checkbox"
          checked={row.target?.required_in_integration || false}
          onChange={(e) => handleChange(idx, "target", "required_in_integration", e.target.checked)}
          disabled={!row.target}
        />
      </td>
      <td className="metadata-cell">
        <select
          value={row.target?.priority_level || ""}
          onChange={(e) => handleChange(idx, "target", "priority_level", e.target.value)}
          className="priority-select"
          disabled={!row.target}
        >
          <option value="">-</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          value={row.shared?.human_name || ""}
          onChange={(e) => handleChange(idx, "shared", "human_name", e.target.value)}
          placeholder="Common name"
          className="shared-input"
        />
      </td>
      <td>
        <input
          type="text"
          value={row.shared?.notes || ""}
          onChange={(e) => handleChange(idx, "shared", "notes", e.target.value)}
          placeholder="Notes"
          className="shared-input"
        />
      </td>
      <td>
        <span className={`status-badge status-${severity}`}>
          {severity === "ok" ? "Valid" : issues.join("; ")}
        </span>
      </td>
      <td>
        <button
          type="button"
          className="icon-button"
          onClick={() => onRemove(idx)}
          title="Remove"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

function DropZone({ id, label }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone-hint ${isOver ? "drag-over" : ""}`}
    >
      <span className="drop-hint">{label}</span>
    </div>
  );
}

export default function MappingTable({ mappings, onUpdate, onRemove, sourceSystem, targetSystem, availableFields, onCreateCustomField, packageName, flowName, showAllFlows, onToggleShowAll, allFlows, packages }) {
  const [hideMapped, setHideMapped] = useState(false);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState(new Set());
  const completionTimersRef = useRef(new Map());

  const { setNodeRef: setTableRef, isOver: isTableOver } = useDroppable({
    id: 'mapping-table-drop',
  });

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      completionTimersRef.current.forEach(timerId => clearTimeout(timerId));
      completionTimersRef.current.clear();
    };
  }, []);

  // Aggregate all mappings from all flows when showAllFlows is true
  const allMappings = showAllFlows && allFlows
    ? allFlows.flatMap(flow => 
        (flow.mappings || []).map(mapping => ({
          ...mapping,
          _flowId: flow.id,
          _flowName: flow.name,
          _packageName: packages?.find(p => p.id === flow.package_id)?.name,
          _sourceSystem: flow.source_system,
          _targetSystem: flow.target_system
        }))
      )
    : mappings;

  // Filter out mapped rows if hideMapped is true, but keep recently completed ones visible for feedback
  const displayMappings = hideMapped
    ? allMappings.filter(row => !row.source || !row.target || recentlyCompletedIds.has(row.id))
    : allMappings;

  const handleChange = (index, section, field, value) => {
    const updated = [...mappings];
    const row = { ...updated[index] };

    if (section === "shared") {
      row.shared = { ...row.shared, [field]: value };
    } else if (section === "source" || section === "target") {
      if (row[section]) {
        row[section] = { ...row[section], [field]: value };
      }
    } else {
      row[section] = { ...row[section], [field]: value };
    }

    updated[index] = row;
    onUpdate(updated);
  };

  const handleFieldSelect = (index, side, field) => {
    const updated = [...mappings];
    const row = { ...updated[index] };
    if (field === null) {
      row[side] = null;
    } else {
      row[side] = {
        ...field,
        type: field.data_type,
        required_by_system: field.required || false,
        required_in_integration: false,
        priority_level: "",
      };
    }
    
    // If this field selection completes the mapping, keep it visible for 2 seconds
    // even in hide mapped mode to provide visual feedback
    const otherSide = side === 'source' ? 'target' : 'source';
    if (field !== null && row[otherSide] && row.id && hideMapped) {
      // Clear any existing timer for this row
      if (completionTimersRef.current.has(row.id)) {
        clearTimeout(completionTimersRef.current.get(row.id));
      }
      
      // Add to visible set
      setRecentlyCompletedIds(prev => new Set([...prev, row.id]));
      
      // Set timer to remove from visible set after 2 seconds
      const timerId = setTimeout(() => {
        setRecentlyCompletedIds(prev => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
        completionTimersRef.current.delete(row.id);
      }, 2000);
      
      completionTimersRef.current.set(row.id, timerId);
    }
    
    updated[index] = row;
    onUpdate(updated);
  };

  const validateRow = (row) => {
    const issues = [];
    if (!row.source) issues.push("Missing source");
    if (!row.target) issues.push("Missing target");

    if (row.source && row.target) {
      if (row.source.type && row.target.type && row.source.type !== row.target.type) {
        issues.push("Type mismatch");
      }
      if (row.source.required && !row.target.required) {
        issues.push("Required → optional");
      }
      if (!row.source.required && row.target.required) {
        issues.push("Optional → required");
      }
    }

    return issues;
  };

  const sortableIds = displayMappings.map((row) => row.id);

  return (
    <div className="panel mapping-panel">
      <div className="panel-body">
        <div ref={setTableRef} className={isTableOver ? 'table-drag-over' : ''}>
          <table className="mapping-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}></th>
                {showAllFlows && <th style={{ width: '8%' }}>Flow</th>}
                <th style={{ width: showAllFlows ? '17%' : '18%' }}>Source Field</th>
                <th style={{ width: '4%' }} title="Required by System">Req Sys</th>
                <th style={{ width: '4%' }} title="Required in Integration">Req Int</th>
                <th style={{ width: '4%' }}>Pri</th>
                <th style={{ width: '10%' }}>Transform</th>
                <th style={{ width: showAllFlows ? '17%' : '18%' }}>Target Field</th>
                <th style={{ width: '4%' }} title="Required by System">Req Sys</th>
                <th style={{ width: '4%' }} title="Required in Integration">Req Int</th>
                <th style={{ width: '4%' }}>Pri</th>
                <th style={{ width: '12%' }}>Human Name</th>
                <th style={{ width: '12%' }}>Notes</th>
                <th style={{ width: '6%' }}>Status</th>
                <th style={{ width: '30px' }}></th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {displayMappings.map((row, idx) => (
                  <SortableMappingRow
                    key={row.id}
                    row={row}
                    showFlowName={showAllFlows}
                    idx={idx}
                    handleChange={handleChange}
                    onRemove={onRemove}
                    validateRow={validateRow}
                    sourceSystem={sourceSystem}
                    targetSystem={targetSystem}
                    availableFields={availableFields}
                    onFieldSelect={handleFieldSelect}
                    onCreateCustomField={onCreateCustomField}
                  />
                ))}
              </SortableContext>
              {/* Auto-add empty row for new mappings */}
              <tr className="new-mapping-row">
                <td className="drag-handle"></td>
                {showAllFlows && <td></td>}
                <td className="drop-zone-cell">
                  <RowDropZone
                    rowId="new-source"
                    side="source"
                    field={null}
                    onFieldSelect={() => {}}
                    systemName={sourceSystem}
                    availableFields={availableFields}
                    onCreateCustomField={onCreateCustomField}
                  />
                </td>
                <td className="metadata-cell">
                  <input type="checkbox" disabled />
                </td>
                <td className="metadata-cell">
                  <input type="checkbox" disabled />
                </td>
                <td className="metadata-cell">
                  <select disabled className="priority-select">
                    <option value="">-</option>
                  </select>
                </td>
                <td>
                  <select disabled className="shared-select">
                    <option value="">(none)</option>
                  </select>
                </td>
                <td className="drop-zone-cell">
                  <RowDropZone
                    rowId="new-target"
                    side="target"
                    field={null}
                    onFieldSelect={() => {}}
                    systemName={targetSystem}
                    availableFields={availableFields}
                    onCreateCustomField={onCreateCustomField}
                  />
                </td>
                <td className="metadata-cell">
                  <input type="checkbox" disabled />
                </td>
                <td className="metadata-cell">
                  <input type="checkbox" disabled />
                </td>
                <td className="metadata-cell">
                  <select disabled className="priority-select">
                    <option value="">-</option>
                  </select>
                </td>
                <td>
                  <input type="text" disabled placeholder="Common name" className="shared-input" />
                </td>
                <td>
                  <input type="text" disabled placeholder="Notes" className="shared-input" />
                </td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
