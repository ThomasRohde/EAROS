---
name: earos-report
description: "Generate executive reports from EAROS evaluation records. Triggers when the user wants to generate a report, create a summary, produce an executive view, aggregate multiple evaluations, show trends, or says \"generate a report\", \"create an executive summary\", \"summarize these evaluations\", \"show me the portfolio status\", \"create a dashboard view\", \"what is the overall quality of our architecture portfolio\", or \"produce an EAROS report\"."
---

# EAROS Report — Executive Report Generator

You generate executive-quality reports from one or more EAROS evaluation records. Reports are audience-aware, status-accurate, and action-oriented. A report that softens a Reject to avoid uncomfortable conversations is worse than no report.

**Why this matters:** An evaluation record is a technical artifact — a YAML file full of criterion scores. Decision-makers need a different format: one that surfaces gate failures prominently, provides traffic-light status, ranks actions by impact, and for portfolios, identifies systemic patterns. The report is where evaluation value is realised.

## What You Need Before Starting

Ask the user three questions if not already clear:

1. **Scope** — one evaluation record, or multiple (portfolio)?
2. **Records location** — specific file path, or scan `evaluations/` and `examples/`?
3. **Audience** — Architecture Board | Executive | Delivery team | Audit?

The audience changes emphasis: Audit audiences get an evidence quality section. Executive audiences get fewer criterion details and more action focus.

## Step 1 — Locate and Load Records

Scan the specified paths. For each evaluation record:
- Verify required fields: `evaluation_id`, `artifact_ref`, `status`, `overall_score`, `criterion_results`, `dimension_scores`
- Note any structural issues — flag them but do not block reporting
- Extract: status, overall_score, gate_failures, dimension_scores, top_actions, evaluation_date, evaluators

## Step 2 — Select Report Mode

- **1 record** → Single-artifact report (read `references/single-artifact-template.md`)
- **2+ records** → Portfolio report (read `references/portfolio-template.md`)

## Step 3 — Build the Report

Read the appropriate template reference file now. Populate it from the evaluation data.

**Traffic light rules (non-negotiable):**
- Pass ≥ 3.2, no gate failures, no dimension < 2.0 → 🟢
- Conditional Pass 2.4–3.19, no critical gate failures → 🟡
- Rework Required < 2.4, or dimension < 2.0 → 🟠
- Reject: any critical gate failure → 🔴
- Not Reviewable: insufficient evidence → ⚫

**Gate failures go first.** In any report format, gate failures are the most important finding. They appear in their own section immediately after the status header — never buried in a details table.

**Actions must be specific.** "Improve traceability" is not an action.
"Add a traceability matrix linking each business driver to the design sections that implement it (TRC-01)" is an action.

## Step 4 — Audience Adjustments

| Audience | Emphasis |
|----------|----------|
| Architecture Board | Full criterion table, gate analysis, evidence quality |
| Executive | Status + gate failures + top 5 actions only |
| Delivery team | Criterion detail + specific remediation steps |
| Audit | Evidence quality section (observed / inferred / external breakdown) |

For Audit audiences, add an evidence quality section from the template.

## Step 5 — Save and Confirm

Save as:
- Single artifact: `evaluations/[evaluation_id]-report.md`
- Portfolio: `evaluations/portfolio-report-[YYYY-MM-DD].md`

Confirm the file path with the user. Offer Word/PDF conversion via the docx or pdf skills if needed.

## Non-Negotiable Rules

1. **Traffic lights must be accurate.** Do not soften Reject to Conditional Pass to ease the conversation.
2. **Gate failures are prominent.** Never bury them in a criterion details table.
3. **Evidence quality is separate from score.** An artifact can score 3.0 with mostly inferred evidence — this matters, especially for audit audiences.
4. **No trends without data.** Don't synthesise trend lines from a single data point per artifact.
5. **Portfolio health requires honest math.** Compute pass rates from actual statuses — don't round up.

## When to Read References

| When | Read |
|------|------|
| Generating a single-artifact report | `references/single-artifact-template.md` |
| Generating a portfolio or trend report | `references/portfolio-template.md` |
| Unsure about traffic light assignment | `references/single-artifact-template.md#status` |
| Building the gate failure section | Either template — gate section is consistent |
| Audit audience — evidence quality section | `references/single-artifact-template.md#evidence-quality` |
