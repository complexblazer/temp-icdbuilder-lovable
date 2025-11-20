# BOOL - Business Objects Orchestration Layer

## Overview
BOOL (Business Objects Orchestration Layer) is a visual field mapping tool designed to create Integration Control Documents (ICDs). It facilitates drag-and-drop mapping between enterprise systems (e.g., Centric PLM, Fulfil ERP, Salsify PIM) for up to 18 concurrent integration flows. The tool automates flow-level field mapping using a `fields_catalog` and an ICD master schema, aiming to reduce development time, minimize errors, and eliminate manual data entry. Key capabilities include creating, editing, and deleting persistent custom fields and a comprehensive import/export system for catalogs and workspaces.

## User Preferences
- **Communication Style**: I prefer clear, concise, and direct communication. Avoid overly technical jargon where simpler terms suffice.
- **Coding Style**: The project currently uses React functional components and a module-based export approach for better compatibility. I prefer this style to be maintained.
- **Workflow Preferences**: I favor an iterative development approach.
- **Interaction Preferences**: Ask for confirmation before making significant architectural changes or deleting core components. Provide detailed explanations for proposed changes, especially for UI/UX improvements or architectural decisions.
- **Working Preferences**: Do not introduce new third-party libraries without prior discussion. Ensure all changes are thoroughly tested.
- **CSS Change Workflow**: **CRITICAL - Follow this workflow for all CSS changes to avoid trial-and-error:**
  1. **Inspect Element** → Note exact class name (e.g., `.sidebar-nav-item`, `.field-pill`)
  2. **Locate File** → Use class prefix to find CSS file (`.sidebar-*` → `sidebar.css`, `.field-*` → `field-browser.css`, `.mapping-*` → `mappings.css`)
  3. **Verify in DevTools First** → Test the change in browser DevTools using existing tokens before touching code
  4. **Use Existing Tokens** → Use `--spacing-*`, `--bg-*`, `--text-*`, `--border-*` tokens (see `src/styles/README.md` for complete playbook)
  5. **Test Both Themes** → Verify dark and light modes before committing
  - See `src/styles/README.md` → "CSS Change Playbook" section for complete class-to-file mapping and decision tree

## System Architecture

### UI/UX Decisions
- **Design Aesthetic**: Ramp-inspired minimal UI with clean layouts, muted colors, and reduced visual clutter.
- **Theme System**: Three-layer CSS token architecture supporting dark (Dark Charcoal, default) and light (Sleek White & Gray) modes with subtle blue hues.
- **Modular CSS Architecture**: Component-based styling system (`src/styles/theme.css`, `src/styles/base.css`, `src/styles/layout.css`, `src/styles/components/`).
- **Typography**: Zalando Sans SemiExpanded from Google Fonts, 8pt base with rem-based scaling.
- **Layout**: Edge-to-edge design with a 17% width absolute left sidebar and an 83% width mappings workspace.
- **Interactive Elements**: Drag-and-drop for mapping creation; icon-only ghost buttons; border-only checkboxes.
- **Field Display**: Primary text for field name, secondary metadata. Custom fields indicated by a purple "CUSTOM" badge.
- **System Color Coding**: Theme-aware muted colors via CSS variables with subtle gradient accents.
- **Responsive Elements**: Independent section scrolling for sidebar elements and viewport-aware padding.
- **Form Layout**: Vertical layout for config forms with labels above inputs.

### Technical Implementations
- **Frontend Stack**: React 18.3.1, Vite 5.0.
- **Drag-and-Drop**: Implemented using `@dnd-kit/core` and `@dnd-kit/sortable`.
- **State Management**: Normalized state supporting up to 18 concurrent flows with LocalStorage for autosave/restore of packages, flows, mappings, activeFlowId, and uploaded field catalogs.
- **Data Model**: Includes `Field`, `Flow`, and nested `Mapping` structures.
- **Validation**: Real-time validation for missing fields, type mismatches, and required fields.
- **Export Formats**: ICD CSV, JSON Contract, and BOO Profile.
- **Transform Rules**: Includes `identity`, `enum_lookup`, `cnl_resolve`, `string_to_number`, `number_to_string`, `compose`, `uppercase`, `lowercase`.
- **Modularity**: ICD export logic extracted into `src/lib/ICDBuilder.js`.
- **Import System**: Offers "Replace" vs "Update/Merge" options with conflict detection, version validation, and XSS sanitization.

### Feature Specifications
- **Multi-Flow Architecture**: Supports up to 18 concurrent flows within a package system (create, rename, delete, re-parent).
- **Custom Field Creation**: Create, edit, and delete custom fields inline or via a dedicated panel with global persistence.
- **Enhanced ICD Columns**: `human_name`, `required_by_system`, `required_in_integration`, and `priority_level`.
- **Field Browsers**: Search bar, hide mapped fields option, system/object filters, and individual collapsibility.
- **Multi-Select Bulk Add**: Select multiple fields to add as new mapping rows simultaneously.
- **Catalog Viewer**: Dedicated view with stats header, full-text search, filters, sortable columns, and duplicate highlighting; auto-switches after upload.
- **Theme Toggle**: Light/dark mode switcher with localStorage persistence.
- **Visual Indicators**: "Used in Mappings" indicator and "CUSTOM" badge for custom fields.
- **Inline Editing**: Flow renaming and an always-present empty row for mapping creation.
- **Persistent Catalog**: Uploaded CSV field catalog persists across sessions via LocalStorage.
- **Reorganized Data Section**: Consolidated import/export functionality with collapsible subsections.

## External Dependencies
- **@dnd-kit/core**: For drag-and-drop functionalities.
- **@dnd-kit/sortable**: For sortable list functionalities.
- **PapaParse**: For parsing CSV files.
- **Google Fonts CDN**: For Zalando Sans SemiExpanded font family.
