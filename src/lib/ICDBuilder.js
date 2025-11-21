import Papa from "papaparse";

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMappingsCsv(mappings) {
  const data = mappings.map((m) => ({
    flow_id: m.flow_id || "",
    source_system: m.source?.system || "",
    source_object: m.source?.object || "",
    source_field: m.source?.field || "",
    source_type: m.source?.type || "",
    source_key_type: m.source?.key_type || "",
    source_required_by_system: m.source?.required_by_system ? "Yes" : "No",
    source_required_in_integration: m.source?.required_in_integration ? "Yes" : "No",
    source_priority_level: m.source?.priority_level || "",
    target_system: m.target?.system || "",
    target_object: m.target?.object || "",
    target_field: m.target?.field || "",
    target_type: m.target?.type || "",
    target_key_type: m.target?.key_type || "",
    target_required_by_system: m.target?.required_by_system ? "Yes" : "No",
    target_required_in_integration: m.target?.required_in_integration ? "Yes" : "No",
    target_priority_level: m.target?.priority_level || "",
    human_name: m.shared?.human_name || "",
    transform_rule: m.shared?.transform_rule || "",
    notes: m.shared?.notes || "",
    status: m.shared?.status || "",
  }));
  const csv = Papa.unparse(data);
  downloadFile(csv, "icd_mappings_export.csv", "text/csv;charset=utf-8;");
}

export function exportDataContractJson(mappings, flowId) {
  const contract = {
    flow_id: flowId,
    version: "1.0",
    timestamp: new Date().toISOString(),
    mappings: mappings.map((m) => ({
      source: {
        system: m.source?.system || "",
        object: m.source?.object || "",
        field: m.source?.field || "",
        type: m.source?.type || "",
        required: m.source?.required || false,
        key_type: m.source?.key_type || "",
        required_by_system: m.source?.required_by_system || false,
        required_in_integration: m.source?.required_in_integration || false,
        priority_level: m.source?.priority_level || "",
      },
      target: {
        system: m.target?.system || "",
        object: m.target?.object || "",
        field: m.target?.field || "",
        type: m.target?.type || "",
        required: m.target?.required || false,
        key_type: m.target?.key_type || "",
        required_by_system: m.target?.required_by_system || false,
        required_in_integration: m.target?.required_in_integration || false,
        priority_level: m.target?.priority_level || "",
      },
      human_name: m.shared?.human_name || "",
      transform: m.shared?.transform_rule || "",
      notes: m.shared?.notes || "",
      status: m.shared?.status || "",
    })),
  };
  const json = JSON.stringify(contract, null, 2);
  downloadFile(json, `data_contract_${flowId}.json`, "application/json;charset=utf-8;");
}

export function exportBooEngineProfile(mappings, flowId) {
  const profile = {
    profile_id: flowId,
    profile_name: `BOO Integration - ${flowId}`,
    version: "1.0",
    created_at: new Date().toISOString(),
    field_mappings: mappings.map((m, idx) => ({
      mapping_id: `${flowId}_${idx + 1}`,
      source_path: m.source ? `${m.source.system}.${m.source.object}.${m.source.field}` : "",
      target_path: m.target ? `${m.target.system}.${m.target.object}.${m.target.field}` : "",
      human_name: m.shared?.human_name || "",
      transform_function: m.shared?.transform_rule || "",
      validation_rules: {
        type_check: m.source?.type === m.target?.type,
        required_check: m.source?.required && m.target?.required,
      },
      requirements: {
        source: {
          required_by_system: m.source?.required_by_system || false,
          required_in_integration: m.source?.required_in_integration || false,
          priority_level: m.source?.priority_level || "",
        },
        target: {
          required_by_system: m.target?.required_by_system || false,
          required_in_integration: m.target?.required_in_integration || false,
          priority_level: m.target?.priority_level || "",
        },
      },
      metadata: {
        source_type: m.source?.type || "",
        target_type: m.target?.type || "",
        notes: m.shared?.notes || "",
        status: m.shared?.status || "",
      },
    })),
  };
  const json = JSON.stringify(profile, null, 2);
  downloadFile(json, `boo_engine_profile_${flowId}.json`, "application/json;charset=utf-8;");
}

export function exportWorkspace(state) {
  const workspace = {
    version: "2.0",
    exported_at: new Date().toISOString(),
    packages: state.packages || [],
    sequences: state.sequences || [],
    flows: state.flows || [],
    maps: state.maps || [],
    fieldsCatalog: state.fieldsCatalog || [],
    catalogMeta: state.catalogMeta || null,
    activeFlowId: state.activeFlowId || null,
    activeSequenceId: state.activeSequenceId || null,
    activeMapId: state.activeMapId || null,
    theme: state.theme || 'dark',
  };
  const json = JSON.stringify(workspace, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile(json, `bool_workspace_${timestamp}.json`, "application/json;charset=utf-8;");
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Remove potential XSS vectors
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function importWorkspaceFile(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const workspace = JSON.parse(e.target.result);
      
      // Validate required fields
      if (!workspace.version || !workspace.exported_at) {
        throw new Error('Invalid workspace file format - missing version or timestamp');
      }
      
      // Version compatibility check
      if (workspace.version !== '1.0' && workspace.version !== '2.0') {
        throw new Error(`Unsupported workspace version: ${workspace.version}. Expected 1.0 or 2.0`);
      }
      
      // Validate structure
      if (workspace.packages && !Array.isArray(workspace.packages)) {
        throw new Error('Invalid workspace: packages must be an array');
      }
      if (workspace.flows && !Array.isArray(workspace.flows)) {
        throw new Error('Invalid workspace: flows must be an array');
      }
      if (workspace.fieldsCatalog && !Array.isArray(workspace.fieldsCatalog)) {
        throw new Error('Invalid workspace: fieldsCatalog must be an array');
      }
      
      // Sanitize all string fields to prevent XSS
      const sanitized = sanitizeObject(workspace);
      
      onSuccess(sanitized);
    } catch (err) {
      onError(err.message || 'Failed to parse workspace file');
    }
  };
  reader.onerror = () => onError('Failed to read file');
  reader.readAsText(file);
}
