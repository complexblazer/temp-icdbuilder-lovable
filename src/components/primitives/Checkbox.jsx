import React from 'react';

/**
 * Checkbox - Reusable checkbox component with border-only transparent background style
 * @param {boolean} checked - Checked state
 * @param {function} onChange - Change handler
 * @param {string} label - Optional label text
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 */
function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label className={`checkbox-container ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className="checkbox-box"></span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
}

export { Checkbox };
export default Checkbox;
