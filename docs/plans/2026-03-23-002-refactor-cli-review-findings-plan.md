---
title: "refactor: Address 28 EaROS CLI code review findings"
type: refactor
status: completed
date: 2026-03-23
---

# refactor: Address 28 EaROS CLI Code Review Findings

## Overview

A comprehensive 6-agent code review of the EaROS CLI (`@trohde/earos` v1.2.0 at `tools/editor/`) identified 28 findings across security, performance, architecture, type safety, agent parity, and simplification. This plan organizes them into 5 phases ordered by risk and dependency, with each phase independently shippable as a version bump.

**Review agents used:** Security Sentinel, Performance Oracle, Architecture Strategist, Kieran TypeScript Reviewer, Agent-Native Reviewer, Code Simplicity Reviewer.

## Problem Statement

The CLI works correctly for its current user base but has:
- **Security gaps** (path traversal bypass, network-exposed API, no security headers) that could allow file read/write from adjacent machines or directories
- **Dead code** (`cli.ts`, `manifest-cli.ts`) creating contributor confusion
- **Agent parity gaps** — the CLI cannot export rubrics/evaluations to DOCX, has no `--json` output, and lacks evaluation listing without the server
- **Performance inefficiencies** — sequential icon downloads, uncached filesystem scans
- **Type safety debt** — `strict: false`, 49+ `any` usages, silent validation bypass

## Proposed Solution

Five phases, each independently committable and publishable:

1. **Security Hardening** — fix path traversal, bind to localhost, add headers (patch bump)
2. **Dead Code & Simplification** — delete dead files, extract shared utils (patch bump)
3. **CLI Agent Parity** — extend export, add `--json` flags, new list commands (minor bump)
4. **Performance** — parallelize downloads, lazy-load schema (patch bump)
5. **Code Quality** — enable strict mode, de-duplicate, move mermaid dep (patch bump)

---

## Technical Approach

### Phase 1: Security Hardening

**Estimated effort:** Small (1-2 hours). All changes are in `bin.js` and `serve.ts`/`serve.js`.

#### 1.1 Fix `safeRepoPath()` path traversal bypass

**File:** `tools/editor/src/serve.ts:28-33`, compiled to `tools/editor/serve.js:24-30`

The current `abs.startsWith(repoRoot)` check allows access to sibling directories whose names share the same prefix (e.g., `EAROS-private/` when repo root is `EAROS`).

```typescript
// serve.ts — BEFORE
function safeRepoPath(repoRoot: string, rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(repoRoot, decoded)
  if (!abs.startsWith(repoRoot)) return null
  return abs
}

// serve.ts — AFTER
import { sep } from 'path'

function safeRepoPath(repoRoot: string, rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(repoRoot, decoded)
  // Append separator to prevent prefix collisions (e.g., EAROS vs EAROS-private)
  if (abs !== repoRoot && !abs.startsWith(repoRoot + sep)) return null
  return abs
}
```

Additionally, restrict `POST /api/file/*` writes to YAML files only:

```typescript
// serve.ts — POST handler, add after safeRepoPath check
if (!absPath.endsWith('.yaml') && !absPath.endsWith('.yml')) {
  res.status(400).json({ error: 'Only YAML files can be written' })
  return
}
```

- [ ] Fix `safeRepoPath()` with trailing separator — `serve.ts:28-33`
- [ ] Restrict POST writes to `.yaml`/`.yml` extensions — `serve.ts:140`
- [ ] Apply the same fixes to compiled `serve.js`

#### 1.2 Bind Express to localhost

**File:** `tools/editor/src/serve.ts:239`, compiled to `tools/editor/serve.js:231`

```typescript
// BEFORE
app.listen(port, () => { ... })

// AFTER — default to localhost, allow override for Docker/WSL2
const host = process.env.EAROS_HOST ?? '127.0.0.1'
app.listen(port, host, () => { ... })
```

- [ ] Bind to `127.0.0.1` with `EAROS_HOST` env var override — `serve.ts:239`
- [ ] Update help text in `bin.js` to document `EAROS_HOST` — `bin.js:81-92`

#### 1.3 Fix Mermaid image path traversal

**File:** `tools/editor/src/export-docx.ts` (search for `resolveLocalMermaidImage`), compiled to `export-docx.js:48-56`

```typescript
// AFTER — add containment check
function resolveLocalMermaidImage(assetPath: string): string | null {
  const relativePath = assetPath.replace(/^\/+/, '')
  for (const baseDir of LOCAL_MERMAID_IMAGE_DIRS) {
    const candidate = resolve(baseDir, relativePath)
    if (!candidate.startsWith(baseDir + sep)) continue  // containment check
    if (existsSync(candidate)) return candidate
  }
  return null
}
```

- [ ] Add containment check to `resolveLocalMermaidImage` — `export-docx.ts`

#### 1.4 Add security headers

**File:** `tools/editor/src/serve.ts`, after `app.use(express.json(...))`

```typescript
// Security headers (no dependency needed — manual is fine for a local tool)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  next()
})
```

- [ ] Add security headers middleware — `serve.ts`, after line 63

#### 1.5 Sanitize error messages

Replace `String(e)` in API error responses with generic messages:

```typescript
// BEFORE
res.status(500).json({ error: String(e) })

// AFTER
console.error('[API error]', e)
res.status(500).json({ error: 'Internal server error' })
```

Apply to all 5 error handlers in `serve.ts` (lines 134, 149, 179, 197, 215). Keep the 400-level errors as-is (they return controlled messages, not exception details).

- [ ] Sanitize 500-level error responses in all API handlers — `serve.ts`

#### 1.6 Scope JSON body limit

The 25MB limit is only needed by the DOCX export routes. `POST /api/file/*` could receive large artifacts, so use 5MB there.

```typescript
// Global default
app.use(express.json({ limit: '1mb' }))

// Per-route overrides
const largeBody = express.json({ limit: '25mb' })
app.post('/api/export/docx', largeBody, async (req, res) => { ... })
app.post('/api/export/docx/rubric', largeBody, async (req, res) => { ... })
app.post('/api/export/docx/evaluation', largeBody, async (req, res) => { ... })

const mediumBody = express.json({ limit: '5mb' })
app.post('/api/file/*', mediumBody, (req, res) => { ... })
```

- [ ] Set global body limit to 1MB — `serve.ts:63`
- [ ] Set 25MB limit on export routes — `serve.ts:154,183,201`
- [ ] Set 5MB limit on file write route — `serve.ts:140`

#### 1.7 Rebuild server files

After all Phase 1 changes to `.ts` source files:

- [ ] Run `tsc -p tsconfig.server.json` to recompile `serve.js` and `export-docx.js`

---

### Phase 2: Dead Code & Simplification

**Estimated effort:** Small (30 min). Low-risk deletions and extractions.

#### 2.1 Delete `src/cli.ts`

This 78-line file is dead code. It is not in `tsconfig.server.json`'s `files` array, not imported by anything, and has diverged from `bin.js` (missing `init`, `export`, `manifest`, `dev` commands). The header comment says "The compiled output is NOT used."

- [ ] Delete `tools/editor/src/cli.ts`
- [ ] Verify it is not referenced in any tsconfig `include` or `files` array

#### 2.2 Delete `manifest-cli.ts`

This file is not compiled (not in `tsconfig.server.json`). The actual runtime file is `manifest-cli.mjs` (hand-maintained). The `.ts` file has diverged — it hardcodes `REPO_ROOT` as `resolve(__dir, '../..')` while the `.mjs` reads from `process.env.EAROS_REPO_ROOT`.

- [ ] Delete `tools/editor/manifest-cli.ts`
- [ ] Remove the stale header comment in `manifest-cli.mjs` that says "source is manifest-cli.ts"

#### 2.3 Import manifest-cli directly (optional, defer if risky)

Currently `bin.js` spawns `manifest-cli.mjs` as a child process via `spawnSync`. This works but adds process overhead and requires env-var IPC. The simplest improvement is to export a function from `manifest-cli.mjs` and import it:

**Decision:** Defer to a later iteration. The current `spawnSync` approach works, and refactoring `manifest-cli.mjs` to remove its 7 `process.exit()` calls is a medium-effort change with marginal benefit. Keep as a future cleanup.

- [ ] Update `manifest-cli.mjs` header comment to remove false "compiled" claim

#### 2.4 De-duplicate `findRepoRoot()`

This function is duplicated in `bin.js:14-20` and `serve.ts:19-26`. Since `bin.js` is hand-written JS and `serve.ts` is compiled, the cleanest approach is to keep both but ensure they stay identical. Document this in a comment.

**Decision:** Low priority given Phase 2.3 is deferred. Leave as-is with a comment.

---

### Phase 3: CLI Agent Parity

**Estimated effort:** Medium (2-3 hours). Extends `bin.js` with new commands and flags.

#### 3.1 Extend `earos export` to all YAML kinds

**File:** `tools/editor/bin.js:94-130`

Currently rejects non-artifact files. Detect `kind` field and route to the appropriate export function:

```javascript
// bin.js — replace the artifact-only check
const kind = artifactData?.kind
if (kind === 'artifact' || !kind) {
  const { exportToDocx } = await import('./export-docx.js')
  const buf = await exportToDocx(artifactData)
  // ... write file
} else if (kind === 'evaluation') {
  const { exportEvaluationToDocx } = await import('./export-docx.js')
  const buf = await exportEvaluationToDocx(artifactData)
  const outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '-assessment.docx'
  // ... write file
} else if (kind === 'core_rubric' || kind === 'profile' || kind === 'overlay') {
  const { exportRubricToDocx } = await import('./export-docx.js')
  const buf = await exportRubricToDocx(artifactData)
  // ... write file
} else {
  console.error(`Unsupported kind for export: ${kind}`)
  process.exit(1)
}
```

- [ ] Extend `earos export` to detect `kind` and route to appropriate exporter — `bin.js:94-130`
- [ ] Update help text to reflect all supported kinds — `bin.js:87`

#### 3.2 Add `--json` flag to `earos validate`

**Convention:** `--json` mode outputs only JSON to stdout; all status/error messages go to stderr.

```javascript
// bin.js — in validateFile()
const jsonMode = args.includes('--json')

if (valid) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify({ valid: true, kind: kind ?? 'unknown', file: filePath }) + '\n')
  } else {
    console.log(`✓ ${filePath} is valid (kind: ${kind ?? 'unknown'})`)
  }
} else {
  const result = {
    valid: false,
    file: filePath,
    kind: kind ?? 'unknown',
    errors: validate.errors.map(err => ({
      path: err.instancePath || '(root)',
      message: err.message
    }))
  }
  if (jsonMode) {
    process.stdout.write(JSON.stringify(result) + '\n')
  } else {
    console.error(`✗ ${filePath} — ${validate.errors.length} error(s):`)
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || '(root)'} ${err.message}`)
    }
  }
  process.exit(1)
}
```

- [ ] Add `--json` flag to `earos validate` — `bin.js:31-76`
- [ ] Update help text — `bin.js:87`

#### 3.3 Add `--json` flag to `earos manifest check`

```javascript
// manifest-cli.mjs — in the check block
const jsonMode = subArgs.includes('--json')

// At the end of check:
if (jsonMode) {
  process.stdout.write(JSON.stringify({ consistent: errors.length === 0, errors, warnings }) + '\n')
  process.exit(errors.length > 0 ? 1 : 0)
}
```

- [ ] Add `--json` flag to `earos manifest check` — `manifest-cli.mjs:151-202`

#### 3.4 Add `earos manifest list [--json]`

New subcommand that outputs the manifest contents.

```javascript
// manifest-cli.mjs — add before the "Unknown subcommand" block
if (subCmd === 'list') {
  const manifest = loadManifest()
  if (!manifest) {
    console.error('No earos.manifest.yaml found. Run `earos manifest` first.')
    process.exit(1)
  }
  if (subArgs.includes('--json')) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + '\n')
  } else {
    const sections = ['core', 'profiles', 'overlays']
    for (const section of sections) {
      const entries = manifest[section] ?? []
      if (entries.length === 0) continue
      console.log(`\n${section}:`)
      for (const e of entries) {
        console.log(`  ${e.path}  ${e.rubric_id ?? ''}  ${e.title ?? ''}`)
      }
    }
  }
  process.exit(0)
}
```

- [ ] Add `earos manifest list [--json]` — `manifest-cli.mjs`
- [ ] Update help text in `bin.js:91`

#### 3.5 Add `earos list evaluations [--json]`

Extract `findEvaluationFiles` from `serve.ts`'s `startServer()` closure into a standalone function, then reuse in `bin.js`.

The simplest approach: duplicate the 15-line scan function in `bin.js` (it's pure `fs` operations). This avoids coupling `bin.js` to `serve.js`.

```javascript
// bin.js — new command block
} else if (args[0] === 'list' && args[1] === 'evaluations') {
  const REPO_ROOT = findRepoRoot()
  const jsonMode = args.includes('--json')
  // ... inline findEvaluationFiles + summary logic
}
```

- [ ] Add `earos list evaluations [--json]` command — `bin.js`
- [ ] Include summary metadata (status, score, date, title) in output
- [ ] Update help text — `bin.js:81-92`

#### 3.6 Add Markdown export (`earos export <file> --format md`)

The `exportArtifactToMarkdown`, `exportRubricToMarkdown` functions in `src/utils/export-markdown.ts` are pure functions (no DOM dependency) except for `downloadAsFile()` which uses `document.createElement`. To make them available in Node.js:

1. Add `src/utils/export-markdown.ts` to `tsconfig.server.json`'s `files` array
2. Guard `downloadAsFile` with `typeof document !== 'undefined'`
3. Import in `bin.js` when `--format md` is passed

Note: `exportEvaluationToMarkdown` has a different signature (takes 4 args instead of 1). The CLI would need to handle that or skip it initially.

**Decision:** Implement for artifact and rubric only in this phase. Evaluation Markdown export requires assembling dimension/result data that the CLI does not currently load.

- [ ] Guard `downloadAsFile` with environment check — `export-markdown.ts:39`
- [ ] Add `export-markdown.ts` to `tsconfig.server.json` `files` array
- [ ] Add `--format` flag to `earos export` (`docx` default, `md` alternative) — `bin.js`

---

### Phase 4: Performance

**Estimated effort:** Small (30-60 min). Isolated changes with clear impact.

#### 4.1 Parallelize icon downloads

**File:** `tools/editor/src/init.ts:396-406`

```typescript
// BEFORE
for (const config of ICON_PACKAGES) {
  const result = await downloadIconPackage(target, config)
  results.push(result)
}

// AFTER
const settled = await Promise.allSettled(
  ICON_PACKAGES.map(config => downloadIconPackage(target, config))
)
for (const outcome of settled) {
  if (outcome.status === 'fulfilled') {
    results.push(outcome.value)
    if (outcome.value.missingAliases.length) {
      console.warn(`  Missing ${outcome.value.name} icon aliases: ${outcome.value.missingAliases.join(', ')}`)
    }
  } else {
    console.error(`  Failed to download icons: ${outcome.reason?.message ?? outcome.reason}`)
  }
}
```

**Note:** Parallel downloads may interleave console output. This is acceptable.

- [ ] Replace sequential icon download loop with `Promise.allSettled` — `init.ts:396-406`

#### 4.2 Replace sort-for-max with linear scan

**File:** `tools/editor/src/init.ts:312-316`

```typescript
// BEFORE
const bestCandidate = extractedEntries
  .map(entry => ({ entry, score: scoreAliasCandidate(entry, spec, config) }))
  .filter(c => Number.isFinite(c.score))
  .sort((a, b) => b.score - a.score)[0]

// AFTER
let bestScore = Number.NEGATIVE_INFINITY
let bestEntry: ExtractedIconEntry | null = null
for (const entry of extractedEntries) {
  const score = scoreAliasCandidate(entry, spec, config)
  if (score > bestScore) {
    bestScore = score
    bestEntry = entry
  }
}
```

- [ ] Replace `sort()[0]` with linear max-scan in `createIconAliases` — `init.ts:312-316`

#### 4.3 Lazy-load artifact schema

**File:** `tools/editor/src/export-docx.ts` (search for `ARTIFACT_SCHEMA`)

```typescript
// BEFORE
const ARTIFACT_SCHEMA = loadArtifactSchema()

// AFTER
let _artifactSchema: Record<string, any> | null | undefined
function getArtifactSchema() {
  if (_artifactSchema === undefined) {
    _artifactSchema = loadArtifactSchema()
  }
  return _artifactSchema
}
```

Replace all references to `ARTIFACT_SCHEMA` with `getArtifactSchema()`.

- [ ] Lazy-load `ARTIFACT_SCHEMA` on first use — `export-docx.ts`

#### 4.4 Rebuild server files

- [ ] Run `tsc -p tsconfig.server.json` to recompile `init.js` and `export-docx.js`

---

### Phase 5: Code Quality & Architecture

**Estimated effort:** Medium-Large (3-5 hours). The `strict: true` migration is the largest item.

#### 5.1 Enable strict mode incrementally

**File:** `tools/editor/tsconfig.server.json`

**Step 1:** Run `tsc -p tsconfig.server.json --strict --noEmit 2>&1 | wc -l` to assess error count.

**Step 2:** Enable `strictNullChecks` and `noImplicitAny` first (the highest-value flags):

```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

**Step 3:** Fix resulting errors in `serve.ts`, `init.ts`, and `export-docx.ts`. For `export-docx.ts`, the 42+ `any` usages can be addressed by:
- Typing section renderer parameters with interfaces derived from `artifact.schema.json`
- Replacing `as any` casts with narrowing checks
- Adding `unknown` instead of `any` for truly dynamic data

**Step 4:** Once those two flags pass, enable full `strict: true`.

- [ ] Assess strict mode error count — `tsconfig.server.json`
- [ ] Enable `strictNullChecks` + `noImplicitAny` and fix errors
- [ ] Enable full `strict: true` and fix remaining errors

#### 5.2 De-duplicate `getGateSeverity`

**File:** `tools/editor/src/components/AssessmentSummary.tsx:40`

The function is duplicated in `AssessmentSummary.tsx` and `score-helpers.tsx`. Gate logic must have a single source of truth.

```typescript
// AssessmentSummary.tsx — BEFORE
function getGateSeverity(gate: any): string { ... }

// AssessmentSummary.tsx — AFTER
import { getGateSeverity } from '../utils/score-helpers'
```

- [ ] Remove duplicate `getGateSeverity` from `AssessmentSummary.tsx`, import from `score-helpers.tsx`

#### 5.3 Move `mermaid` to devDependencies

**File:** `tools/editor/package.json:61`

**Prerequisite:** Verify the Vite build fully bundles mermaid into `dist/`. Steps:
1. Move `mermaid` from `dependencies` to `devDependencies`
2. Run `npm run build`
3. Run `npm pack` to create tarball
4. Install tarball in a temp directory: `npm install /path/to/trohde-earos-*.tgz`
5. Run `npx earos --help` — if it works, mermaid is fully bundled
6. Start the server and load the editor — verify Mermaid diagrams render

- [ ] Move `mermaid` to `devDependencies` — `package.json`
- [ ] Verify Vite bundle is self-contained after the move

#### 5.4 Extract shared helpers

Create `tools/editor/src/utils/format-helpers.ts`:

```typescript
export function str(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

export function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export const SECTION_ORDER = [ /* ... shared constant ... */ ]
```

Then update imports in `export-docx.ts` (rename `prettyLabel` to `humanize`) and `export-markdown.ts`.

Also extract `extractDiagrams` and `DIAGRAM_FIELDS` into `utils/diagrams.ts` for sharing between `export-docx.ts` and `mermaid.ts`.

- [ ] Create `src/utils/format-helpers.ts` with shared `str`, `humanize`, `isPlainObject`, `SECTION_ORDER`
- [ ] Create `src/utils/diagrams.ts` with shared `extractDiagrams` and `DIAGRAM_FIELDS`
- [ ] Update `export-docx.ts` to import from shared modules (rename `prettyLabel` to `humanize`)
- [ ] Update `export-markdown.ts` to import from shared modules
- [ ] Update `mermaid.ts` to import `DIAGRAM_FIELDS` from shared module

#### 5.5 Extract document shell boilerplate

The `Document` construction with Header, Footer, margins, packing is copy-pasted across 3 export functions. Extract a `buildDocShell` factory.

```typescript
// export-docx.ts — new shared function
function buildDocShell(opts: {
  title: string
  creator: string
  headerLabel: string
  children: Paragraph[]
}): Buffer {
  const doc = new Document({
    creator: opts.creator,
    title: opts.title,
    // ... shared margins, header, footer, ToC pattern
    sections: [{ children: opts.children }]
  })
  return Packer.toBuffer(doc)
}
```

- [ ] Extract `buildDocShell` from the 3 export functions — `export-docx.ts`

#### 5.6 Fix silent validation bypass

**File:** `tools/editor/src/utils/validate.ts:27-28`

```typescript
// BEFORE
try {
  cache.set(key, ajv.compile(rest))
} catch {
  return null  // Caller treats null as "valid"!
}

// AFTER
try {
  cache.set(key, ajv.compile(rest))
} catch (e) {
  console.warn('[validate] Schema compilation failed:', e)
  // Return a validator that always fails with a clear message
  const failValidator = (() => false) as any
  failValidator.errors = [{ instancePath: '', message: 'Schema compilation failed' }]
  cache.set(key, failValidator)
  return failValidator
}
```

- [ ] Fix schema compilation failure to report invalid instead of valid — `validate.ts:27`

#### 5.7 Add Express server caching for evaluation endpoints

**File:** `tools/editor/src/serve.ts:87-123`

Add a simple TTL cache for evaluation file scans:

```typescript
let evalCache: { files: Array<{ path: string; name: string }>; ts: number } | null = null
const EVAL_CACHE_TTL = 5000 // 5 seconds

function getCachedEvaluationFiles(repoRoot: string): Array<{ path: string; name: string }> {
  if (evalCache && Date.now() - evalCache.ts < EVAL_CACHE_TTL) return evalCache.files
  const files: Array<{ path: string; name: string }> = []
  for (const dir of ['examples', 'evaluations']) {
    files.push(...findEvaluationFiles(resolve(repoRoot, dir), `${dir}/`))
  }
  evalCache = { files, ts: Date.now() }
  return files
}
```

- [ ] Add TTL cache for evaluation file scans — `serve.ts`
- [ ] Invalidate cache on POST /api/file/* writes to evaluation paths

#### 5.8 Rebuild all server files

- [ ] Run `tsc -p tsconfig.server.json` to recompile all server files
- [ ] Run `npm run build` for full rebuild

---

## System-Wide Impact

- **Build pipeline:** Phases 3 and 5 modify `tsconfig.server.json` (adding `export-markdown.ts` to files, enabling strict flags). The 4-stage build (`tsc server → tsc check → vite build → build:assets`) is unchanged.
- **Published package:** The `files` array in `package.json` does not change. Compiled `.js` files are updated in place. No new files ship to npm (shared utils are compiled into their consumers by `tsc`).
- **Breaking changes:** Phase 1 changes the default bind address from `0.0.0.0` to `127.0.0.1`. Users running the server in Docker/WSL2 must set `EAROS_HOST=0.0.0.0`. Document in the changelog.
- **Backward compatibility:** All existing CLI commands continue to work unchanged. New flags (`--json`, `--format`) are additive. The `earos export` extension is backward-compatible (existing artifact exports work the same).

## Acceptance Criteria

### Phase 1 — Security
- [ ] `safeRepoPath` rejects paths to sibling directories (e.g., `../EAROS-evil/`)
- [ ] Server only listens on `127.0.0.1` by default
- [ ] `resolveLocalMermaidImage` rejects `..` traversal beyond icon directories
- [ ] API 500 responses do not leak filesystem paths
- [ ] POST `/api/file/*` rejects non-YAML file extensions
- [ ] JSON body >1MB rejected on non-export routes

### Phase 2 — Dead Code
- [ ] `src/cli.ts` deleted
- [ ] `manifest-cli.ts` deleted
- [ ] `manifest-cli.mjs` header comment updated

### Phase 3 — Agent Parity
- [ ] `earos export evaluation.yaml` produces a DOCX file
- [ ] `earos export rubric.yaml` produces a DOCX file
- [ ] `earos validate --json` outputs valid JSON to stdout
- [ ] `earos manifest check --json` outputs valid JSON to stdout
- [ ] `earos manifest list` outputs manifest contents
- [ ] `earos list evaluations --json` discovers and lists evaluation files
- [ ] `earos export artifact.yaml --format md` produces a Markdown file
- [ ] Help text (`earos --help`) documents all new commands and flags

### Phase 4 — Performance
- [ ] `earos init --icons` downloads all 3 icon packages in parallel
- [ ] Alias matching uses linear scan instead of sort
- [ ] `ARTIFACT_SCHEMA` is not loaded until first export

### Phase 5 — Code Quality
- [ ] `tsconfig.server.json` has `strict: true`
- [ ] `getGateSeverity` exists in one place only (`score-helpers.tsx`)
- [ ] `mermaid` is in `devDependencies`, editor still renders diagrams
- [ ] Shared helpers extracted to `format-helpers.ts` and `diagrams.ts`
- [ ] Document shell boilerplate exists once as `buildDocShell`
- [ ] Schema compilation failure reports validation error (not silent pass)
- [ ] Evaluation endpoints use cached file scans

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| `strict: true` surfaces hundreds of errors in `export-docx.ts` | Incremental approach: `strictNullChecks` + `noImplicitAny` first |
| Moving `mermaid` to devDeps breaks runtime | Verify with `npm pack` + clean install before publishing |
| Localhost binding breaks Docker users | `EAROS_HOST` env var override documented in help text |
| Body limit reduction breaks large artifact saves | 5MB limit for `/api/file/*` (well above typical artifact size) |
| `export-markdown.ts` has browser-only `downloadAsFile` | Guard with `typeof document` check before adding to server build |

## Implementation Order

```
Phase 1 (Security) ──→ Phase 2 (Dead Code) ──→ Phase 3 (Agent Parity)
                                                       │
Phase 4 (Performance) ─────────────────────────────────┤
                                                       │
                                             Phase 5 (Code Quality)
```

Phases 1 and 4 are independent and can run in parallel. Phase 3 depends on Phase 2 (dead code removal first). Phase 5 depends on Phase 3 (shared helper extraction benefits from the new `export-markdown.ts` server build target).

## Version Bump Strategy

| Phase | Bump | Version |
|-------|------|---------|
| Phase 1: Security | patch | 1.2.1 |
| Phase 2: Dead code | patch | 1.2.2 |
| Phase 3: Agent parity | minor | 1.3.0 |
| Phase 4: Performance | patch | 1.3.1 |
| Phase 5: Code quality | patch | 1.3.2 |

Or combine Phases 1+2 into one patch and 4+5 into another, yielding: `1.2.1 → 1.3.0 → 1.3.1`.

## Sources & References

### Internal References
- Prior art: `docs/plans/2026-03-23-001-refactor-site-review-findings-plan.md` — same review-then-fix pattern applied to the `site/` frontend
- Path traversal guard: `tools/editor/src/serve.ts:28-33`
- CLI dispatch: `tools/editor/bin.js:80-188`
- Export pipeline: `tools/editor/src/export-docx.ts` (~1770 lines)
- Server build config: `tools/editor/tsconfig.server.json`
- Package config: `tools/editor/package.json`

### Review Agents
- Security Sentinel: 2 HIGH, 4 MEDIUM, 3 LOW findings
- Performance Oracle: 3 CRITICAL, 8 optimization opportunities
- Architecture Strategist: 8 findings on patterns, drift, dead code
- Kieran TypeScript Reviewer: strict mode, 42+ `any` usages, duplication
- Agent-Native Reviewer: 16/20 capabilities agent-accessible, 4 gaps
- Code Simplicity Reviewer: ~175 LOC removable (5.3%), 5 simplification opportunities
