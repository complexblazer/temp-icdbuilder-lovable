
# Sidebar Navigation Migration Plan

## 0. Design target
New structural classes:
- `sidebar-nav` – container for all navigation sections
- `sidebar-nav-item` – any clickable row
- `sidebar-nav-subitem` – nested rows

## 1. Inventory & isolate existing sidebar styles
Collect all rules in app.css and sidebar.css relating to navigation.
Mark navigation-only vs field-browser/pill usage.

## 2. Introduce new nav classes
Add to sidebar.css:

```
.sidebar-nav { ... }
.sidebar-nav-item { ... }
.sidebar-nav-subitem { ... }
```

## 3. Update JSX to use new classes
**Before:**
```
<div className="collapsible-header">SOURCE</div>
```

**After:**
```
<div className="sidebar-nav-item">SOURCE</div>
```

## 4. Remove old indentation rules
Delete or narrow `.nested-list` padding-left.
Ensure FIELDS/DATA subsections no longer use `nested-list`.

## 5. Ensure field-browser and pills do not use nav classes
Verify they only use `field-browser.css` and `field-pill` classes.

## 6. Clean up legacy selectors in app.css
Delete nav styling there and move relevant rules into sidebar.css.

This plan ensures:
- Single class for top-level nav rows
- Single class for nested nav rows
- No cross-contamination with field browser or pills
