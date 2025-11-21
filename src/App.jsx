import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AppLayout } from "./components/layout/AppLayout";
import { BottomPanel } from "./components/layout/BottomPanel";
import FieldBrowser from "./components/FieldBrowser";
import MappingTable from "./components/MappingTable";
import CatalogTable from "./components/CatalogTable";
import { ImportStrategyModal } from "./components/ImportStrategyModal";
import { parseCsvFile } from "./lib/csv";
import { exportMappingsCsv, exportDataContractJson, exportBooEngineProfile, exportWorkspace, importWorkspaceFile } from "./lib/ICDBuilder";
import { IconButton } from "./components/primitives";
import { BlankCanvas } from './components/workspace/BlankCanvas';
import { Waypoints, Pyramid, Zap } from 'lucide-react';

// CSS imports - Theme system first, then app.css (legacy), then component styles
import "./styles/theme.css";
import "./styles/base.css";
import "./styles/app.css"; // Legacy styles (being migrated)
import "./styles/components/button.css";
import "./styles/components/checkbox.css";
import "./styles/components/sidebar.css";
import "./styles/components/field-browser.css";
import "./styles/components/mappings.css";
import "./styles/components/catalog.css";
import "./styles/components/modal.css";
import "./styles/components/layout.css";
import "./styles/components/bottom-panel.css";
import "./styles/components/app-header.css";
import "./styles/components/blank-canvas.css";

function getSystemColor(system) {
  const sys = system.toLowerCase();
  if (sys.includes('centric')) return 'var(--centric)';
  if (sys.includes('fulfil')) return 'var(--fulfil)';
  if (sys.includes('salsify')) return 'var(--salsify)';
  return 'var(--text-muted)';
}

function normalizeField(row, index = 0, options = {}) {
  const system = row.system || row.System || row.system_name || "";
  const object = row.object || row.Object || row.business_object || "";
  const field = row.field || row.Field || row.field_name || "";
  const data_type = row.data_type || row.type || row.Type || row.dataType || "";
  const requiredRaw = row.required || row.Required || "";
  const key_type = row.key_type || row.KeyType || row.key || "";

  const required =
    typeof requiredRaw === "string"
      ? ["y", "yes", "true", "1"].includes(requiredRaw.toLowerCase())
      : !!requiredRaw;

  const baseId = `${system}.${object}.${field}`;
  const now = new Date().toISOString();

  return {
    id: baseId,
    system,
    object,
    field,
    data_type,
    required,
    key_type,
    description: row.description || row.Description || "",
    is_custom: row.is_custom || false,
    source: row.source || options.source || 'import',
    imported_at: row.imported_at || (options.source === 'import' ? now : null),
    edited_at: row.edited_at || null,
    originId: row.originId || baseId,
    version: row.version || 1,
    _row_index: index,
  };
}

function createCustomField({ system, object, field, data_type }) {
  const timestamp = Date.now();
  const baseId = `${system}.${object}.${field}`;
  const now = new Date().toISOString();
  return {
    id: `custom_${timestamp}_${baseId}`,
    system,
    object,
    field,
    data_type: data_type || "string",
    required: false,
    key_type: "",
    description: "",
    is_custom: true,
    source: 'manual',
    imported_at: null,
    edited_at: now,
    originId: baseId,
    version: 1,
    created_at: now,
  };
}

const STORAGE_KEY = "bool_state_v1";

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      
      // Fix duplicate IDs in existing catalog data and add missing metadata
      if (state.fieldsCatalog && Array.isArray(state.fieldsCatalog)) {
        const catalog = state.fieldsCatalog;
        const seenIds = new Map();
        state.fieldsCatalog = catalog.map(field => {
          const baseId = field.id;
          let updatedField = { ...field };
          
          // Add missing metadata fields for legacy data
          if (!field.source) updatedField.source = field.is_custom ? 'manual' : 'import';
          if (!field.imported_at && updatedField.source === 'import') updatedField.imported_at = field.created_at || null;
          if (!field.edited_at && field.created_at) updatedField.edited_at = field.created_at;
          if (!field.originId) {
            // For custom fields: extract base ID from custom_<timestamp>_<baseId> format
            if (field.is_custom && baseId.startsWith('custom_')) {
              const match = baseId.match(/^custom_\d+_(.+)$/);
              updatedField.originId = match ? match[1] : `${field.system}.${field.object}.${field.field}`;
            } else {
              // For regular fields: remove numeric suffix if present
              updatedField.originId = baseId.replace(/_\d+$/, '');
            }
          }
          if (!field.version) updatedField.version = 1;
          
          // Fix duplicate IDs
          if (seenIds.has(baseId)) {
            const count = seenIds.get(baseId);
            seenIds.set(baseId, count + 1);
            return { ...updatedField, id: `${baseId}_${count}` };
          } else {
            seenIds.set(baseId, 1);
            return updatedField;
          }
        });
      }
      
      // Enhance catalogMeta with missing fields
      if (state.catalogMeta && !state.catalogMeta.version) {
        state.catalogMeta = {
          ...state.catalogMeta,
          version: 1,
          importStrategy: 'replace'
        };
      }
      
      return state;
    }
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
  }
  return null;
}

function saveState(state) {
  try {
    const serialized = JSON.stringify(state);
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
    
    if (sizeInMB > 4) {
      console.warn(`State size (${sizeInMB.toFixed(2)}MB) exceeds safe limit. Skipping save.`);
      return { success: false, error: 'quota', size: sizeInMB };
    }
    
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, size: sizeInMB };
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
    return { success: false, error: err.name === 'QuotaExceededError' ? 'quota' : 'unknown', message: err.message };
  }
}

export default function App() {
  const [fieldsCatalog, setFieldsCatalog] = useState(() => {
    const saved = loadState();
    return saved?.fieldsCatalog || [];
  });
  const [catalogMeta, setCatalogMeta] = useState(() => {
    const saved = loadState();
    return saved?.catalogMeta || null;
  });
  const [storageError, setStorageError] = useState(null);
  const [customFields, setCustomFields] = useState({});
  const [packages, setPackages] = useState(() => {
    const saved = loadState();
    return saved?.packages || [{ id: "pkg_01", name: "Package 01", collapsed: false }];
  });
  const [flows, setFlows] = useState(() => {
    const saved = loadState();
    let flowsData = saved?.flows || [{ 
      id: "flow_01", 
      name: "Flow 01", 
      package_id: "pkg_01",
      source_system: "",
      target_system: "",
      mappings: [] 
    }];
    
    const seenFlowIds = new Map();
    flowsData = flowsData.map((flow, index) => {
      const baseId = flow.id;
      
      if (seenFlowIds.has(baseId)) {
        const existingFlowNumbers = flowsData
          .map(f => parseInt(f.id.replace('flow_', ''), 10))
          .filter(n => !isNaN(n));
        const newFlowNum = existingFlowNumbers.length > 0 ? Math.max(...existingFlowNumbers) + 1 + index : index + 1;
        const newId = `flow_${String(newFlowNum).padStart(2, '0')}`;
        console.warn(`Duplicate flow ID detected: ${baseId}. Reassigning to ${newId}`);
        seenFlowIds.set(newId, true);
        return { 
          ...flow, 
          id: newId,
          mappings: flow.mappings?.map(m => ({ ...m, flow_id: newId })) || []
        };
      } else {
        seenFlowIds.set(baseId, true);
        return flow;
      }
    });
    
    return flowsData;
  });
  const [activeFlowId, setActiveFlowId] = useState(() => {
    const saved = loadState();
    return saved?.activeFlowId || "flow_01";
  });

  const [showAllFlows, setShowAllFlows] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState(null);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [sourceObject, setSourceObject] = useState("");
  const [targetObject, setTargetObject] = useState("");
  const [sidebarSections, setSidebarSections] = useState({
    packages: false,
    flows: false,
    data: false
  });
  const [bottomPanel, setBottomPanel] = useState(() => {
    const saved = localStorage.getItem('bool_bottom_panel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we have valid browser types
        if (Array.isArray(parsed.activeBrowsers) && parsed.activeBrowsers.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved bottom panel state');
      }
    }
    // Default: SOURCE browser active
    return { activeBrowsers: ['source'] };
  });
  const [customFieldForm, setCustomFieldForm] = useState({
    system: "",
    object: "",
    field: "",
    data_type: "string"
  });
  const [dataSubsections, setDataSubsections] = useState({
    imports: false,
    exports: false,
    issues: false
  });
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('bool_theme');
    return savedTheme || 'dark';
  });
  
  const [activeView, setActiveView] = useState('mappings'); // 'mappings' or 'catalog'
  const [headerActiveView, setHeaderActiveView] = useState('mapper'); // 'mapper' | 'flows' | 'fields' | 'data'
  
  // ============================================================
  // MODULE NAVIGATION STATE
  // ============================================================
  const [activeModule, setActiveModule] = useState(() => {
    const saved = localStorage.getItem('bool_active_module');
    return saved || null; // null = blank canvas on first load
  });

  // Persist active module to localStorage
  useEffect(() => {
    if (activeModule) {
      localStorage.setItem('bool_active_module', activeModule);
    } else {
      localStorage.removeItem('bool_active_module');
    }
  }, [activeModule]);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingCatalogData, setPendingCatalogData] = useState(null);
  const [conflictCount, setConflictCount] = useState(0);
  
  const fileInputRef = useRef(null);
  const workspaceInputRef = useRef(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bool_theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('bool_bottom_panel', JSON.stringify(bottomPanel));
  }, [bottomPanel]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const activeFlow = flows.find(f => f.id === activeFlowId);

  useEffect(() => {
    const result = saveState({
      packages,
      flows,
      activeFlowId,
      fieldsCatalog,
      catalogMeta
    });
    
    if (result && !result.success) {
      if (result.error === 'quota') {
        setStorageError(`Storage full (${result.size?.toFixed(2)}MB). Unable to save changes.`);
      } else {
        setStorageError('Unable to save changes to browser storage.');
      }
    } else {
      setStorageError(null);
    }
  }, [packages, flows, activeFlowId, fieldsCatalog, catalogMeta]);

  useEffect(() => {
    setSourceObject("");
    setTargetObject("");
  }, [activeFlowId, activeFlow?.source_system, activeFlow?.target_system]);
  const allFields = [...fieldsCatalog, ...(customFields[activeFlowId] || [])];
  
  const usedSourceFieldIds = new Set(
    activeFlow?.mappings.filter(m => m.source).map(m => m.source.id) || []
  );
  const usedTargetFieldIds = new Set(
    activeFlow?.mappings.filter(m => m.target).map(m => m.target.id) || []
  );

  const handleCatalogUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await parseCsvFile(file);
    const normalized = result.data
      .map((row, index) => normalizeField(row, index, { source: 'import' }))
      .filter((f) => f.system && f.object && f.field);
    
    const seenIds = new Map();
    const uniqueNormalized = normalized.map((field) => {
      const baseId = field.id;
      if (seenIds.has(baseId)) {
        const count = seenIds.get(baseId);
        seenIds.set(baseId, count + 1);
        return { ...field, id: `${baseId}_${count}` };
      } else {
        seenIds.set(baseId, 1);
        return field;
      }
    });
    
    // Calculate conflicts with existing catalog
    const conflicts = fieldsCatalog.length > 0 
      ? uniqueNormalized.filter(newField => 
          fieldsCatalog.some(existing => existing.originId === newField.originId)
        ).length
      : 0;
    
    // Store pending data and show modal
    setPendingCatalogData({
      file,
      normalizedFields: uniqueNormalized
    });
    setConflictCount(conflicts);
    setImportModalOpen(true);
    
    // Reset file input
    e.target.value = '';
  };

  const handleConfirmCatalogImport = (strategy) => {
    if (!pendingCatalogData) return;
    
    const { file, normalizedFields } = pendingCatalogData;
    const now = new Date().toISOString();
    let finalCatalog = [];
    
    if (strategy === 'replace') {
      // Replace: Reconcile by originId to preserve stable IDs where possible
      const existingMap = new Map(fieldsCatalog.map(f => [f.originId, f]));
      
      normalizedFields.forEach(newField => {
        const existing = existingMap.get(newField.originId);
        if (existing && !existing.is_custom) {
          // Preserve ID for existing imported fields
          finalCatalog.push({
            ...newField,
            id: existing.id,
            version: existing.version + 1,
            edited_at: now
          });
        } else {
          // New field or was custom (don't preserve custom in replace)
          finalCatalog.push(newField);
        }
      });
      
      setFieldsCatalog(finalCatalog);
      
      // Build originId map for mapping updates
      const newCatalogMap = new Map(finalCatalog.map(f => [f.originId, f]));
      
      // Update mappings to reference new catalog entries
      setFlows(prevFlows => prevFlows.map(flow => ({
        ...flow,
        mappings: flow.mappings.map(mapping => {
          const sourceOriginId = mapping.source?.originId || mapping.source?.id.replace(/_\d+$/, '');
          const targetOriginId = mapping.target?.originId || mapping.target?.id.replace(/_\d+$/, '');
          
          const newSource = sourceOriginId ? newCatalogMap.get(sourceOriginId) : null;
          const newTarget = targetOriginId ? newCatalogMap.get(targetOriginId) : null;
          
          return {
            ...mapping,
            source: newSource || null,
            target: newTarget || null
          };
        }).filter(m => m.source || m.target) // Remove completely empty mappings
      })));
      
    } else if (strategy === 'merge') {
      // Merge: Update conflicts, add new fields, preserve existing
      const existingMap = new Map(fieldsCatalog.map(f => [f.originId, f]));
      const mergedFields = [];
      
      normalizedFields.forEach(newField => {
        const existing = existingMap.get(newField.originId);
        if (existing) {
          // Update existing field with imported data, preserve ID and is_custom
          mergedFields.push({
            ...newField,
            id: existing.id,
            is_custom: existing.is_custom,
            version: existing.version + 1,
            edited_at: now,
            source: 'import' // Reset source since it's from import
          });
          existingMap.delete(newField.originId);
        } else {
          // Add new field
          mergedFields.push(newField);
        }
      });
      
      // Add remaining fields that weren't in the import (including custom fields)
      existingMap.forEach(field => mergedFields.push(field));
      
      finalCatalog = mergedFields;
      setFieldsCatalog(mergedFields);
      
      // Build originId map for mapping updates
      const newCatalogMap = new Map(finalCatalog.map(f => [f.originId, f]));
      
      // Update mappings to reference current catalog entries
      setFlows(prevFlows => prevFlows.map(flow => ({
        ...flow,
        mappings: flow.mappings.map(mapping => {
          const sourceOriginId = mapping.source?.originId || mapping.source?.id.replace(/_\d+$/, '').replace(/^custom_\d+_/, '');
          const targetOriginId = mapping.target?.originId || mapping.target?.id.replace(/_\d+$/, '').replace(/^custom_\d+_/, '');
          
          const updatedSource = sourceOriginId && newCatalogMap.has(sourceOriginId) 
            ? newCatalogMap.get(sourceOriginId) 
            : mapping.source;
          const updatedTarget = targetOriginId && newCatalogMap.has(targetOriginId)
            ? newCatalogMap.get(targetOriginId)
            : mapping.target;
          
          return {
            ...mapping,
            source: updatedSource,
            target: updatedTarget
          };
        })
      })));
    }
    
    // Update catalog metadata
    const meta = {
      filename: file.name,
      recordCount: normalizedFields.length,
      uploadedAt: now,
      lastModified: file.lastModified,
      fileSize: file.size,
      importStrategy: strategy,
      version: catalogMeta?.version ? catalogMeta.version + 1 : 1
    };
    setCatalogMeta(meta);
    
    // Clean up modal state and switch to catalog view
    setPendingCatalogData(null);
    setImportModalOpen(false);
    setConflictCount(0);
    setActiveView('catalog');
  };

  const handleUpdateCatalogField = (fieldId, updates) => {
    setFieldsCatalog(prev => {
      const originalField = prev.find(f => f.id === fieldId);
      if (!originalField) return prev;
      
      // Validate required fields
      const updatedField = { ...originalField, ...updates };
      if (!updatedField.field?.trim() || !updatedField.system?.trim() || !updatedField.object?.trim()) {
        console.error('Field name, system, and object are required');
        return prev;
      }
      
      // Calculate new IDs if identifier tuple changed
      let newId = originalField.id;
      let newOriginId = originalField.originId;
      const identifierChanged = updates.field || updates.system || updates.object;
      
      if (identifierChanged) {
        const newBaseId = `${updatedField.system}.${updatedField.object}.${updatedField.field}`;
        
        // Check for duplicate base IDs (ignoring numeric suffixes)
        const existingField = prev.find(f => 
          f.id !== fieldId && 
          (f.originId === newBaseId || f.id === newBaseId)
        );
        
        if (existingField) {
          alert(`A field with identifier ${newBaseId} already exists`);
          return prev;
        }
        
        // Update IDs
        if (originalField.is_custom) {
          // Preserve custom_ prefix with timestamp
          const timestamp = originalField.id.match(/^custom_(\d+)_/)?.[1] || Date.now();
          newId = `custom_${timestamp}_${newBaseId}`;
        } else {
          newId = newBaseId;
        }
        newOriginId = newBaseId;
      }
      
      // Update metadata
      const now = new Date().toISOString();
      const finalField = {
        ...updatedField,
        id: newId,
        originId: newOriginId,
        edited_at: now,
        version: originalField.version + 1
      };
      
      const updated = prev.map(field => field.id === fieldId ? finalField : field);
      
      // Update any mappings that reference this field
      if (identifierChanged) {
        setFlows(prevFlows => prevFlows.map(flow => ({
          ...flow,
          mappings: flow.mappings.map(mapping => ({
            ...mapping,
            source: mapping.source?.id === fieldId ? finalField : mapping.source,
            target: mapping.target?.id === fieldId ? finalField : mapping.target
          }))
        })));
      }
      
      return updated;
    });
  };

  const handleDeleteCatalogField = (fieldId) => {
    // Check if field is used in any mappings
    const isUsedInMappings = flows.some(flow =>
      flow.mappings.some(m => 
        m.source?.id === fieldId || m.target?.id === fieldId
      )
    );
    
    if (isUsedInMappings) {
      const confirmed = window.confirm(
        'This field is used in existing mappings. Deleting it will remove those mappings. Continue?'
      );
      if (!confirmed) return;
      
      // Remove from mappings
      setFlows(prevFlows => prevFlows.map(flow => ({
        ...flow,
        mappings: flow.mappings.filter(m => 
          m.source?.id !== fieldId && m.target?.id !== fieldId
        )
      })));
    }
    
    // Remove from catalog
    setFieldsCatalog(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleExportWorkspace = () => {
    exportWorkspace({
      packages,
      flows,
      fieldsCatalog,
      catalogMeta,
      activeFlowId,
      theme
    });
  };

  // ============================================================
  // MODULE CONTENT RENDERERS
  // ============================================================

  /**
   * Render left sidebar content based on active module
   */
  function renderLeftSidebar() {
    switch (activeModule) {
      case 'packager':
        return renderPackagerSidebar();
      
      case 'explorer':
        return (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>Explorer sidebar</p>
            <p style={{ marginTop: 10, fontSize: '0.75rem' }}>Coming in Phase 2 (Q1 2026)</p>
          </div>
        );
      
      case 'architect':
        return (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>Architect sidebar</p>
            <p style={{ marginTop: 10, fontSize: '0.75rem' }}>Coming in Phase 4 (Q2-Q3 2026)</p>
          </div>
        );
      
      case 'observer':
        return (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>Observer sidebar</p>
            <p style={{ marginTop: 10, fontSize: '0.75rem' }}>Coming in Phase 3 (Q2 2026)</p>
          </div>
        );
      
      default:
        return null; // No sidebar for blank canvas
    }
  }

  /**
   * Render center canvas content based on active module
   */
  function renderWorkspaceContent() {
    switch (activeModule) {
      case 'packager':
        return renderPackagerWorkspace();
      
      case 'explorer':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            padding: 40,
            textAlign: 'center'
          }}>
            <div>
              <Waypoints size={64} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Explorer Module</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                API discovery, schema registry, and connection management
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 10 }}>
                Planned for Phase 2 (Q1 2026)
              </p>
            </div>
          </div>
        );
      
      case 'architect':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            padding: 40,
            textAlign: 'center'
          }}>
            <div>
              <Pyramid size={64} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Architect Module</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Enterprise data model visualization and impact analysis
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 10 }}>
                Planned for Phase 4 (Q2-Q3 2026)
              </p>
            </div>
          </div>
        );
      
      case 'observer':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            padding: 40,
            textAlign: 'center'
          }}>
            <div>
              <Zap size={64} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Observer Module</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Integration health monitoring, SLA tracking, and telemetry
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 10 }}>
                Planned for Phase 3 (Q2 2026)
              </p>
            </div>
          </div>
        );
      
      default:
        return <BlankCanvas onSelectModule={setActiveModule} />;
    }
  }

  /**
   * Packager sidebar content (existing PACKAGES/DATA sections)
   */
  function renderPackagerSidebar() {
    return (
      <div className="flow-sidebar">
        {/* PACKAGES SECTION */}
        <div className="sidebar-section-container">
          <div 
            className="sidebar-section-header"
            onClick={() => setSidebarSections(prev => ({ ...prev, packages: !prev.packages }))}
          >
            <span className="nav-chevron">{sidebarSections.packages ? '▾' : '▸'}</span>
            <span>PACKAGES</span>
          </div>
          {sidebarSections.packages && (
            <div className="sidebar-section-body">
              {packages.map(pkg => (
                <div key={pkg.id} className="package-item">
                  <div className="sidebar-nav-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span className="nav-chevron" onClick={() => togglePackage(pkg.id)}>
                        {pkg.collapsed ? '▸' : '▾'}
                      </span>
                      {editingPackageId === pkg.id ? (
                        <input
                          type="text"
                          className="inline-edit-input"
                          value={pkg.name}
                          onChange={(e) => handlePackageRename(pkg.id, e.target.value)}
                          onBlur={() => setEditingPackageId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingPackageId(null);
                            if (e.key === 'Escape') setEditingPackageId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => setEditingPackageId(pkg.id)}>
                          {pkg.name}
                        </span>
                      )}
                    </div>
                    <div className="flow-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePackage(e, pkg.id);
                        }}
                        title="Delete package"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {!pkg.collapsed && (
                    <div className="package-flows">
                      {flows.filter(f => f.package_id === pkg.id).map(flow => (
                        <div
                          key={flow.id}
                          className={`sidebar-nav-subitem ${flow.id === activeFlowId ? 'active' : ''}`}
                          onClick={() => handleFlowClick(flow.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            {editingFlowId === flow.id ? (
                              <input
                                type="text"
                                className="inline-edit-input"
                                value={flow.name}
                                onChange={(e) => handleFlowRename(flow.id, e.target.value)}
                                onBlur={() => setEditingFlowId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingFlowId(null);
                                  if (e.key === 'Escape') setEditingFlowId(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <span onClick={(e) => {
                                e.stopPropagation();
                                setEditingFlowId(flow.id);
                              }}>
                                {flow.name}
                              </span>
                            )}
                          </div>
                          <div className="flow-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateFlow(flow.id);
                              }}
                              title="Duplicate flow"
                            >
                              ⧉
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFlow(flow.id);
                              }}
                              title="Delete flow"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="sidebar-add-flow-btn"
                        onClick={() => handleAddFlow(pkg.id)}
                      >
                        ⊕ Add Flow
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="sidebar-add-flow-btn"
                onClick={handleAddPackage}
                style={{ marginTop: '8px' }}
              >
                ⊕ Add Package
              </button>
            </div>
          )}
        </div>

        {/* DATA SECTION */}
        <div className="sidebar-section-container">
          <div 
            className="sidebar-section-header"
            onClick={() => setSidebarSections(prev => ({ ...prev, data: !prev.data }))}
          >
            <span className="nav-chevron">{sidebarSections.data ? '▾' : '▸'}</span>
            <span>DATA</span>
          </div>
          {sidebarSections.data && (
            <div className="sidebar-section-body">
              {/* IMPORTS Subsection */}
              <div 
                className="sidebar-nav-item"
                onClick={() => setDataSubsections(prev => ({ ...prev, imports: !prev.imports }))}
              >
                <span className="nav-chevron">{dataSubsections.imports ? '▾' : '▸'}</span>
                <span>IMPORTS</span>
              </div>
              {dataSubsections.imports && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCatalogUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="data-item-icon">↓</span>
                    <span>Load fields catalog</span>
                  </button>
                  <input
                    ref={workspaceInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportWorkspace}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={() => workspaceInputRef.current?.click()}
                  >
                    <span className="data-item-icon">↓</span>
                    <span>Import workspace</span>
                  </button>
                </div>
              )}

              {/* EXPORTS Subsection */}
              <div 
                className="sidebar-nav-item"
                onClick={() => setDataSubsections(prev => ({ ...prev, exports: !prev.exports }))}
              >
                <span className="nav-chevron">{dataSubsections.exports ? '▾' : '▸'}</span>
                <span>EXPORTS</span>
              </div>
              {dataSubsections.exports && (
                <div>
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={() => exportMappingsCsv(activeFlow?.mappings || [])}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>ICD CSV</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={() => exportDataContractJson(activeFlow?.mappings || [], activeFlowId)}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>JSON Contract</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={() => exportBooEngineProfile(activeFlow?.mappings || [], activeFlowId)}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>BOO Profile</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-nav-subitem"
                    onClick={handleExportWorkspace}
                  >
                    <span className="data-item-icon">↑</span>
                    <span>Export workspace</span>
                  </button>
                </div>
              )}

              {/* ISSUES Subsection */}
              <div 
                className="sidebar-nav-item"
                onClick={() => setDataSubsections(prev => ({ ...prev, issues: !prev.issues }))}
              >
                <span className="nav-chevron">{dataSubsections.issues ? '▾' : '▸'}</span>
                <span>ISSUES</span>
              </div>
              {dataSubsections.issues && (
                <div>
                  <div className="placeholder-content">
                    No issues detected
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * Packager workspace content (existing mapping/catalog view)
   */
  function renderPackagerWorkspace() {
    return (
      <>
        {catalogMeta && (
          <div className="catalog-status-banner">
            📁 Catalog loaded: <strong>{catalogMeta.filename}</strong> ({catalogMeta.recordCount} fields)
            <button 
              type="button" 
              className="banner-dismiss"
              onClick={() => setCatalogMeta(null)}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        {storageError && (
          <div className="storage-error-banner">
            ⚠️ {storageError}
            <button 
              type="button" 
              className="banner-dismiss"
              onClick={() => setStorageError(null)}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <div className="view-toggle-container">
          <button
            className={`view-toggle-btn ${activeView === 'mappings' ? 'active' : ''}`}
            onClick={() => setActiveView('mappings')}
          >
            Mappings
          </button>
          <button
            className={`view-toggle-btn ${activeView === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveView('catalog')}
            disabled={!fieldsCatalog || fieldsCatalog.length === 0}
            title={(!fieldsCatalog || fieldsCatalog.length === 0) ? "No catalog loaded" : "View catalog"}
          >
            Catalog
          </button>
        </div>

        {activeView === 'mappings' ? (
          <MappingTable
            mappings={activeFlow?.mappings || []}
            onUpdate={(updated) => updateActiveMappings(updated)}
            onRemove={(idx) =>
              updateActiveMappings(mappings => mappings.filter((_, i) => i !== idx))
            }
            sourceSystem={activeFlow?.source_system || ""}
            targetSystem={activeFlow?.target_system || ""}
            availableFields={allFields}
            onCreateCustomField={handleCreateCustomField}
            packageName={packages.find(p => p.id === activeFlow?.package_id)?.name}
            flowName={activeFlow?.name}
            showAllFlows={showAllFlows}
            onToggleShowAll={() => setShowAllFlows(!showAllFlows)}
            allFlows={flows}
            packages={packages}
          />
        ) : (
          <CatalogTable
            catalog={fieldsCatalog}
            catalogMeta={catalogMeta}
            onUpdateField={handleUpdateCatalogField}
            onDeleteField={handleDeleteCatalogField}
          />
        )}
      </>
    );
  }

  const handleImportWorkspace = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    importWorkspaceFile(
      file,
      (workspace) => {
        // Restore all workspace data
        if (workspace.packages) setPackages(workspace.packages);
        if (workspace.flows) setFlows(workspace.flows);
        if (workspace.fieldsCatalog) setFieldsCatalog(workspace.fieldsCatalog);
        if (workspace.catalogMeta) setCatalogMeta(workspace.catalogMeta);
        if (workspace.activeFlowId) setActiveFlowId(workspace.activeFlowId);
        if (workspace.theme) setTheme(workspace.theme);
        
        alert('Workspace imported successfully!');
        setActiveView('mappings');
      },
      (error) => {
        alert(`Failed to import workspace: ${error}`);
      }
    );
    
    // Reset file input
    e.target.value = '';
  };

  const handleAddFlow = (packageId = null) => {
    const targetPackageId = packageId || packages[0]?.id || "pkg_01";
    setFlows(prev => {
      const existingFlowNumbers = prev
        .map(f => parseInt(f.id.replace('flow_', ''), 10))
        .filter(n => !isNaN(n));
      const flowNum = existingFlowNumbers.length > 0 ? Math.max(...existingFlowNumbers) + 1 : 1;
      const newFlow = {
        id: `flow_${String(flowNum).padStart(2, '0')}`,
        name: `Flow ${String(flowNum).padStart(2, '0')}`,
        package_id: targetPackageId,
        source_system: "",
        target_system: "",
        mappings: []
      };
      setActiveFlowId(newFlow.id);
      return [...prev, newFlow];
    });
  };

  const handleDuplicateFlow = (flowId) => {
    setFlows(prev => {
      const sourceFlow = prev.find(f => f.id === flowId);
      if (!sourceFlow) return prev;
      const existingFlowNumbers = prev
        .map(f => parseInt(f.id.replace('flow_', ''), 10))
        .filter(n => !isNaN(n));
      const flowNum = existingFlowNumbers.length > 0 ? Math.max(...existingFlowNumbers) + 1 : 1;
      const newFlow = {
        id: `flow_${String(flowNum).padStart(2, '0')}`,
        name: `${sourceFlow.name} (Copy)`,
        package_id: sourceFlow.package_id,
        source_system: sourceFlow.source_system,
        target_system: sourceFlow.target_system,
        mappings: sourceFlow.mappings.map(m => ({...m, flow_id: `flow_${String(flowNum).padStart(2, '0')}`}))
      };
      setActiveFlowId(newFlow.id);
      return [...prev, newFlow];
    });
  };

  const handleDeleteFlow = (e, flowId) => {
    e.stopPropagation();
    setFlows(prev => {
      if (prev.length === 1) return prev;
      const updated = prev.filter(f => f.id !== flowId);
      if (activeFlowId === flowId) {
        setActiveFlowId(updated[0].id);
      }
      return updated;
    });
  };

  const handleUpdateFlowName = (flowId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const nameExists = flows.some(f => f.id !== flowId && f.name === trimmedName);
    if (nameExists) {
      alert('A flow with this name already exists. Please choose a unique name.');
      return;
    }
    setFlows(prev => prev.map(f => f.id === flowId ? {...f, name: trimmedName} : f));
  };

  const handleUpdateFlowConfig = (flowId, field, value) => {
    setFlows(prev => prev.map(f => f.id === flowId ? {...f, [field]: value} : f));
  };

  const handleAddPackage = () => {
    setPackages(prev => {
      const pkgNum = prev.length + 1;
      const newPackage = {
        id: `pkg_${String(pkgNum).padStart(2, '0')}`,
        name: `Package ${String(pkgNum).padStart(2, '0')}`,
        collapsed: false
      };
      return [...prev, newPackage];
    });
  };

  const handleUpdatePackageName = (packageId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const nameExists = packages.some(p => p.id !== packageId && p.name === trimmedName);
    if (nameExists) {
      alert('A package with this name already exists. Please choose a unique name.');
      return;
    }
    setPackages(prev => prev.map(p => p.id === packageId ? {...p, name: trimmedName} : p));
  };

  const handleDeletePackage = (e, packageId) => {
    e.stopPropagation();
    const flowsInPackage = flows.filter(f => f.package_id === packageId);
    if (flowsInPackage.length > 0) {
      alert('Cannot delete package with existing flows. Please delete or move all flows first.');
      return;
    }
    setPackages(prev => {
      if (prev.length === 1) {
        alert('Cannot delete the last package.');
        return prev;
      }
      return prev.filter(p => p.id !== packageId);
    });
  };

  const handleTogglePackageCollapse = (packageId) => {
    setPackages(prev => prev.map(p => 
      p.id === packageId ? {...p, collapsed: !p.collapsed} : p
    ));
  };

  const updateActiveMappings = (updater) => {
    setFlows(prev => prev.map(f => 
      f.id === activeFlowId 
        ? {...f, mappings: typeof updater === 'function' ? updater(f.mappings) : updater}
        : f
    ));
  };

  const handleCreateCustomField = ({ system, object, field, data_type }) => {
    const newField = createCustomField({ system, object, field, data_type });
    setFieldsCatalog(prev => [...prev, newField]);
    return newField;
  };

  const handleCreateCustomFieldFromPanel = () => {
    if (!customFieldForm.system) {
      alert('Please select a system before creating custom fields.');
      return;
    }
    
    if (!customFieldForm.object || !customFieldForm.field) return;
    
    const newField = handleCreateCustomField({
      system: customFieldForm.system,
      object: customFieldForm.object,
      field: customFieldForm.field,
      data_type: customFieldForm.data_type
    });
    
    // Reset form
    setCustomFieldForm({
      system: "",
      object: "",
      field: "",
      data_type: "string"
    });
  };

  const handleDeleteCustomField = (fieldId) => {
    if (!confirm('Delete this custom field? This action cannot be undone.')) return;
    
    setFieldsCatalog(prev => prev.filter(f => f.id !== fieldId));
    
    setFlows(prev => prev.map(flow => ({
      ...flow,
      mappings: flow.mappings.map(mapping => ({
        ...mapping,
        source: mapping.source?.id === fieldId ? null : mapping.source,
        target: mapping.target?.id === fieldId ? null : mapping.target
      }))
    })));
  };

  const handleEditCustomField = (field) => {
    setCustomFieldForm({
      system: field.system,
      object: field.object,
      field: field.field,
      data_type: field.data_type,
      editingId: field.id
    });
  };

  const handleSaveEditedCustomField = () => {
    if (!customFieldForm.system) {
      alert('Please select a system before saving custom fields.');
      return;
    }
    
    if (!customFieldForm.object || !customFieldForm.field) return;
    
    setFieldsCatalog(prev => prev.map(f => 
      f.id === customFieldForm.editingId 
        ? {
            ...f,
            system: customFieldForm.system,
            object: customFieldForm.object,
            field: customFieldForm.field,
            data_type: customFieldForm.data_type
          }
        : f
    ));
    
    setFlows(prev => prev.map(flow => ({
      ...flow,
      mappings: flow.mappings.map(mapping => ({
        ...mapping,
        source: mapping.source?.id === customFieldForm.editingId 
          ? {
              ...mapping.source,
              system: customFieldForm.system,
              object: customFieldForm.object,
              field: customFieldForm.field,
              type: customFieldForm.data_type
            }
          : mapping.source,
        target: mapping.target?.id === customFieldForm.editingId
          ? {
              ...mapping.target,
              system: customFieldForm.system,
              object: customFieldForm.object,
              field: customFieldForm.field,
              type: customFieldForm.data_type
            }
          : mapping.target
      }))
    })));
    
    setCustomFieldForm({
      system: "",
      object: "",
      field: "",
      data_type: "string"
    });
  };

  const handleAddFieldToMapping = (field, side, rowId = null) => {
    updateActiveMappings(mappings => {
      const updated = [...mappings];
      
      if (rowId) {
        // Check if this is a drop on the new empty row
        if (rowId === 'new-source' || rowId === 'new-target') {
          // Create a new mapping row
          const newMapping = {
            id: `mapping-${Date.now()}`,
            flow_id: activeFlow?.id,
            source: null,
            target: null,
            shared: {
              human_name: "",
              transform_rule: "",
              notes: ""
            }
          };
          newMapping[side] = {
            id: field.id,
            system: field.system,
            object: field.object,
            field: field.field,
            type: field.data_type,
            required: field.required,
            key_type: field.key_type,
            required_by_system: false,
            required_in_integration: false,
            priority_level: ""
          };
          updated.push(newMapping);
          return updated;
        }
        
        // Otherwise, find existing row
        const idx = updated.findIndex(m => m.id === rowId);
        if (idx !== -1) {
          const row = { ...updated[idx] };
          row[side] = {
            id: field.id,
            system: field.system,
            object: field.object,
            field: field.field,
            type: field.data_type,
            required: field.required,
            key_type: field.key_type,
            required_by_system: false,
            required_in_integration: false,
            priority_level: ""
          };
          updated[idx] = row;
          return updated;
        }
      }
      
      const idx = updated.findIndex((m) =>
        side === "source" ? !m.source : !m.target
      );
      
      const fieldData = {
        id: field.id,
        system: field.system,
        object: field.object,
        field: field.field,
        type: field.data_type,
        required: field.required,
        key_type: field.key_type,
        required_by_system: false,
        required_in_integration: false,
        priority_level: ""
      };
      
      if (idx === -1) {
        const newRow = {
          id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          flow_id: activeFlowId,
          source: side === "source" ? fieldData : null,
          target: side === "target" ? fieldData : null,
          shared: {
            transform_rule: "",
            notes: "",
            status: "",
            human_name: ""
          }
        };
        updated.push(newRow);
      } else {
        const row = { ...updated[idx] };
        row[side] = fieldData;
        updated[idx] = row;
      }
      return updated;
    });
  };

  const handleBulkAddFields = (fields, side) => {
    updateActiveMappings(mappings => {
      const updated = [...mappings];
      
      fields.forEach((field, index) => {
        const fieldData = {
          id: field.id,
          system: field.system,
          object: field.object,
          field: field.field,
          type: field.data_type,
          required: field.required,
          key_type: field.key_type,
          required_by_system: false,
          required_in_integration: false,
          priority_level: ""
        };
        
        const newRow = {
          id: `mapping_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          flow_id: activeFlowId,
          source: side === "source" ? fieldData : null,
          target: side === "target" ? fieldData : null,
          shared: {
            transform_rule: "",
            notes: "",
            status: "",
            human_name: ""
          }
        };
        updated.push(newRow);
      });
      
      return updated;
    });
  };


  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.kind === 'field') {
      setActiveField(active.data.current.field);
    } else if (active.data.current?.kind === 'filled-field') {
      setActiveField(active.data.current.field);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveField(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.kind === 'field') {
      const field = activeData.field;
      const side = activeData.side;

      if (over.id === 'mapping-source-drop') {
        handleAddFieldToMapping(field, 'source');
      } else if (over.id === 'mapping-target-drop') {
        handleAddFieldToMapping(field, 'target');
      } else if (over.id === 'mapping-table-drop') {
        handleAddFieldToMapping(field, side);
      } else if (overData?.kind === 'row-drop-zone') {
        handleAddFieldToMapping(field, overData.side, overData.rowId);
      }
    } else if (activeData?.kind === 'filled-field') {
      const field = activeData.field;
      const sourceRowId = activeData.rowId;
      const sourceSide = activeData.side;

      if (overData?.kind === 'row-drop-zone') {
        const targetRowId = overData.rowId;
        const targetSide = overData.side;

        updateActiveMappings(mappings => {
          const updated = [...mappings];
          const sourceRowIndex = updated.findIndex(r => r.id === sourceRowId);
          
          if (sourceRowIndex === -1) return updated;

          if (sourceRowId === targetRowId && sourceSide === targetSide) {
            return updated;
          }

          updated[sourceRowIndex] = { ...updated[sourceRowIndex], [sourceSide]: null };

          const targetRowIndex = updated.findIndex(r => r.id === targetRowId);
          if (targetRowIndex !== -1) {
            const fieldData = {
              id: field.id,
              system: field.system,
              object: field.object,
              field: field.field,
              type: field.data_type,
              required: field.required,
              key_type: field.key_type,
              required_by_system: field.required_by_system || false,
              required_in_integration: field.required_in_integration || false,
              priority_level: field.priority_level || ""
            };
            updated[targetRowIndex] = { ...updated[targetRowIndex], [targetSide]: fieldData };
          }

          return updated;
        });
      }
    } else if (activeData?.kind === 'mapping-row') {
      const activeIndex = activeData.index;
      const overIndex = over.data.current?.index;
      
      if (overIndex !== undefined && activeIndex !== overIndex) {
        updateActiveMappings(mappings => arrayMove(mappings, activeIndex, overIndex));
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AppLayout
        flowsPanel={renderLeftSidebar()}
        workspacePanel={renderWorkspaceContent()}
        fieldsPanel={null}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        activeView={headerActiveView}
        onViewChange={setHeaderActiveView}
        activeFlow={activeFlow}
        packageName={packages.find(p => p.id === activeFlow?.package_id)?.name}
        theme={theme}
        onToggleTheme={toggleTheme}
        bottomPanel={
          <BottomPanel
            activeBrowsers={bottomPanel.activeBrowsers}
            onBrowserSwitch={(browserType) => {
              setBottomPanel({ activeBrowsers: [browserType] });
            }}
            fields={allFields}
            onAddField={handleAddFieldToMapping}
            onBulkAddFields={handleBulkAddFields}
            sourceSystem={activeFlow?.source_system || ''}
            targetSystem={activeFlow?.target_system || ''}
            usedFieldIds={new Set([
              ...(activeFlow?.mappings || []).filter(m => m.source).map(m => m.source.id),
              ...(activeFlow?.mappings || []).filter(m => m.target).map(m => m.target.id)
            ])}
          />
        }
      />
      <DragOverlay>
        {activeField ? (
          <div className="field-pill dragging" style={{ borderLeft: `3px solid ${getSystemColor(activeField.system)}` }}>
            <span className="field-pill-name">{activeField.field}</span>
            <span className="field-pill-meta">
              {activeField.system} · {activeField.object} · {activeField.data_type} · {activeField.key_type || "n/a"}
            </span>
          </div>
        ) : null}
      </DragOverlay>
      
      <ImportStrategyModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirm={handleConfirmCatalogImport}
        conflictCount={conflictCount}
      />
    </DndContext>
  );
}
