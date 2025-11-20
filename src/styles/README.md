# BOOL CSS Architecture

This folder contains the complete styling system for BOOL, structured for scalability and maintainability.

## CSS Change Playbook (Zero Trial-and-Error)

**Use this workflow for every CSS change to get it right on the first try:**

### Step 1: Inspect Element
- Right-click the element → "Inspect Element"
- Note the class name (e.g., `.sidebar-nav-item`, `.field-pill`, `.mapping-row`)

### Step 2: Locate the File
Use this mapping to find which file to edit:

| Class Name Pattern | Edit This File | Common Use Cases |
|-------------------|----------------|------------------|
| `.sidebar-*` | `components/sidebar.css` | Navigation, package list, flow list, section headers |
| `.field-*`, `.pill-*` | `components/field-browser.css` | Field pills, search bars, filters, browser panels |
| `.mapping-*`, `.drop-*`, `.row-*` | `components/mappings.css` | Mapping table, drop zones, table rows |
| `.btn-*`, `.icon-button` | `components/button.css` | All button variants and icon buttons |
| `.checkbox` | `components/checkbox.css` | Checkbox components |
| `.app-*`, `.header-*` | `app.css` (legacy) | Top-level layouts, global headers |
| `.flex`, `.gap-*`, layout utilities | `layout.css` | Flexbox, grid, spacing utilities |

### Step 3: Verify in DevTools First
**DO THIS BEFORE TOUCHING CODE:**
1. In DevTools, edit the style directly using existing tokens
2. Try: `background: var(--bg-hover)` or `padding: var(--spacing-md)`
3. Toggle dark/light theme to verify both modes look correct
4. Once confirmed, copy the exact change to the file

### Step 4: Use Existing Tokens
**Pick from this approved list (don't invent new ones):**
```css
/* Backgrounds */ --bg-canvas, --bg-sidebar, --bg-panel, --bg-hover, --bg-active
/* Borders */ --border-subtle, --border-medium, --border-strong
/* Text */ --text-primary, --text-secondary, --text-muted
/* Spacing */ --spacing-xs (4px), --spacing-sm (8px), --spacing-md (12px), --spacing-lg (16px)
/* Radius */ --radius-sm (4px), --radius-md (6px)
```

### Decision Tree
```
Need to change spacing/alignment?
  └─> Use --spacing-* tokens or px values

Need to change colors?
  └─> Is it for hover? Use --bg-hover
  └─> Is it for text? Use --text-*
  └─> Is it for borders? Use --border-*

Need to add a new token?
  └─> Will you use it in 3+ places? → Yes: add to theme.css
  └─> Does it differ between light/dark? → Yes: add to theme.css
  └─> Otherwise → Just use the value directly
```

### Common Pitfalls to Avoid
- ❌ Editing `app.css` instead of component CSS files
- ❌ Using hardcoded hex colors instead of tokens
- ❌ Forgetting to test both light and dark themes
- ❌ Not checking DevTools before committing changes
- ❌ Creating new tokens when existing ones work fine

## Quick Start (Pragmatic Mode)

**For most styling changes, follow this simple workflow:**

1. **Where does it live?** → Find the component CSS file (sidebar.css, field-browser.css, mappings.css, etc.)
2. **Which tokens should I use?** → Pick from the approved list below
3. **Make the change** → Update the component CSS using existing tokens
4. **Don't add new tokens** unless you're reusing it in 3+ places or need dark/light theme variants

### Approved Tokens (Use These 95% of the Time)

```css
/* Backgrounds */
--bg-canvas, --bg-sidebar, --bg-panel, --bg-panel-alt
--bg-hover, --bg-active

/* Borders */
--border-subtle, --border-medium, --border-strong

/* Text */
--text-primary, --text-secondary, --text-muted

/* Actions */
--brand-primary, --focus-ring

/* Status/System */
--brand-success, --brand-danger, --brand-warning
--centric, --fulfil, --salsify

/* Spacing */
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl

/* Radius */
--radius-sm, --radius-md
```

### CSS Governance Rules

1. **theme.css is frozen** - Don't re-architect or add new token layers
2. **Default to component layer** - Make changes in component CSS files
3. **Only add tokens when**:
   - Reusing value in 3+ places, OR
   - Affects dark vs light theme behavior
4. **No override files** - Changes go directly in component CSS
5. **Speed over purity** - It's OK to use tokens directly without perfect semantic naming

## Architecture Overview

### Three-Layer Token System

Our design system follows a three-layer token hierarchy for maximum flexibility:

```
Core Tokens (Primitives)
    ↓
Semantic Tokens (Purpose)
    ↓
Component Tokens (Specific Use)
```

This architecture ensures:
- **Consistency**: Centralized color/spacing management
- **Themability**: Easy dark/light mode switching
- **Scalability**: Add new components without hard-coding values
- **Maintainability**: Change once, apply everywhere

## File Structure

```
src/styles/
├── theme.css              # Three-layer token system (FROZEN)
├── base.css               # Global resets, typography, focus states
├── layout.css             # Grid, flexbox, containers
├── app.css                # Legacy styles (being phased out)
├── components/
│   ├── button.css         # Icon-only button variants
│   ├── checkbox.css       # Border-only checkbox styles
│   ├── sidebar.css        # Sidebar navigation
│   ├── field-browser.css  # Field pills and browsers
│   └── mappings.css       # Mapping table and drop zones
└── README.md              # This file
```

## How to Make CSS Changes (Component-First Workflow)

### Step-by-Step Process

1. **Identify the component** - Which UI element needs to change?
   - Sidebar, buttons, field pills, mapping table, etc.

2. **Find the component file** - Go to the corresponding `.css` file:
   - `sidebar.css` - Navigation, sections, items
   - `field-browser.css` - Field pills, search, filters
   - `mappings.css` - Mapping table, drop zones
   - `button.css` - All button variants
   - `checkbox.css` - Checkbox component
   - `app.css` - Global app shell, headers, banners

3. **Use existing tokens** - Apply approved tokens from the list above:
   ```css
   /* GOOD - Uses existing tokens */
   .my-component {
     padding: var(--spacing-md);
     background: var(--bg-panel);
     border: 1px solid var(--border-subtle);
   }
   
   /* BAD - Creates new tokens unnecessarily */
   .my-component {
     padding: var(--my-custom-spacing);
     background: var(--my-component-bg);
   }
   ```

4. **Make the change** - Edit the component CSS directly

5. **Only add tokens if**:
   - Using the same value in 3+ different places, OR
   - Need different values for dark/light themes

### Common Changes Quick Reference

| What you want to change | File to edit | Common tokens to use |
|-------------------------|--------------|---------------------|
| Sidebar spacing/colors | `sidebar.css` | `--spacing-*`, `--bg-sidebar`, `--border-subtle` |
| Button hover states | `button.css` | `--btn-ghost-bg-hover`, `--bg-hover` |
| Field pill appearance | `field-browser.css` | `--pill-bg`, `--pill-hover-bg`, `--border-subtle` |
| Table row spacing | `mappings.css` | `--spacing-md`, `--spacing-lg` |
| Panel alignment | `app.css` or component file | `--spacing-*`, padding/margin |
| Drop zone borders | `mappings.css` | `--border-subtle`, `--drop-border-active` |

### Examples

**Example 1: Align panel headers**
```css
/* In field-browser.css */
.panel-header {
  padding: var(--spacing-md) var(--spacing-lg);
  /* Change padding-left to align with parent */
  padding-left: 12px;
}
```

**Example 2: Adjust field pill spacing**
```css
/* In field-browser.css */
.field-pills-stack {
  gap: 8px; /* Increase from 6px */
}
```

**Example 3: Make buttons more compact**
```css
/* In button.css */
.btn-sm {
  padding: 4px; /* Reduce from 6px */
}
```

## Token Taxonomy

### Layer 1: Core Tokens (Primitives)

Raw, literal values. Never use directly in components.

**Dark Theme:**
```css
--gray-900: #050608;
--gray-850: #06070a;
--gray-800: #0c0e11;
/* ... */
--blue-muted: #4b6fa8;
--amber-muted: #b8924f;
--green-muted: #5a9c7a;
--purple-muted: #8d77a8;
```

**Light Theme:**
```css
--gray-900: #171717;
--gray-800: #3a3a3a;
/* ... */
--blue-muted: #5b7aa8;
--amber-muted: #a5823e;
--green-muted: #4d8864;
--purple-muted: #7d6a9c;
```

### Layer 2: Semantic Tokens (Purpose)

Meaning-based aliases. Use these in most cases.

```css
/* Backgrounds */
--bg-canvas          # Main canvas background
--bg-sidebar         # Sidebar background
--bg-panel           # Panel background
--bg-panel-raised    # Elevated panel
--bg-panel-alt       # Alternate panel
--bg-hover           # Hover state background
--bg-active          # Active state background

/* Borders */
--border-subtle      # Subtle borders
--border-medium      # Medium borders
--border-strong      # Strong borders
--divider            # Dividers/separators

/* Text */
--text-primary       # Primary text
--text-secondary     # Secondary text
--text-muted         # Muted text
--text-placeholder   # Placeholder text

/* Interactive States */
--focus-ring         # Focus outline color
--selection-bg       # Text selection background
--selection-text     # Text selection color

/* System Colors (Muted for Ramp aesthetic) */
--centric            # Centric PLM (muted amber)
--fulfil             # Fulfil ERP (muted green)
--salsify            # Salsify PIM (muted purple)

/* Brand Colors (Muted) */
--brand-primary      # Primary brand (muted blue)
--brand-success      # Success state (muted green)
--brand-warning      # Warning state (muted amber)
--brand-danger       # Danger state (muted red)
--brand-accent       # Accent color (muted purple)
```

### Layer 3: Component Tokens (Specific Use)

Component-specific tokens for precise control.

```css
/* Buttons */
--btn-ghost-text
--btn-ghost-text-hover
--btn-ghost-bg
--btn-ghost-bg-hover

/* Checkboxes */
--checkbox-border
--checkbox-border-checked
--checkbox-bg
--checkbox-check-color

/* Field Pills */
--pill-bg
--pill-border
--pill-text
--pill-hover-bg
--pill-hover-border
--pill-centric-accent
--pill-fulfil-accent
--pill-salsify-accent

/* Drop Zones */
--drop-bg
--drop-hover-bg
--drop-active-bg
--drop-border
--drop-border-active

/* Inputs */
--input-bg
--input-border
--input-border-focus
--input-text

/* Sidebar */
--sidebar-item-hover
--sidebar-item-active
--sidebar-divider
```

### Spacing Scale

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
```

### Border Radius

```css
--radius-xs: 2px
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
```

### Typography

```css
--font-family-base: "Zalando Sans SemiExpanded", system-ui, -apple-system, BlinkMacSystemFont, sans-serif
--font-size-base: 8pt
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--line-height-base: 1.5
--line-height-tight: 1.2
--letter-spacing: -0.01em
```

### Transitions

```css
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease
```

## Component CSS Files

### button.css
Defines button variants following the Ramp aesthetic:
- **btn-ghost** - Icon-only, no borders/fills (default)
- **btn-primary** - Subtle border for special cases
- **btn-text** - Text-only buttons
- **btn-danger** / **btn-success** - Color variants

### checkbox.css
Border-only checkbox with transparent background:
- Custom checkbox styling
- Border thickness: 1.5px
- Transparent background in both checked/unchecked states
- Checkmark appears as colored border

### sidebar.css
Minimal sidebar navigation:
- No borders on items
- Subtle hover states
- Collapsible sections
- Nested list support

### field-browser.css
Field pills and browser functionality:
- Minimal pill styling with muted system colors
- Very subtle accent colors (15% opacity)
- Border-only on hover
- Multi-select mode support

### mappings.css
Mapping table and drop zones:
- Clean table layout with minimal borders
- Subtle row separators on hover
- Transparent inputs with border on focus
- Minimal drop zone styling

### ramp-overrides.css
Final layer that removes excessive borders:
- Removes all unnecessary borders
- Applies Ramp's clean aesthetic
- Uses `!important` to override legacy styles
- Will be integrated into components as app.css is phased out

## Design Philosophy (Ramp Aesthetic)

### Minimal Borders
- Use borders sparingly, only where needed for structure
- Prefer subtle dividers over boxes
- Rely on spacing and backgrounds for visual hierarchy

### Muted Colors
- System colors (Centric, Fulfil, Salsify) are muted
- Brand colors are desaturated for sophistication
- Use very low opacity accents (10-15%)

### Ghost Interactions
- Buttons are icon-only with no borders/fills
- Hover states provide subtle feedback
- Active states use transparency, not solid colors

### Clean Typography
- Zalando Sans SemiExpanded for modern feel
- Minimal letter-spacing (-0.01em)
- Careful use of font weights (400, 500, 600)

## Theme Switching

Themes are controlled via the `data-theme` attribute on the `<html>` element:

```javascript
// In App.jsx
const [theme, setTheme] = useState(() => {
  return localStorage.getItem('theme') || 'dark';
});

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);

const toggleTheme = () => {
  setTheme(prev => prev === 'dark' ? 'light' : 'dark');
};
```

## Usage Guidelines

### ✅ DO

```css
/* Use semantic tokens */
.my-component {
  background: var(--bg-panel);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
}

/* Use component tokens for specific use cases */
.my-button {
  background: var(--btn-ghost-bg);
  color: var(--btn-ghost-text);
}
```

### ❌ DON'T

```css
/* Don't use core tokens directly */
.my-component {
  background: var(--gray-800); /* BAD */
  color: var(--gray-200); /* BAD */
}

/* Don't hard-code values */
.my-component {
  background: #0c0e11; /* BAD */
  padding: 12px; /* BAD - use var(--spacing-md) */
}

/* Don't use system-specific values for general components */
.my-button {
  color: #4b6fa8; /* BAD - use var(--brand-primary) */
}
```

## React Component Primitives

### IconButton
```jsx
import { IconButton } from './components/primitives';

<IconButton
  icon="☀"
  onClick={handleClick}
  variant="ghost"  // ghost, primary, danger, success
  size="md"        // sm, md, lg
  title="Tooltip text"
/>
```

### Checkbox
```jsx
import { Checkbox } from './components/primitives';

<Checkbox
  checked={isChecked}
  onChange={handleChange}
  label="Optional label"
/>
```

## Migration Strategy

### Current State
- **app.css**: Legacy monolithic styles (1400+ lines)
- **Modular files**: New component-specific styles
- **ramp-overrides.css**: Temporary overrides

### Import Order (Critical)
```javascript
import "./styles/theme.css";           // 1. Tokens first
import "./styles/base.css";            // 2. Base styles
import "./styles/app.css";             // 3. Legacy (being phased out)
import "./styles/layout.css";          // 4. Layout utilities
import "./styles/components/*.css";    // 5. Component styles
import "./styles/components/ramp-overrides.css"; // 6. Final overrides
```

### Phase-Out Plan
1. **Phase 1** (Complete): Architecture established
2. **Phase 2** (In Progress): Gradually migrate styles from app.css to component files
   - ✅ Migrated flow-related styles → sidebar.css
   - ✅ Standardized all input focus states → `--input-border-focus` (blue accent)
   - ✅ Reserved green exclusively for success states and Fulfil system
3. **Phase 3** (Future): Remove app.css entirely
4. **Phase 4** (Future): Integrate ramp-overrides into component files

### Recent Migrations (Nov 2025)
**Input Focus Standardization**: All `input:focus` states now use `--input-border-focus` (blue accent) instead of hardcoded green.
- ✅ Custom field panel inputs
- ✅ Search inputs
- ✅ Form field inputs
- ✅ Flow name inputs

**Flow Styles Migration**: Moved from app.css → sidebar.css for proper component architecture:
- ✅ `.flow-name-display` (read mode)
- ✅ `.flow-name-input-config` (edit mode)
- ✅ Package action buttons (changed hover from green → cyan)

**Field Browser Panel Migration** (Nov 18, 2025): Moved all panel-related styles from app.css → field-browser.css:
- ✅ `.panel`, `.panel-header`, `.panel-body`, `.panel-content` (complete panel structure)
- ✅ `.nav-chevron`, `.system-badge` (navigation elements)
- ✅ Panel header now mimics `.sidebar-nav-item` for visual consistency (CSS facade pattern)
- ✅ Maintains FieldBrowser component encapsulation while achieving sidebar navigation parity
- ✅ Sets foundation for future Headless FieldBrowser refactor (Option 4 - see Future Enhancements)

**Color Semantic Rules**:
- 🔵 Blue (`--input-border-focus`): All input focus states, interactive highlights
- 🟢 Green (`--bool-green`, `--fulfil`): Success states, checkboxes, Fulfil system only
- 🔴 Red (`--bool-red`): Delete actions, errors, warnings
- 🟣 Purple (`--salsify`): Salsify system color
- 🔷 Cyan (`--color-cyan`): Button hovers, secondary interactions

## Adding New Styles

### For New Components
1. Create `components/[component-name].css`
2. Use semantic and component tokens
3. Follow the Ramp aesthetic (minimal borders, muted colors)
4. Import in App.jsx after layout.css

### For New Colors
1. Add core token to theme.css (both themes)
2. Create semantic alias if needed
3. Create component token if it's component-specific
4. Document in this README

### For New Spacing
Use existing spacing scale. If truly needed:
1. Add to theme.css `:root` section
2. Follow naming convention: `--spacing-[size]`
3. Document in this README

## Troubleshooting

### Styles Not Applying
1. Check import order in App.jsx
2. Verify token exists in theme.css
3. Check for `!important` conflicts
4. Inspect browser DevTools for computed values

### Theme Not Switching
1. Verify `data-theme` attribute on `<html>` element
2. Check theme state management in App.jsx
3. Confirm localStorage is working

### Colors Look Wrong
1. Ensure using semantic tokens, not core tokens
2. Check theme.css for both light/dark values
3. Verify no hard-coded colors override tokens

## Future Enhancements

### Architecture
- [ ] **Headless FieldBrowser Pattern (Option 4)** - High-value refactor for module suite
  - Extract `useFieldBrowser` hook (state, filtering, search logic)
  - Create `FieldBrowserBody` component (pure rendering)
  - Enable full composability: modals, split views, custom headers
  - Unlock reuse across modules without FieldBrowser constraints
  - **Why defer:** Currently achieving visual parity via CSS facade (field-browser.css)
  - **When to do:** When needed in 3+ different UI contexts (modal, split, embedded)
  - **Estimated effort:** 3-4 hours with testing (dnd-kit integration risk)
  - **See:** `src/styles/components/field-browser.css` header comments for implementation notes

### Styling System
- [ ] Complete migration from app.css to modular files
- [ ] Add animation tokens
- [ ] Add shadow/elevation tokens
- [ ] Create utility class library
- [ ] Add responsive breakpoint tokens

### Tooling
- [ ] Component library documentation site
- [ ] Storybook integration for component showcase
- [ ] CSS Modules or CSS-in-JS consideration
