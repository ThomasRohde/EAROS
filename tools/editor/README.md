# EAROS Editor

A browser-based YAML editor for EAROS rubrics and evaluation records, built with React + JSON Forms + Material UI.

## Quick start

```bash
cd tools/editor
npm install
npm run dev         # open at http://localhost:5173
```

## CLI

Run the editor against a specific file:

```bash
node bin.js                                  # open blank editor
node bin.js ../../core/core-meta-rubric.yaml # import file on open
node bin.js validate ../../profiles/adr.yaml # validate and exit 0/1
```

Or link globally:

```bash
npm link
earos-editor validate ../../profiles/adr.yaml
```

### Validate exit codes

| Code | Meaning |
|------|---------|
| `0`  | File is valid |
| `1`  | Validation errors found (printed to stderr) |

## Features

| Feature | How |
|---------|-----|
| **Kind selector** | Toolbar dropdown — switches between `core_rubric`, `profile`, `overlay`, `evaluation`. Reshapes the form and loads the correct schema. |
| **Tabbed form** | JSON Forms renders a categorised tab view: Metadata / Dimensions & Criteria / Scoring & Outputs / Agent & Calibration |
| **Live YAML preview** | Right panel updates in real time as you edit |
| **Import YAML** | Toolbar "Import" button or drag-and-drop onto the form panel. Auto-detects `kind` from the file. |
| **Export YAML** | Toolbar "Export" button — downloads `<rubric_id>.yaml` |
| **Schema validation** | Status bar shows error count and first 4 errors in real time |
| **Copy YAML** | Copy button in the preview panel header |

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the built output
```

## Schema sources

`src/schemas/` contains copies of the canonical JSON schemas from `../../standard/schemas/`. After editing the canonical schemas, re-copy:

```bash
cp ../../standard/schemas/rubric.schema.json src/schemas/
cp ../../standard/schemas/evaluation.schema.json src/schemas/
```

## Stack

- React 18 + TypeScript
- [JSON Forms](https://jsonforms.io/) + Material UI renderers
- MUI v5
- js-yaml (YAML ↔ JSON)
- ajv v8 (schema validation)
- Vite 5
