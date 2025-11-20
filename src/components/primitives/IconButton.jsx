import React from 'react';

/**
 * IconButton - Reusable icon-only button component
 * @param {string} icon - Icon character or emoji
 * @param {string} variant - Button variant: 'ghost' (default), 'primary', 'danger', 'success'
 * @param {string} size - Button size: 'sm', 'md' (default), 'lg'
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} title - Tooltip text
 * @param {string} className - Additional CSS classes
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  title,
  'aria-label': ariaLabel,
  className = '',
  ...props
}) {
  const variantClass = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success',
    text: 'btn-text',
  }[variant] || 'btn-ghost';

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size] || 'btn-md';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      type="button"
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default IconButton;
