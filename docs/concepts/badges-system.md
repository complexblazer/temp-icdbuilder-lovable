# System Badges (Source & Target)

**Status**: Active  
**Created**: November 18, 2025  
**Category**: Visual Components

## Overview

System badges identify the integration system (Centric, Fulfil, Salsify) in field browsers and headers. They use solid, high-contrast styling to make the system immediately recognizable.

## Problem

In field mapping workflows, users need to quickly identify:
- **SOURCE** fields - which system data is coming from (typically Centric - cyan)
- **TARGET** fields - which system data is going to (typically Fulfil - green)

The visual distinction must be clear and color-coded to match the established system color palette.

## Solution

Solid color badges using system colors with black text for maximum contrast. The solid style creates immediate visual recognition, while the color coding reinforces the system identity throughout the interface.

## Implementation

### CSS Variables (theme.css)

**Dark Mode:**
```css
--badge-source-bg: var(--centric);    /* Cyan: #5796f4 */
--badge-source-text: #000000;
--badge-target-bg: var(--fulfil);     /* Green: #a1f7c9 */
--badge-target-text: #000000;
```

**Light Mode:**
```css
--badge-source-bg: var(--centric);    /* Cyan: #148eff */
--badge-source-text: #000000;
--badge-target-bg: var(--fulfil);     /* Green: #38ff81 */
--badge-target-text: #000000;
```

### CSS Classes (app.css)

```css
.source-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--badge-source-bg);
  color: var(--badge-source-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.target-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--badge-target-bg);
  color: var(--badge-target-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

### Header Variants (field-browser.css)

```css
.source-badge-header {
  background: var(--badge-source-bg) !important;
  color: var(--badge-source-text) !important;
}

.target-badge-header {
  background: var(--badge-target-bg) !important;
  color: var(--badge-target-text) !important;
}
```

## Usage Locations

1. **Field Browser Headers**: "SOURCE FIELD" / "TARGET FIELD" panels
2. **Mapping Table Headers**: Column labels for source/target columns
3. **Field Pills**: (Future) System indicator on individual field items
4. **Modal Dialogs**: System context in field selection modals

## Usage Example (JSX)

```jsx
// In field browser header
<span className="source-badge-header">SOURCE</span>
<span className="target-badge-header">TARGET</span>

// In field list items
<span className="source-badge">Centric</span>
<span className="target-badge">Fulfil</span>
```

## Color Rationale

**SOURCE (Cyan/Blue):**
- Represents Centric PLM (primary source system)
- Cool color suggests "input" or "origin"
- High visibility for quick scanning

**TARGET (Green):**
- Represents Fulfil ERP (primary target system)
- Green suggests "go" or "destination"
- Positive association with success/completion

**Black Text:**
- Maximum contrast on bright system colors
- Ensures readability in both themes
- Matches solid badge pattern (same as custom badge solid variant)

## Style Consistency

System badges intentionally use the **solid variant** styling (same as custom badge solid option) to:
- Create strong visual hierarchy
- Distinguish from custom field badges (bordered)
- Provide immediate recognition
- Match the visual weight of system importance

## Design Principles

1. **High contrast**: Solid backgrounds ensure badges stand out
2. **Color-coded**: System colors reinforce mental model (cyan=source, green=target)
3. **Consistent**: Same solid style across all system indicators
4. **Accessible**: Black-on-color ensures WCAG contrast compliance

## Future Considerations

- Could support dynamic system assignment (Salsify as source, etc.)
- Badge color could adapt based on actual flow configuration
- Hover tooltip could show full system name
- Could add system icon/logo for additional recognition
