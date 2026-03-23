---
title: "Creating Excalidraw diagrams with the excal CLI"
category: tools
date: 2026-03-23
tags:
  - excalidraw
  - excal-cli
  - svg
  - diagrams
  - documentation
component: "diagrams / documentation"
problem_type: technique
severity: low
resolved: true
resolution_type: workflow
---

## Purpose

`excal` is an agent-first CLI for creating, validating, and rendering Excalidraw diagrams. It produces resolution-independent SVGs that render identically across GitHub Pages, npmjs, VS Code preview, and any browser — unlike unicode art or ASCII diagrams, which depend on font support.

Use it whenever documentation needs a visual: architecture layers, data flows, component relationships, deployment topologies.

## Workflow

### 1. Create an Excalidraw scene

Write a `.excalidraw` JSON file:

```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [ ... ],
  "appState": { "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

Elements include rectangles, ellipses, diamonds, arrows, lines, text, and images. Run `excal skill` for the full element reference.

### 2. Bound text (labels inside shapes)

To place text inside a rectangle:

- Rectangle: `"boundElements": [{ "id": "text-id", "type": "text" }]`
- Text: `"containerId": "rectangle-id"`
- Text `x` = `container.x + padding` (e.g., 20px)
- Text `y` = `container.y + (container.height - textHeight) / 2`
- Text `width` = `container.width - (2 × padding)`
- `"textAlign": "center"`, `"verticalAlign": "middle"`

**Critical:** Text `x` must be the **left edge** of the text area, not the center point. `textAlign: "center"` handles horizontal centering within the text width. Setting `x` to the container center pushes text to the right.

### 3. Style conventions

| Property | Value | Notes |
|----------|-------|-------|
| `roughness` | `1` | Handwritten/sketchy (project standard) |
| `fontFamily` | `1` | Virgil — Excalidraw's handwritten font |
| `fillStyle` | `"solid"` | Solid background fills |
| `strokeWidth` | `2` | Visible but not heavy |
| `roundness` | `{ "type": 3 }` | Rounded corners on rectangles |

Pastel fill palette:

| Colour | Hex | Use |
|--------|-----|-----|
| Blue | `#a5d8ff` | Primary / top layer |
| Green | `#b2f2bb` | Secondary / middle layer |
| Yellow | `#ffec99` | Tertiary / foundation layer |
| Pink | `#fcc2d7` | Alerts / warnings |
| Gray | `#dee2e6` | Neutral / background |

### 4. Validate

```bash
excal validate diagram.excalidraw
```

Returns structured JSON. Check `result.valid` is `true` before rendering. Also validates frame references, bound text bindings, and arrow connections.

### 5. Render to SVG

```bash
excal render diagram.excalidraw --svg --no-background --outDir ./output
```

Key flags:

| Flag | Purpose |
|------|---------|
| `--svg` | SVG output (default) |
| `--png` | PNG output (requires Playwright) |
| `--no-background` | Transparent background — required for dark-mode compatibility |
| `--dark-mode` | Render with dark theme |
| `--scale <n>` | Scale factor for PNG (default: 2) |
| `--frame <id\|name>` | Export a single frame |
| `--padding <n>` | Padding in pixels (default: 20) |
| `--dry-run` | Validate pipeline without writing files |

### 6. Embed in markdown

Use the full published URL for cross-platform rendering:

```markdown
![Diagram description](https://thomasrohde.github.io/EAROS/diagrams/diagram-name.svg)
```

Full URLs work on GitHub Pages, npm README pages, and VS Code preview. Relative paths resolve inconsistently across platforms.

### 7. Commit and deploy

Commit both the `.excalidraw` source (for future edits) and the `.svg` output (for rendering). Place SVGs under a path the deploy workflow watches.

## CLI Reference

| Command | Purpose |
|---------|---------|
| `excal inspect <file>` | Element counts, bounds, metadata |
| `excal validate <file>` | Structural consistency check |
| `excal render <file>` | Render to SVG, PNG, or PDF |
| `excal guide` | Full CLI guide as markdown |
| `excal skill` | Excalidraw domain knowledge for agents |

All commands return a structured JSON envelope with `ok`, `result`, `warnings`, `errors`, and `metrics`.

## Checklist

When adding a diagram to documentation:

- [ ] Authored as `.excalidraw` source file
- [ ] `roughness: 1`, `fontFamily: 1` (handwritten style)
- [ ] Text centered: `textAlign: "center"`, `verticalAlign: "middle"`
- [ ] Validated with `excal validate`
- [ ] Rendered with `excal render --svg --no-background`
- [ ] Embedded using full URL
- [ ] Both `.excalidraw` and `.svg` committed

## Example

The EaROS three-layer model diagram:

- Source: `site/public/diagrams/earos-layers.excalidraw`
- Rendered: `site/public/diagrams/earos-layers.svg`
- Embedded in: `tools/editor/README.md`

## Origin

Discovered while replacing unicode box-drawing diagrams that rendered poorly on GitHub Pages. Unicode characters like `─` (U+2500) are invisible in many web monospace fonts. The `excal` approach solves this and generalises to any diagram need.
