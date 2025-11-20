# BOOL Design Concepts Library

This directory contains documented design concepts, patterns, and alternatives for the BOOL ICD Builder interface. Each concept captures design decisions, rationale, and implementation details for future reference.

## Purpose

- **Preserve design options**: Keep track of alternative implementations that were considered or used
- **Document decisions**: Record why certain design choices were made
- **Enable quick switching**: Maintain code for different visual styles that can be reactivated
- **Share knowledge**: Help team members understand the evolution of the design system

## Concept Categories

### Visual Components
- Badges and tags
- Buttons and controls
- Panels and containers
- Field pills and indicators

### Interaction Patterns
- Drag-and-drop behaviors
- Multi-select modes
- Filtering and searching
- Keyboard shortcuts

### Layout Systems
- Sidebar navigation
- Panel arrangements
- Responsive breakpoints
- Spacing and alignment

## How to Use This Library

1. **Browse concepts**: Each concept has its own markdown file with screenshots and code
2. **Apply concepts**: Copy CSS/code snippets from concept files to try different styles
3. **Add new concepts**: Document new design ideas before implementing them
4. **Reference decisions**: Link to concepts in commit messages and PR descriptions

## Active Concepts

- [Custom Field Badges](./badges-custom-field.md) - Yellow badge styles (bordered vs solid)
- [System Badges](./badges-system.md) - Source/Target system labels (solid style)

## Template

When adding a new concept, use this structure:
```markdown
# Concept Name

## Overview
Brief description of what this concept addresses

## Problem
What design challenge does this solve?

## Solution
How does this concept solve it?

## Implementation
Code snippets, CSS variables, component changes

## Variants
Different versions or alternatives

## Visual Examples
Screenshots or diagrams

## Trade-offs
Pros and cons of this approach

## Status
- Active / Reference / Deprecated
- Date created
- Last updated
```
