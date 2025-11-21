// Type definitions for Packager module hierarchy

export interface Sequence {
  id: string;
  name: string;              // "Centric → Fulfil" or "Multi-hop Sequence"
  package_id: string;
  trigger: 'event' | 'schedule' | 'manual';
  sla_frequency?: string;
  sla_timeout?: string;
  status: 'active' | 'draft' | 'disabled';
  flows: string[];           // Ordered flow IDs
  metadata?: {
    owner?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface Map {
  id: string;
  name: string;              // "Map 01", "Map 02"
  flow_id: string;
  mappings: MappingRow[];    // Array of mapping rows
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  metadata?: {
    author?: string;
    version?: number;
    notes?: string;
  };
}

export interface MappingRow {
  id: string;
  map_id: string;            // Parent map reference
  source: Field | null;
  target: Field | null;
  shared: {
    human_name: string;
    transform: string;
    notes: string;
  };
}

export interface Field {
  id: string;
  system: string;
  object: string;
  field: string;
  data_type?: string;
  required?: boolean;
  key_type?: string;
  description?: string;
  is_custom?: boolean;
}

export interface Flow {
  id: string;
  name: string;
  sequence_id: string;       // Parent sequence
  package_id: string;
  source: { system: string; object: string; endpoint?: string; };
  target: { system: string; object: string; endpoint?: string; };
}

export interface Package {
  id: string;
  name: string;
  collapsed?: boolean;
}
