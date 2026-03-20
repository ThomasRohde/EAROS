---
name: earos-artifact-gen
description: "Create architecture documents through guided interview. Triggers on \"create an architecture document\", \"generate a reference architecture\", \"help me write a solution architecture\", \"document my architecture\", \"new architecture document\", or any request to create/write/generate architecture artifacts."
---

# SKILL: earos-artifact-gen

Interview an architect and generate a structured architecture artifact document that conforms to `standard/schemas/artifact.schema.json` and satisfies the evidence requirements of the relevant EAROS rubric.

## References

- Interview question templates: `references/interview-guide.md`
- Output generation guide: `references/output-guide.md`
- Artifact schema: `standard/schemas/artifact.schema.json`
- Rubric files: discovered at runtime via `earos.manifest.yaml`

---

## Workflow

### Step 1 — Determine artifact type and load rubric

Ask the user: "What type of architecture artifact are you creating?"

Common types: `solution_architecture`, `reference_architecture`, `adr`, `capability_map`, `roadmap`.

Once confirmed:
1. Read `earos.manifest.yaml` to find the matching profile.
2. Load `core/core-meta-rubric.yaml` and the matching profile YAML.
3. Load `standard/schemas/artifact.schema.json` for the artifact structure.
4. Ask: "Are any cross-cutting concerns in scope? (security, data governance, regulatory compliance)" — load applicable overlays if yes.

Announce what you loaded: "I'll use the [profile name] profile plus [overlays if any]. This covers [N] criteria."

### Step 2 — Conduct the structured interview

Read `references/interview-guide.md` before starting.

Interview the architect section by section. Do not ask all questions at once — work through one section, confirm the responses, then move to the next. The sections follow the artifact schema structure:

1. **Overview** — title, purpose, version, owner, status, audience
2. **Business context** — business drivers, goals, stakeholders and their concerns
3. **Scope and boundaries** — in-scope, out-of-scope, deferred, assumptions
4. **Architecture views** — context view, functional decomposition, deployment topology, data flows
5. **Key decisions and rationale** — major design choices, alternatives considered, tradeoffs
6. **Quality attributes** — measurable targets, scenarios, architectural responses
7. **Risks and mitigations** — open risks, mitigated risks, assumptions to validate
8. **Operations and implementation** — deployment phasing, interface contracts, operational concerns
9. **Compliance and governance** — applicable standards, controls implemented, evidence
10. **Implementation guidance** — next steps, dependencies, open decisions

**Interview technique:**
- Ask questions in natural language, not in rubric criterion language. "What external systems does this connect to?" not "Describe your STK-01 stakeholders."
- If an answer is thin, prompt for more: "Can you be more specific about [X]?" or "What would someone need to know to implement that?"
- If the architect doesn't know something, record it as an assumption or open question rather than skipping it.
- After each section, summarize what you captured and ask: "Does that accurately capture it? Anything to add?"

Use `references/interview-guide.md` for question templates and guidance on what constitutes a useful answer.

### Step 3 — Map answers to rubric criteria

After completing the interview, map each collected answer to the rubric criteria it satisfies:

For each criterion in the core + profile:
- Identify which section(s) of the interview contain the evidence
- Note if the evidence is thin (would score 1–2) vs. adequate (would score 3–4)
- Flag gaps: criteria where no interview answer provides relevant evidence

Present the gap summary: "Based on your answers, I have enough material for [N] of [M] criteria. I need more information about: [list]. Can we go back to these?"

Fill gaps before proceeding to output generation.

### Step 4 — Generate the artifact YAML

Read `references/output-guide.md` before this step.

Transform the interview answers into a structured YAML document conforming to `standard/schemas/artifact.schema.json`.

Key principles:
- Every section that maps to a rubric criterion must contain enough detail to evidence a score of 3 (the "clearly addressed" level).
- Use structured sub-elements (tables, lists, scenarios) rather than freeform prose where the schema supports it. These are easier for EAROS evaluation.
- Preserve the architect's language for names and terminology — do not substitute generic labels.
- For every design decision, include: the driver, the alternatives considered (at least one), the rejection rationale, and the selected option.
- Quality attribute targets must be measurable: "99.9% availability" not "high availability".

### Step 5 — Validate and offer assessment

After generating the artifact YAML:

1. Check it against `standard/schemas/artifact.schema.json` — verify all required fields are present.
2. Cross-check each rubric criterion: does the artifact contain the `required_evidence` items listed in the rubric?
3. Flag any remaining gaps: "Criterion [id] requires [evidence] which is not present."
4. Ask: "Would you like me to run `earos-assess` on this artifact to get a preliminary score before you finalize it?"

If gaps remain and the architect cannot fill them, mark them as `[TBD: <what is needed>]` in the YAML so they are visible during review.

---

## Operating Principles

- **Schema-first.** The artifact YAML must conform to `artifact.schema.json`. Do not generate free-form documents — the schema is the contract between artifact authors and EAROS evaluators.
- **Rubric-aware.** Every field in the artifact schema maps to a rubric criterion's `required_evidence`. Filling the schema correctly means satisfying the evidence requirements.
- **Interview before output.** Never generate a template with placeholder text and ask the architect to fill it in. Gather the information through conversation, then generate the artifact. Templates produce generic output; interviews produce specific, defensible artifacts.
- **Decisions need rationale.** The most common reason artifacts score 1–2 is missing decision rationale. Probe every design choice: Why this? What else was considered? What was rejected and why?
- **Measurable targets only.** Push back on aspirational quality attributes. "Fast" is not scoreable. "p99 < 200ms under 500 TPS load" is.
- **Gap transparency.** Unknown information is better represented as `[TBD: <description>]` than as an omission. Unknown items that are marked as TBD are visible; silent omissions create surprises in EAROS review.
