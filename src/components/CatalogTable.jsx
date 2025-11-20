import React, { useState, useMemo } from "react";

function getSystemColor(system) {
  const sys = system?.toLowerCase() || '';
  if (sys.includes('centric')) return 'var(--centric)';
  if (sys.includes('fulfil')) return 'var(--fulfil)';
  if (sys.includes('salsify')) return 'var(--salsify)';
  return 'var(--text-muted)';
}

export default function CatalogTable({ catalog, catalogMeta, onUpdateField, onDeleteField }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [objectFilter, setObjectFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("system");
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editBuffer, setEditBuffer] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    const uniqueSystems = new Set(catalog.map(f => f.system));
    const uniqueObjects = new Set(catalog.map(f => `${f.system}.${f.object}`));
    
    // Find duplicates (base IDs without _1, _2 suffixes)
    const baseIds = catalog.map(f => f.id.replace(/_\d+$/, ''));
    const duplicateCount = baseIds.length - new Set(baseIds).size;
    
    // Count edited fields
    const editedCount = catalog.filter(f => f.edited_at || f.source === 'manual').length;
    
    return {
      total: catalog.length,
      systems: uniqueSystems.size,
      objects: uniqueObjects.size,
      duplicates: duplicateCount,
      edited: editedCount
    };
  }, [catalog]);

  // Get unique systems and objects for filters
  const uniqueSystems = useMemo(() => 
    [...new Set(catalog.map(f => f.system))].sort(),
    [catalog]
  );

  const uniqueObjects = useMemo(() => 
    systemFilter
      ? [...new Set(catalog.filter(f => f.system === systemFilter).map(f => f.object))].sort()
      : [...new Set(catalog.map(f => f.object))].sort(),
    [catalog, systemFilter]
  );

  // Filter and sort catalog
  const filteredCatalog = useMemo(() => {
    let filtered = catalog;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.field.toLowerCase().includes(term) ||
        f.system.toLowerCase().includes(term) ||
        f.object.toLowerCase().includes(term) ||
        f.data_type?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term)
      );
    }

    // System filter
    if (systemFilter) {
      filtered = filtered.filter(f => f.system === systemFilter);
    }

    // Object filter
    if (objectFilter) {
      filtered = filtered.filter(f => f.object === objectFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortColumn] || "";
      let bVal = b[sortColumn] || "";
      
      if (sortColumn === "required") {
        aVal = a.required ? 1 : 0;
        bVal = b.required ? 1 : 0;
      }
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [catalog, searchTerm, systemFilter, objectFilter, sortColumn, sortDirection]);

  // Check if field is a duplicate (has _1, _2 suffix)
  const isDuplicate = (id) => /_\d+$/.test(id);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSystemFilter("");
    setObjectFilter("");
  };

  const startEdit = (field) => {
    setEditingFieldId(field.id);
    setEditBuffer({ ...field });
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
    setEditBuffer(null);
  };

  const saveEdit = () => {
    if (!editBuffer) return;
    
    // Validate
    if (!editBuffer.field?.trim()) {
      alert('Field name cannot be empty');
      return;
    }
    
    // Build updates object (only changed fields)
    const original = catalog.find(f => f.id === editingFieldId);
    const updates = {};
    
    if (editBuffer.field !== original.field) updates.field = editBuffer.field;
    if (editBuffer.data_type !== original.data_type) updates.data_type = editBuffer.data_type;
    if (editBuffer.required !== original.required) updates.required = editBuffer.required;
    if (editBuffer.key_type !== original.key_type) updates.key_type = editBuffer.key_type;
    if (editBuffer.description !== original.description) updates.description = editBuffer.description;
    
    if (Object.keys(updates).length > 0) {
      onUpdateField(editingFieldId, updates);
    }
    
    setEditingFieldId(null);
    setEditBuffer(null);
  };

  const handleDelete = (fieldId) => {
    const field = catalog.find(f => f.id === fieldId);
    const confirmed = window.confirm(
      `Delete field "${field.field}" from ${field.system}.${field.object}?`
    );
    if (confirmed) {
      onDeleteField(fieldId);
    }
  };

  if (!catalog || catalog.length === 0) {
    return (
      <div className="catalog-empty-state">
        <p>No catalog loaded</p>
        <p className="catalog-empty-hint">Upload a CSV file from the DATA → IMPORTS section</p>
      </div>
    );
  }

  return (
    <div className="catalog-table-container">
      {/* Stats Header */}
      <div className="catalog-stats">
        <div className="catalog-stat">
          <span className="catalog-stat-value">{stats.total}</span>
          <span className="catalog-stat-label">Fields</span>
        </div>
        <div className="catalog-stat">
          <span className="catalog-stat-value">{stats.systems}</span>
          <span className="catalog-stat-label">Systems</span>
        </div>
        <div className="catalog-stat">
          <span className="catalog-stat-value">{stats.objects}</span>
          <span className="catalog-stat-label">Objects</span>
        </div>
        {stats.edited > 0 && (
          <div className="catalog-stat catalog-stat-info">
            <span className="catalog-stat-value">{stats.edited}</span>
            <span className="catalog-stat-label">Edited</span>
          </div>
        )}
        {stats.duplicates > 0 && (
          <div className="catalog-stat catalog-stat-warning">
            <span className="catalog-stat-value">{stats.duplicates}</span>
            <span className="catalog-stat-label">Duplicates Fixed</span>
          </div>
        )}
        {catalogMeta && (
          <div className="catalog-meta">
            <span className="catalog-meta-file">{catalogMeta.filename}</span>
            <span className="catalog-meta-date">
              Uploaded {new Date(catalogMeta.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="catalog-filters">
        <input
          type="text"
          className="catalog-search"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="catalog-filter-select"
          value={systemFilter}
          onChange={(e) => {
            setSystemFilter(e.target.value);
            setObjectFilter(""); // Reset object filter when system changes
          }}
        >
          <option value="">All Systems</option>
          {uniqueSystems.map(system => (
            <option key={system} value={system}>{system}</option>
          ))}
        </select>
        <select
          className="catalog-filter-select"
          value={objectFilter}
          onChange={(e) => setObjectFilter(e.target.value)}
        >
          <option value="">All Objects</option>
          {uniqueObjects.map(obj => (
            <option key={obj} value={obj}>{obj}</option>
          ))}
        </select>
        {(searchTerm || systemFilter || objectFilter) && (
          <button
            type="button"
            className="catalog-clear-filters"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
        <div className="catalog-result-count">
          {filteredCatalog.length !== catalog.length && (
            <span>{filteredCatalog.length} of {catalog.length} fields</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="catalog-table-scroll">
        <table className="catalog-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("system")} className="sortable">
                System {sortColumn === "system" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("object")} className="sortable">
                Object {sortColumn === "object" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("field")} className="sortable">
                Field {sortColumn === "field" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("data_type")} className="sortable">
                Type {sortColumn === "data_type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("required")} className="sortable">
                Required {sortColumn === "required" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("key_type")} className="sortable">
                Key Type {sortColumn === "key_type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>Description</th>
              <th className="catalog-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalog.map((field, idx) => {
              const isEditing = editingFieldId === field.id;
              const isEdited = field.edited_at || field.source === 'manual';
              
              return (
                <tr 
                  key={field.id} 
                  className={`${isDuplicate(field.id) ? "catalog-row-duplicate" : ""} ${isEditing ? "catalog-row-editing" : ""}`}
                >
                  <td>
                    <span style={{ color: getSystemColor(field.system) }}>
                      {field.system}
                    </span>
                  </td>
                  <td>{field.object}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="catalog-edit-input"
                        value={editBuffer.field}
                        onChange={(e) => setEditBuffer({ ...editBuffer, field: e.target.value })}
                      />
                    ) : (
                      <span className="catalog-field-name">
                        {field.field}
                        {field.is_custom && <span className="custom-badge-inline">C</span>}
                        {isEdited && !field.is_custom && (
                          <span className="edited-badge-inline" title={`Edited ${new Date(field.edited_at).toLocaleString()}`}>
                            ✎
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="catalog-edit-input"
                        value={editBuffer.data_type || ''}
                        onChange={(e) => setEditBuffer({ ...editBuffer, data_type: e.target.value })}
                      />
                    ) : (
                      field.data_type
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editBuffer.required || false}
                        onChange={(e) => setEditBuffer({ ...editBuffer, required: e.target.checked })}
                      />
                    ) : (
                      field.required ? "✓" : ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="catalog-edit-input"
                        value={editBuffer.key_type || ''}
                        onChange={(e) => setEditBuffer({ ...editBuffer, key_type: e.target.value })}
                      />
                    ) : (
                      field.key_type
                    )}
                  </td>
                  <td className="catalog-description">
                    {isEditing ? (
                      <input
                        type="text"
                        className="catalog-edit-input"
                        value={editBuffer.description || ''}
                        onChange={(e) => setEditBuffer({ ...editBuffer, description: e.target.value })}
                      />
                    ) : (
                      field.description
                    )}
                  </td>
                  <td className="catalog-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="icon-button catalog-save-btn"
                          onClick={saveEdit}
                          title="Save changes"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="icon-button catalog-cancel-btn"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => startEdit(field)}
                          title="Edit field"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="icon-button catalog-delete-btn"
                          onClick={() => handleDelete(field.id)}
                          title="Delete field"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
