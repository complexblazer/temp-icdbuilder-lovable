import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function Dropdown({ label, value, options, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="hierarchy-dropdown" ref={dropdownRef}>
      <button
        className="hierarchy-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="hierarchy-dropdown-label">{selectedOption?.name || placeholder}</span>
        <ChevronDown size={14} className={`hierarchy-dropdown-icon ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="hierarchy-dropdown-menu">
          {options.length === 0 ? (
            <div className="hierarchy-dropdown-empty">No {label.toLowerCase()}s available</div>
          ) : (
            options.map(option => (
              <button
                key={option.id}
                className={`hierarchy-dropdown-item ${option.id === value ? 'active' : ''}`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MapDropdown({ maps, activeMapId, onMapChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const activeMap = maps.find(m => m.id === activeMapId);
  const mapNumbers = maps.map(m => {
    const match = m.name.match(/Map (\d+)/);
    return match ? match[1] : m.name;
  });

  return (
    <div className="hierarchy-dropdown map-dropdown" ref={dropdownRef}>
      <button
        className="hierarchy-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="hierarchy-dropdown-label">
          {activeMap ? `Map ${mapNumbers[maps.findIndex(m => m.id === activeMapId)]}` : 'Map'}
        </span>
        <ChevronDown size={14} className={`hierarchy-dropdown-icon ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="hierarchy-dropdown-menu map-menu">
          {maps.length === 0 ? (
            <div className="hierarchy-dropdown-empty">No maps available</div>
          ) : (
            <div className="map-list">
              {maps.map((map, index) => {
                const mapNum = mapNumbers[index];
                return (
                  <label
                    key={map.id}
                    className={`map-list-item ${map.id === activeMapId ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="map-selection"
                      checked={map.id === activeMapId}
                      onChange={() => {
                        onMapChange(map.id);
                        setIsOpen(false);
                      }}
                    />
                    <span className="map-number">{mapNum}</span>
                    {map.status === 'draft' && <span className="map-status">draft</span>}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HierarchyPicker({
  packages,
  sequences,
  flows,
  maps,
  activePackageId,
  activeSequenceId,
  activeFlowId,
  activeMapId,
  onPackageChange,
  onSequenceChange,
  onFlowChange,
  onMapChange,
}) {
  // Filter options based on hierarchy
  const filteredSequences = sequences.filter(s => s.package_id === activePackageId);
  const filteredFlows = flows.filter(f => f.sequence_id === activeSequenceId);
  const filteredMaps = maps.filter(m => m.flow_id === activeFlowId);

  return (
    <div className="hierarchy-picker">
      <Dropdown
        label="Package"
        value={activePackageId}
        options={packages}
        onChange={onPackageChange}
        placeholder="Select Package"
      />
      
      <span className="hierarchy-separator">›</span>
      
      <Dropdown
        label="Sequence"
        value={activeSequenceId}
        options={filteredSequences}
        onChange={onSequenceChange}
        placeholder="Select Sequence"
      />
      
      <span className="hierarchy-separator">›</span>
      
      <Dropdown
        label="Flow"
        value={activeFlowId}
        options={filteredFlows}
        onChange={onFlowChange}
        placeholder="Select Flow"
      />
      
      <span className="hierarchy-separator">›</span>
      
      <MapDropdown
        maps={filteredMaps}
        activeMapId={activeMapId}
        onMapChange={onMapChange}
      />
    </div>
  );
}
