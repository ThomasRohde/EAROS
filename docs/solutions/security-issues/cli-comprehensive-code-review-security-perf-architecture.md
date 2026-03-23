---
title: "EaROS CLI comprehensive code review: 28 findings across security, performance, architecture, type safety, agent parity"
category: security-issues
date: 2026-03-23
tags:
  - code-review
  - path-traversal
  - typescript-strict-mode
  - dead-code-removal
  - performance-optimization
  - cli-architecture
  - express-server
  - agent-parity
  - type-safety
  - earos-cli
severity: high
component:
  - tools/editor/src/serve.ts
  - tools/editor/bin.js
  - tools/editor/src/init.ts
  - tools/editor/src/export-docx.ts
  - tools/editor/manifest-cli.mjs
  - tools/editor/src/utils/validate.ts
  - tools/editor/src/utils/export-markdown.ts
  - tools/editor/src/components/AssessmentSummary.tsx
  - tools/editor/package.json
  - tools/editor/tsconfig.server.json
root_cause_type: accumulated-tech-debt
resolution_type: multi-phase-refactor
---

# EaROS CLI Comprehensive Code Review — 28 Findings

## Problem

A 6-agent code review of the EaROS CLI (`tools/editor/`, ~3300 lines TypeScript/JavaScript) identified 28 findings across security, performance, architecture, type safety, agent parity, and code simplification. The CLI had grown organically with no prior comprehensive review, accumulating technical debt across multiple concern areas.

**Key symptoms:**
- Path traversal bypass in `safeRepoPath()` — `startsWith` without trailing separator allowed access to sibling directories
- Express server bound to `0.0.0.0`, exposing file read/write API to the local network
- Dead TypeScript source files (`cli.ts`, `manifest-cli.ts`) that were never compiled, creating contributor confusion
- CLI export command hardcoded to artifact kind only — rubrics and evaluations rejected
- No structured JSON output for any CLI command, blocking agent/CI integration
- Sequential icon downloads in `earos init --icons` (3 cloud packages one-at-a-time)
- `strict: false` in TypeScript configs with 49+ `any` usages
- Silent validation bypass — schema compilation failure returned `valid: true`

## Root Cause

Six independent root causes identified:

1. **Security:** `safeRepoPath` used `abs.startsWith(repoRoot)` without appending a path separator. On a system where `repoRoot = /projects/EAROS`, the path `/projects/EAROS-evil/secret.yaml` would pass the check. The server's `app.listen(port)` call omitted the host parameter, defaulting to `0.0.0.0`. The `resolveLocalMermaidImage` function had no containment check for `..` segments after the `/icons/` prefix.

2. **Dead code:** `src/cli.ts` (78 lines) was described as a "TypeScript source reference for bin.js" but was never in any `tsconfig.json` files array. It had diverged from `bin.js` (missing `init`, `export`, `manifest`, `dev` commands). Similarly, `manifest-cli.ts` existed alongside `manifest-cli.mjs` but was never compiled.

3. **Agent parity:** The `earos export` command checked `if (artifactData?.kind !== 'artifact')` and rejected all other kinds. No `--json` flag existed on any command.

4. **Performance:** The `for (const config of ICON_PACKAGES)` loop in `init.ts` awaited each download sequentially. The `createIconAliases` function used `.sort()[0]` (O(n log n)) instead of a linear max-scan (O(n)).

5. **Type safety:** Both `tsconfig.json` and `tsconfig.server.json` had `strict: false`. The `getGateSeverity` function was duplicated in `AssessmentSummary.tsx` and `score-helpers.tsx`.

6. **Silent fail-open:** In `validate.ts`, when `ajv.compile(schema)` threw an error, the catch block returned `null`, and the caller treated `null` as "valid" — meaning a broken schema silently validated everything.

## Solution

Implemented across 5 phases, published as `@trohde/earos@1.3.0`.

### Phase 1 — Security Hardening

**Path traversal fix** (the most critical finding):

```typescript
// BEFORE (vulnerable)
function safeRepoPath(repoRoot: string, rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(repoRoot, decoded)
  if (!abs.startsWith(repoRoot)) return null  // EAROS-evil passes!
  return abs
}

// AFTER (fixed)
import { sep } from 'path'

function safeRepoPath(repoRoot: string, rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(repoRoot, decoded)
  if (abs !== repoRoot && !abs.startsWith(repoRoot + sep)) return null
  return abs
}
```

**Other security fixes:**
- Bound Express to `127.0.0.1` with `EAROS_HOST` env var override for Docker/WSL2
- Added `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` headers
- Sanitized 500 error responses — no more filesystem path leaks
- Scoped body limits: 1MB default, 5MB for file writes, 25MB for exports
- Restricted `POST /api/file/*` to `.yaml`/`.yml` extensions only
- Added containment check to `resolveLocalMermaidImage` with `baseDir + sep`

### Phase 2 — Dead Code Removal

- Deleted `src/cli.ts` (78 lines)
- Deleted `manifest-cli.ts` (diverged from `manifest-cli.mjs`)
- Updated `manifest-cli.mjs` header comment

### Phase 3 — Agent Parity

- Extended `earos export` to handle `artifact`, `evaluation`, `core_rubric`, `profile`, and `overlay` kinds
- Added `--format md` for Markdown export (artifact and rubric)
- Added `--json` flag to `earos validate` and `earos manifest check`
- Added `earos manifest list [--json]` command
- Added `earos list evaluations [--json]` command

### Phase 4 — Performance

```typescript
// BEFORE: sequential icon downloads
for (const config of ICON_PACKAGES) {
  const result = await downloadIconPackage(target, config)
}

// AFTER: parallel with Promise.allSettled
const settled = await Promise.allSettled(
  ICON_PACKAGES.map(config => downloadIconPackage(target, config))
)
```

- Replaced `sort()[0]` with linear max-scan in alias matching
- Lazy-loaded `ARTIFACT_SCHEMA` via `getArtifactSchema()` function

### Phase 5 — Code Quality

- Enabled `strict: true` in `tsconfig.server.json` (compiled with zero errors)
- De-duplicated `getGateSeverity` — `AssessmentSummary.tsx` now imports from `score-helpers.tsx`
- Moved `mermaid` from `dependencies` to `devDependencies` (Vite bundles it into dist/)
- Fixed silent validation bypass to fail-closed:
  ```typescript
  // BEFORE: catch returns null → caller treats as valid
  } catch { return null }

  // AFTER: catch returns a validator that always fails
  } catch (e) {
    console.warn('[validate] Schema compilation failed:', e)
    const failValidator = Object.assign(
      () => false,
      { errors: [{ instancePath: '', message: 'Schema compilation failed' }] }
    ) as unknown as ReturnType<typeof ajv.compile>
    cache.set(key, failValidator)
    return failValidator
  }
  ```
- Added 5-second TTL cache for evaluation file endpoint scans

## Verification Steps

1. **Build:** `npm run build` completed with zero errors under `strict: true`
2. **CLI commands:** Tested `earos validate` (human + `--json`), `earos export` (all 3 kinds + `--format md`), `earos manifest check --json`, `earos manifest list`, `earos list evaluations --json`
3. **Browser tests:** Verified home screen, rubric editor (load EAROS-REFARCH-001), assessment wizard (4-step flow), evaluation viewer (19 criteria loaded), security headers present in HTTP responses, path traversal blocked (`../EAROS-evil/` returns 403), YAML-only write restriction enforced
4. **Published** as `@trohde/earos@1.3.0` via CI pipeline (GitHub Actions)

## Prevention Strategies

### Path Traversal Prevention
- **Canonical pattern:** Always append `path.sep` before `startsWith` comparison. Wrap in a single `assertWithinDirectory(base, candidate)` utility.
- **CI check:** Grep for `.startsWith(` on path variables without adjacent `path.sep` concatenation.

### Server Binding
- **Rule:** Every `app.listen()` must specify an explicit bind address. Single-argument `listen()` calls should fail linting.

### Fail-Closed Validation
- **Rule:** Validation functions must never return "valid" on error. Every `catch` block in a validation path must either re-throw or return a failure result.
- **Test requirement:** Every validation function needs a test with a corrupt/missing schema asserting failure.

### Agent Parity
- **Design principle:** Every CLI command must support `--json`. This is non-negotiable for agent-native tools.
- **Test:** Parameterized test asserting `--json` produces valid JSON for every registered command.

### TypeScript Strict Mode
- **CI guardrail:** Verify `strict: true` stays enabled in `tsconfig.json`:
  ```bash
  node -e "const c = require('./tsconfig.json'); if (!c.compilerOptions.strict) process.exit(1)"
  ```

### Dead Code Detection
- **CI check:** Compare `.ts` files on disk against `tsc --listFiles` output. Any uncompiled `.ts` under `src/` fails the build.

## Code Review Checklist (Express + CLI)

### Express Server
- [ ] Every `app.listen()` specifies an explicit bind address
- [ ] File path validation uses `resolve()` + separator-appended `startsWith`
- [ ] Error handlers do not leak stack traces or internal paths
- [ ] Security headers set (`X-Content-Type-Options`, `X-Frame-Options`)
- [ ] Body parser limits scoped per route based on actual need

### CLI Tool
- [ ] Every command supports `--json` for structured output
- [ ] Validation failures produce structured error output
- [ ] No `catch` block silently swallows errors in validation paths

### TypeScript / Build
- [ ] `tsconfig.json` has `strict: true`
- [ ] Every `.ts` file under `src/` is included in compilation
- [ ] Shared logic lives in `utils/`, not duplicated across files

## Related Documents

- **Prior art:** [Site review findings plan](../../docs/plans/2026-03-23-001-refactor-site-review-findings-plan.md) — same review-then-fix methodology applied to the `site/` frontend (26 findings, 8 agents)
- **Implementation plan:** [CLI review findings plan](../../docs/plans/2026-03-23-002-refactor-cli-review-findings-plan.md) — the detailed 5-phase plan for this work
- **Review agents used:** Security Sentinel, Performance Oracle, Architecture Strategist, Kieran TypeScript Reviewer, Agent-Native Reviewer, Code Simplicity Reviewer
