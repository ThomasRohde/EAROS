---
title: "refactor: Fix all site code review findings"
type: refactor
status: completed
date: 2026-03-23
---

# refactor: Fix all site code review findings

## Overview

Address all 26 findings from a comprehensive 8-agent code review of the EaROS documentation site (`site/src/`). The review covered TypeScript quality, security, performance, architecture, pattern recognition, code simplicity, and agent-native parity. Findings range from render-blocking unused fonts (P1) to minor dead code (P3).

The site is a React 18 + TypeScript + MUI 7 + Vite 5 SPA deployed to GitHub Pages at `/EAROS/`.

## Problem Statement

The site works correctly but has accumulated technical debt across several dimensions:
- **Performance:** 2.7MB unoptimized image, unused render-blocking fonts, oversized highlight.js bundle, eagerly bundled markdown content
- **Type safety:** `strict: false` in tsconfig means TypeScript provides no safety guarantees
- **Code duplication:** ~290 lines of duplicated color-mapping, sidebar, heading, and card hover patterns across 4+ files, with inconsistencies already emerging (opacity 0.08 vs 0.12 in dark mode)
- **Architecture:** 1,190-line DemoPage monolith, no 404 route, drifting theme copy, MUI in devDependencies
- **Agent accessibility:** Zero web-agent discovery mechanisms (no robots.txt, sitemap.xml, llms.txt)
- **Dead code:** Unused refs, fields, and code branches in TerminalDemo and DemoPage

## Proposed Solution

Fix all findings in 4 phases ordered by impact and dependency. Each phase is independently shippable.

## Implementation Phases

### Phase 1: Quick Wins (30 min)

Trivial changes with immediate impact. No structural changes.

- [ ] **Delete unused font `<link>` tags** from `site/index.html` (lines 8-17)
  - Remove Google Fonts link (Inter + Outfit) — never referenced in theme fontFamily
  - Remove Material Icons link — MUI uses SVG icons via `@mui/icons-material`
  - Impact: eliminates 2 render-blocking requests, saves 100-200ms FCP
- [ ] **Fix redundant ternaries** where both branches return the same value
  - `site/src/components/Footer.tsx:22` — `isDark ? sapphire.gray[500] : sapphire.gray[500]` → `sapphire.gray[500]`
  - `site/src/components/HeroSection.tsx:109` — same pattern
- [ ] **Remove dead code from TerminalDemo** (`site/src/components/TerminalDemo.tsx`)
  - Delete `styleRef` (line 32) and its cleanup (lines 82-85) — declared but never assigned
  - Delete `cssId` (line 33) and remove from dependency array (line 87) — generated but never used
- [ ] **Remove unused `number` field** from `Step` interface in `site/src/components/HowItWorksSection.tsx:9` and data entries
- [ ] **Delete dead `else` branch** in DemoPage status determination (`site/src/pages/DemoPage.tsx:253-255`) — unreachable after the preceding conditions
- [ ] **Add `loading="lazy"`** to infographic image in `site/src/components/InfographicSection.tsx:68`
- [ ] **Add `loading="lazy"`** to markdown-rendered images in `site/src/components/MarkdownRenderer.tsx:69-71`
- [ ] **Hoist ReactMarkdown plugin arrays** to module scope in `site/src/components/MarkdownRenderer.tsx:49-50`
  ```typescript
  const remarkPlugins = [remarkGfm, remarkSmartypants]
  const rehypePlugins = [rehypeHighlight]
  ```

### Phase 2: Performance (2-3 hrs)

Larger performance improvements requiring file changes or dependency updates.

- [ ] **Optimize infographic image** (`site/public/screenshots/EaROS.jpg`)
  - Resize from 2752x1536 to 1920px wide (covers 2x Retina at 960px CSS width)
  - Convert to WebP format
  - Expected: 2.7MB → ~300KB
  - Update `InfographicSection.tsx` to reference new filename
- [ ] **Scope highlight.js languages** in `site/src/components/MarkdownRenderer.tsx`
  - Configure `rehype-highlight` to register only `yaml`, `bash`, `typescript`, `json`
  - Expected: MarkdownRenderer chunk reduced by ~200KB raw / ~70KB gzipped
  - Approach: use `rehype-highlight` with `languages` option, or switch to explicit `hljs.registerLanguage()` imports
- [ ] **Move TerminalDemo CSS to external stylesheet** (`site/src/components/TerminalDemo.tsx:94-170`)
  - Create `site/src/components/terminalDemo.css` with the 76 lines of CSS
  - Import once at module level instead of rendering `<style>` per instance
  - Eliminates duplicate style injection when multiple TerminalDemo instances render

### Phase 3: Code Quality (2-3 hrs)

Type safety, dependency hygiene, and structural improvements.

- [ ] **Enable `strict: true`** in `site/tsconfig.json:14`
  - Fix all resulting type errors (26-file codebase, expect 10-30 errors)
  - Key areas likely needing fixes: `any` in MarkdownRenderer, implicit `undefined` in lookup functions
- [ ] **Fix `any` type** in MarkdownRenderer img handler (`site/src/components/MarkdownRenderer.tsx:64`)
  - Use proper types from `react-markdown`'s `Components` type or `Record<string, unknown>`
- [ ] **Extract shared maturity color utilities** to `site/src/utils/maturityColors.ts`
  - Consolidate 6 functions from 4 files into one module:
    - `getLevelColor(level, isDark)` — from MaturityAssessment, OnboardingPage
    - `getLevelBg(level, isDark)` — from MaturityAssessment, OnboardingPage
    - `getLevelBorder(level, isDark)` — from MaturityAssessment
    - `getLevelDotColor(level, isDark)` — replaces `getSidebarDotColor` from OnboardingViewPage
    - `getLevelColors(level, isDark)` — replaces multi-return from MaturityBadge
  - Fix opacity inconsistency: dark-mode bg opacity is `0.08` in MaturityAssessment but `0.12` in OnboardingPage — choose one value
  - Update imports in: `MaturityAssessment.tsx`, `OnboardingPage.tsx`, `OnboardingViewPage.tsx`, `MaturityBadge.tsx`
  - ~90 LOC net saved
- [ ] **Move MUI packages to `dependencies`** in `site/package.json`
  - Move `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `@mui/material` from `devDependencies` to `dependencies`
- [ ] **Add 404 catch-all route** in `site/src/App.tsx`
  - Add `<Route path="*" element={<NotFoundPage />} />` inside the Layout route
  - Create minimal `site/src/pages/NotFoundPage.tsx` with back-to-home link
- [ ] **Add type declaration for termynal** — create `site/src/termynal.d.ts`
  - Minimal `declare module 'termynal'` with constructor signature
  - Remove `@ts-expect-error` from `TerminalDemo.tsx:2`
- [ ] **Clean up DemoPage IIFE** in `site/src/pages/DemoPage.tsx:991-997`
  - Destructure `getGateChipProps()` result above the JSX instead of IIFE inside `sx` spread

### Phase 4: Architecture & Agent-Native (4-6 hrs)

Structural improvements and agent accessibility.

- [ ] **Extract DemoPage scoring logic** from `site/src/pages/DemoPage.tsx`
  - Move `CRITERIA` and `SAMPLE_ARTIFACT` to `site/src/content/demoData.ts`
  - Move `computeResults`, type definitions, and `ScoringResult` to `site/src/lib/scoring.ts`
  - Move `getScoreColor`, `getScoreBg`, `getGateChipProps`, `STATUS_CONFIG` to `site/src/lib/scoringColors.ts`
  - DemoPage imports from these modules — becomes a pure rendering component
  - `computeResults` becomes independently testable
- [ ] **Split markdown content per-route** in `site/src/content/docs.ts` and `onboarding.ts`
  - Replace eager `?raw` imports with dynamic `import()` per slug
  - Each markdown file becomes its own Vite chunk, loaded only when the user navigates to that page
  - Update `DocViewPage.tsx` and `OnboardingViewPage.tsx` to handle async content loading (loading state)
  - Expected: eliminates 137KB of unnecessary content loading per page visit
- [ ] **Add web-agent discovery files** to `site/public/`
  - `robots.txt` — allow all crawlers
  - `sitemap.xml` — list all routes (`/`, `/docs`, `/docs/*`, `/onboarding`, `/onboarding/*`, `/demo`)
  - `llms.txt` — describe EaROS, list available documentation, point to GitHub repo for raw YAML/markdown
- [ ] **Add theme drift detection**
  - Option A: Add a CI step that diffs `site/src/theme.ts` against `tools/editor/src/theme.ts` and warns on divergence
  - Option B: Extract shared tokens to a workspace package (heavier, only if drift becomes a recurring issue)
  - Start with Option A (simpler)
- [ ] **Validate localStorage inputs** in `site/src/main.tsx:13` and `site/src/components/MaturityAssessment.tsx:357`
  - Theme mode: validate against `'light' | 'dark' | 'system'` before using
  - Maturity answers: validate parsed JSON is a plain object before using

## Technical Considerations

- **Build verification:** Run `cd site && npm run build` after each phase to confirm no regressions
- **Bundle size tracking:** Compare `dist/assets/` sizes before and after Phase 2 to verify improvements
- **TypeScript strictness:** Phase 3's `strict: true` may surface errors that require Phase 1's dead code removal first — hence the phase ordering
- **Content splitting (Phase 4):** The dynamic import approach requires adding a loading state to DocViewPage and OnboardingViewPage. The `DocsPage` index still needs metadata (title, description) eagerly — only the markdown `content` field should be lazy
- **Image optimization (Phase 2):** Use `sharp` or an online tool. The WebP conversion should maintain visual quality at the 960px display size. Keep the original JPEG in case it's needed elsewhere

## System-Wide Impact

- **No backend changes** — this is a static frontend site
- **No breaking changes to deployed URLs** — all routes remain the same
- **GitHub Pages deployment** will be triggered by changes to `site/**` via existing `deploy-site.yml` workflow
- **Editor theme:** The theme drift detection (Phase 4) may surface existing differences that should be resolved — currently cosmetic only (`hsla()` vs `color-mix()` syntax)

## Acceptance Criteria

### Phase 1
- [ ] No Google Font or Material Icons font requests in browser network tab
- [ ] No dead code warnings when `strict: true` is enabled (prep for Phase 3)
- [ ] All images below the fold have `loading="lazy"`
- [ ] `npm run build` succeeds

### Phase 2
- [ ] Infographic image is < 500KB (down from 2.7MB)
- [ ] MarkdownRenderer chunk is < 200KB (down from 360KB)
- [ ] No duplicate `<style>` blocks in DOM when multiple TerminalDemo instances render
- [ ] `npm run build` succeeds

### Phase 3
- [ ] `tsconfig.json` has `"strict": true` with zero type errors
- [ ] No `any` types in source code (except justified `@ts-expect-error` with `.d.ts` replacement)
- [ ] Color-mapping functions exist in exactly one file (`maturityColors.ts`)
- [ ] Navigating to `/EAROS/nonexistent` shows a 404 page, not a blank layout
- [ ] MUI packages are in `dependencies` in package.json
- [ ] `npm run build` succeeds

### Phase 4
- [ ] `DemoPage.tsx` is < 400 lines (down from 1,190)
- [ ] Each doc page loads only its own markdown chunk (verify in network tab)
- [ ] `site/public/robots.txt`, `sitemap.xml`, and `llms.txt` exist and are served
- [ ] Theme drift CI check passes (or warns on known differences)
- [ ] `npm run build` succeeds

## Dependencies & Risks

- **Image optimization tooling:** Need `sharp` CLI or equivalent to convert JPEG to WebP. Can use an online tool as fallback.
- **highlight.js scoping:** Need to verify `rehype-highlight` supports language restriction. If not, may need to switch to a different syntax highlighter (e.g., `shiki` with explicit language scoping).
- **Content splitting complexity:** Dynamic imports change the content loading pattern from synchronous to async. Need to handle the loading state gracefully (show skeleton/spinner while content loads).
- **strict: true errors:** Unknown count until attempted. If > 50 errors, may need to use `// @ts-expect-error` temporarily and fix incrementally.

## Sources & References

### Internal References
- Review findings from 8 parallel agents (2026-03-23): TypeScript, Security, Performance, Architecture, Pattern Recognition, Code Simplicity, Agent-Native, Learnings Research
- `site/tsconfig.json` — TypeScript configuration
- `site/package.json` — dependency classification
- `site/vite.config.ts` — build configuration
- `site/src/theme.ts` — design token system (copy of `tools/editor/src/theme.ts`)

### Key Files by Phase
- Phase 1: `index.html`, `Footer.tsx`, `HeroSection.tsx`, `TerminalDemo.tsx`, `HowItWorksSection.tsx`, `DemoPage.tsx`, `InfographicSection.tsx`, `MarkdownRenderer.tsx`
- Phase 2: `public/screenshots/EaROS.jpg`, `MarkdownRenderer.tsx`, `TerminalDemo.tsx`
- Phase 3: `tsconfig.json`, `package.json`, `MarkdownRenderer.tsx`, `App.tsx`, `MaturityAssessment.tsx`, `OnboardingPage.tsx`, `OnboardingViewPage.tsx`, `MaturityBadge.tsx`, `DemoPage.tsx`
- Phase 4: `DemoPage.tsx`, `content/docs.ts`, `content/onboarding.ts`, `DocViewPage.tsx`, `OnboardingViewPage.tsx`, `public/` (new files)
