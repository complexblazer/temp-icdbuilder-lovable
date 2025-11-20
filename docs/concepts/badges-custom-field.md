# Custom Field Badges

**Status**: Active  
**Created**: November 18, 2025  
**Category**: Visual Components

## Overview

Custom field badges are small labels that identify user-created fields in the FIELDS sidebar and field browsers. They distinguish custom fields from system fields at a glance.

## Problem

Users need to quickly identify which fields are:
- Custom-created (editable, deletable)
- System-provided (read-only from integration catalogs)

The visual distinction must be clear without being distracting.

## Solution

Use a colored badge with "CUSTOM" text that appears next to custom field names. The badge uses yellow to convey "caution/special attention" while remaining visually distinct from system colors (cyan=Centric, green=Fulfil, purple=Salsify).

## Implementation

### Current Style: Bordered Translucent Badge

**CSS Variables (theme.css)**
```css
/* Dark Mode */
--badge-custom-bg: rgba(237, 231, 177, 0.12);
--badge-custom-border: #e8d88f;
--badge-custom-text: #ede7b1;

/* Light Mode */
--badge-custom-bg: rgba(218, 165, 32, 0.15);
--badge-custom-border: #c9940d;
--badge-custom-text: #b8860b;
```

**CSS Class (app.css & field-browser.css)**
```css
.custom-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--badge-custom-bg);
  border: 1px solid var(--badge-custom-border);
  color: var(--badge-custom-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

### Variant: Solid Yellow Badge

Kept for reference in theme.css as `-solid` variants:

**CSS Variables**
```css
/* Dark Mode */
--badge-custom-bg-solid: #d4c370;
--badge-custom-text-solid: #000000;

/* Light Mode */
--badge-custom-bg-solid: #daa520;
--badge-custom-text-solid: #000000;
```

**CSS Class (to use solid style)**
```css
.custom-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--badge-custom-bg-solid);
  color: var(--badge-custom-text-solid);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

## Visual Comparison

### Bordered Style (Current)
- ✅ Lighter visual weight
- ✅ More subtle, less distracting
- ✅ Works well with translucent UI elements
- ✅ Distinguishes from solid system badges (SOURCE/TARGET)
- ❌ Lower contrast than solid style
- ❌ Border adds slight visual complexity

### Solid Style (Reference)
- ✅ High contrast, immediately visible
- ✅ Consistent with system badge style (SOURCE/TARGET badges)
- ✅ Simple, bold appearance
- ❌ Can feel heavy if many custom fields exist
- ❌ Too similar to system badges (creates confusion)

## Usage Locations

1. **Sidebar FIELDS section**: Next to custom field names in the list
2. **Field browsers**: In SOURCE/TARGET field lists when `is_custom` is true
3. **Custom field section header**: "CUSTOM" badge in panel header

## How to Switch Styles

To activate the solid style:

1. In `theme.css`, swap variable names:
   - `--badge-custom-bg: rgba(...)` → use `--badge-custom-bg-solid` value
   - `--badge-custom-text: #...` → use `--badge-custom-text-solid` value
   
2. In `.custom-badge` class, change:
   - Remove: `border: 1px solid var(--badge-custom-border);`
   
3. In `.custom-badge-header` class:
   - Remove: `border: 1px solid var(--badge-custom-border) !important;`

## Color Rationale

**Yellow chosen because:**
- Distinct from system colors (cyan, green, purple)
- Conveys "special attention" without alarm (not red)
- Works well in both dark and light themes
- High visibility for accessibility

**Previous color (purple):**
- Originally matched Salsify system color
- Created confusion between custom fields and Salsify fields
- Changed to yellow for better distinction

## Design Principles

1. **Immediate recognition**: Badge should be instantly identifiable
2. **Non-intrusive**: Should not dominate the field name
3. **Consistent**: Same style across all locations (sidebar, browsers, modals)
4. **Accessible**: Sufficient color contrast for readability

## Future Considerations

- Could add icon (✎ pencil) for additional visual clarity
- Consider tooltip on hover: "Custom field - click to edit"
- Potential animation on hover to reinforce interactivity
- Badge could show creation date in tooltip
