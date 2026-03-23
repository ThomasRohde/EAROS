---
title: "Replacing broken unicode box-drawing diagrams with Excalidraw SVG via excal CLI"
category: ui-bugs
date: 2026-03-23
tags:
  - excalidraw
  - excal-cli
  - svg-rendering
  - github-pages
  - documentation
  - unicode-diagrams
component: "site documentation / tools/editor/README.md"
problem_type: rendering
severity: medium
resolved: true
resolution_type: workaround
---

## Problem

Unicode box-drawing characters (`┌─────┐`, `├──`, `│`, `└──┘`) inside markdown code blocks render inconsistently in web fonts on GitHub Pages. The horizontal line character `─` (U+2500, BOX DRAWINGS LIGHT HORIZONTAL) is invisible or nearly invisible in many browser/font combinations, while vertical bars `│` render as thin pipes. Architecture diagrams and directory trees that look correct in terminals and VS Code appear broken when published to the web.

## Root Cause

Terminal emulators and code editors use fonts designed for full Unicode box-drawing coverage (Cascadia Code, JetBrains Mono, etc.). Web-rendered monospace fonts — including browser defaults and system font stacks — often lack proper glyphs for the U+2500 range, or render them at inconsistent heights and widths that break visual alignment. The failure is environment-dependent and invisible during local development.

## Solution: Excalidraw SVG Diagrams via `excal` CLI

Rather than fighting font rendering, convert box-drawing diagrams to SVG images using the `excal` CLI.

### Step 1 — Create an Excalidraw scene

Write a `.excalidraw` JSON file:

```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [ ... ],
  "appState": { "viewBackgroundColor": "#ffffff" }
}
```

### Step 2 — Bound text pattern

To place text inside a rectangle:

- Rectangle: `"boundElements": [{ "id": "text-id", "type": "text" }]`
- Text: `"containerId": "rectangle-id"`
- Text `x` = `container.x + padding` (e.g., 20px) — **must be the left edge, not the center**
- Text `y` = `container.y + (container.height - textHeight) / 2`
- Text `width` = `container.width - (2 × padding)`
- `"textAlign": "center"`, `"verticalAlign": "middle"`

**Common mistake:** Setting text `x` to the center of the container pushes rendered text to the right. The `x` coordinate is the left edge of the text bounding box; `textAlign` handles centering within that width.

### Step 3 — Style (auto memory [claude])

- `roughness: 1` — handwritten/sketchy look (project standard)
- `fontFamily: 1` — Virgil (Excalidraw's handwritten font)
- `fillStyle: "solid"` with pastel fills: `#a5d8ff` (blue), `#b2f2bb` (green), `#ffec99` (yellow)
- `strokeWidth: 2`, `roundness: { type: 3 }` for rounded corners

### Step 4 — Validate

```bash
excal validate diagram.excalidraw
```

Check `result.valid` in the JSON response.

### Step 5 — Render to SVG

```bash
excal render diagram.excalidraw --svg --no-background --outDir ./output
```

`--no-background` produces a transparent background for dark-mode compatibility.

### Step 6 — Embed in markdown

Use the full published URL for cross-platform rendering (GitHub Pages, npmjs, VS Code):

```markdown
![Diagram description](https://thomasrohde.github.io/EAROS/diagrams/diagram-name.svg)
```

### Step 7 — Commit and deploy

Commit both `.excalidraw` (source) and `.svg` (rendered output). Place SVGs under a path the deploy workflow watches — for this project, `site/public/diagrams/`.

**Note:** The Deploy Site workflow only triggers on `site/**`, `docs/**`, `standard/**` paths. Changes to `tools/editor/README.md` alone require a manual `gh workflow run deploy-site.yml`.

## For Simple Cases: Markdown Tables

Directory trees and flat structures can be replaced with markdown tables:

```markdown
| Path | Purpose |
|------|---------|
| `core/` | Core meta-rubric — universal foundation |
| `profiles/` | Artifact-specific profiles |
```

Tables render reliably everywhere. Use them for simple lists; use SVG diagrams for layered architecture, flowcharts, or anything with visual nesting.

## Prevention

**Rule:** Treat unicode box-drawing characters as terminal-only. Any diagram intended for web-rendered markdown must use an image format.

**Convention:** Diagrams are images, not text art. Use `excal` as the default diagramming tool:
1. Author as `.excalidraw` source (version-controlled, editable)
2. Render to SVG via `excal render --svg --no-background`
3. Embed via full URL
4. Commit both source and output

**Checklist for new diagrams:**
- [ ] Authored as `.excalidraw` source
- [ ] Rendered to SVG with `--no-background`
- [ ] Embedded using full URL (not relative path)
- [ ] Verified on GitHub Pages
- [ ] Both `.excalidraw` and `.svg` committed

## Cross-References

- Source and rendered diagram: `site/public/diagrams/earos-layers.excalidraw` / `.svg`
- README using the diagram: `tools/editor/README.md`
- Markdown renderer: `site/src/components/MarkdownRenderer.tsx`
- `excal` CLI guide: run `excal guide` for full command reference
- Related: `docs/solutions/security-issues/cli-comprehensive-code-review-security-perf-architecture.md`
