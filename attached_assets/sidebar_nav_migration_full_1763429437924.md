# Sidebar Navigation Migration Plan (Full Instructions)

## 0. Design Target
New structural classes:
- `flow-sidebar` – the outer layout container (left panel)
- `sidebar-nav` – navigation container inside the sidebar
- `sidebar-nav-item` – top-level navigation rows
- `sidebar-nav-subitem` – nested child rows (flows under packages)

Navigation styling should not affect field-browser or field-pill components.

---

## 1. Inventory Existing Sidebar Styles
Search in `app.css` and `sidebar.css` for:
- `.flow-sidebar`
- `.sidebar-section`, `.nav-section`, `.collapsible-header`
- `.nested-list`, `.nested-item`

Mark which are:
- Navigation-only
- Shared or used by field-browser/pill UI

Goal: isolate navigation styles.

---

## 2. Introduce New Navigation Classes
Add to `sidebar.css`:

```
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.sidebar-nav-item:hover {
  color: var(--text-primary);
}

.sidebar-nav-subitem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.sidebar-nav-subitem:hover {
  color: var(--text-primary);
}
```

---

## 3. Migrate JSX to Use New Classes
### Before
```
<div className="collapsible-header">SOURCE</div>
<div className="nested-list">
  <div className="collapsible-header">Flow 1</div>
</div>
```

### After
```
<div className="sidebar-nav">
  <div className="sidebar-nav-item">SOURCE</div>
  <div className="sidebar-nav-subitem">Flow 1</div>
</div>
```

Apply to:
- PACKAGES section  
- FIELDS → SOURCE / TARGET / CUSTOM  
- DATA → IMPORTS / EXPORTS / ISSUES  

---

## 4. Remove Old Indentation Rules
Delete or restrict:

```
.nested-list {
  padding-left: var(--spacing-md);
}
```

If flows under packages need indentation:

```
.package-flows-list {
  padding-left: var(--spacing-md);
}
```

FIELDS and DATA subsections should **not** use `.nested-list`.

---

## 5. Ensure Field Browser & Pill Components Are Not Affected
Verify:
- No field browser markup uses `.sidebar-section`, `.nested-list`, `.nav-section`, or `.collapsible-header`.
- Pills rely only on `.field-pill` classes.

If markup was reusing those for spacing, replace with:

```
.field-browser-wrapper {
  padding: var(--spacing-md);
}
```

---

## 6. Clean Up Legacy Selectors in app.css
Remove old sidebar-related rules such as:

```
.flow-sidebar .nav-section-header { ... }
.collapsible-header { ... }
.nested-list { ... }
```

Move any remaining relevant styles into `sidebar.css`.

---

## 7. Final State
- `flow-sidebar` controls layout of the left column  
- `sidebar-nav` controls navigation layout only  
- `sidebar-nav-item` standardizes all top-level items  
- `sidebar-nav-subitem` handles nested items  
- No accidental styling leaks into field browser or pills  
