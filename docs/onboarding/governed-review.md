# Governed Review

> **Level 2 to 3: Rubric-Based to Governed**

You can score an artifact against the core rubric. Now it is time to make architecture review a team-wide, governed practice --- with artifact-specific profiles, context-driven overlays, calibrated teams, and evidence-anchored scoring that is reproducible across your organization.

## What Changes at This Level

At Level 2, you used the core rubric and produced evidence-backed scores. At Level 3, three things change:

1. **Artifact-specific profiles** add criteria tailored to the type of artifact being reviewed
2. **Overlays** inject cross-cutting concerns (security, data governance, regulatory) based on context
3. **Calibration** ensures that different reviewers on your team produce substantially similar scores for the same artifact

![The assessment wizard shows all available profiles — choose the one that matches your artifact type](/screenshots/editor-profile-selection.png)

## Choosing a Profile

The core meta-rubric's 10 criteria are universal --- they apply to every architecture artifact. But a reference architecture has different quality expectations than an ADR, and a capability map is evaluated differently than a roadmap. Profiles add artifact-specific criteria on top of the core --- typically 3 to 9, depending on the artifact type.

| Profile | Artifact Type | What It Adds |
|---------|--------------|-------------|
| `solution-architecture.yaml` | Solution designs, HLDs, LLDs | Implementation specificity, integration patterns, deployment readiness |
| `reference-architecture.yaml` | Reference architectures, platform blueprints | Architectural views, pattern reusability, adoption guidance, evolution strategy |
| `adr.yaml` | Architecture Decision Records | Decision context, options analysis, consequence tracking, revisit triggers |
| `capability-map.yaml` | Capability maps, business architecture | Capability decomposition, business alignment, gap analysis |
| `roadmap.yaml` | Architecture roadmaps, transition plans | Sequencing, dependency management, milestone definition, risk on timeline |

Every profile declares `inherits: [EAROS-CORE-002]`. This means when you evaluate a reference architecture, you score it against all 10 core criteria **plus** the profile's additional criteria --- 13--19 criteria total depending on the profile.

> **How to choose:** Match the profile to the artifact's declared type. If the artifact does not fit any built-in profile, use the core rubric alone. Creating custom profiles is covered in [Scaling and Optimization](scaling-optimization.md).

## Applying Overlays

![Select overlays for cross-cutting concerns — security, data governance, and regulatory compliance](/screenshots/editor-overlay-selection.png)

Overlays inject cross-cutting concerns that apply across artifact types. Unlike profiles, overlays are applied **based on context**, not based on artifact type.

| Overlay | Apply When... |
|---------|--------------|
| **Security** (`security.yaml`) | The design touches authentication, authorization, encryption, personal data, or network boundaries |
| **Data Governance** (`data-governance.yaml`) | The artifact describes data flows, data retention, data classification, or data lineage |
| **Regulatory** (`regulatory.yaml`) | The artifact operates in a regulated domain: payments, healthcare, financial reporting, privacy |

Overlays are additive --- they append criteria to the base rubric (core + profile). They cannot remove or weaken gates from the base. An overlay's critical gate adds to the gate model; it does not replace it.

You can apply multiple overlays simultaneously. A payments solution architecture might use the solution-architecture profile with both the security and regulatory overlays.

## The RULERS Protocol

RULERS (Rubric Unification, Locking, and Evidence-anchored Robust Scoring) is the discipline that makes scores reproducible. The core principle is simple:

**Extract the evidence first. Then assign the score.**

For each criterion:

1. Search the artifact for content that addresses the criterion
2. If you find it, record the evidence anchor: a direct quote, section reference, or diagram ID
3. Then --- and only then --- match the evidence against the `scoring_guide` level descriptors
4. If you cannot find evidence, record N/A and explain why the criterion does not apply, or score 0 and note the absence

Never score from impression. "The artifact seems to address security" is not evidence. "Section 7.2 states: 'All inter-service communication uses mTLS with certificates rotated every 90 days'" is evidence.

## Evidence Classes

Every piece of evidence you cite must be classified:

| Class | Definition | Credibility |
|-------|-----------|-------------|
| **Observed** | Directly supported by a quote or excerpt from the artifact | Highest |
| **Inferred** | A reasonable interpretation of content that is not directly stated | Medium |
| **External** | Judgment based on a standard, policy, or source outside the artifact | Lowest |

Observed evidence is always preferred. If you find yourself relying heavily on inferred or external evidence, the artifact may have significant gaps --- which is itself a finding worth recording.

## The Three Evaluation Types

EAROS distinguishes three distinct judgment types that must never be merged into a single score:

| Type | Question It Answers | Example |
|------|-------------------|---------|
| **Artifact quality** | Is the document complete, coherent, clear, traceable, and fit for purpose? | "The document is well-structured but missing a deployment view" |
| **Architectural fitness** | Does the described architecture appear sound relative to business drivers, quality attributes, and risks? | "The architecture lacks a caching strategy despite a sub-200ms latency requirement" |
| **Governance fit** | Does the artifact comply with mandatory principles, standards, controls, and review expectations? | "The design uses a non-approved message broker without an exception record" |

These are related but distinct. A beautifully written, complete document can describe an architecturally unsound system. A technically excellent architecture can be documented in an unmaintainable artifact. Collapsing these into one score hides critical information.

![The rubric editor with file sidebar showing core, profiles, and overlays — the building blocks of governed review](/screenshots/editor-rubric-criteria.png)

## Calibrating with Your Team

Calibration is what transforms individual scoring into a team capability. Without it, "a score of 3" means something different to each reviewer.

### Step-by-step calibration exercise

1. **Select 3--5 representative artifacts.** Aim for diversity: one strong artifact, one weak, one ambiguous, and one incomplete. The gold-standard example at `examples/aws-event-driven-order-processing/` is an excellent starting point.

2. **Have 2+ reviewers score independently.** Each reviewer scores the same artifact against the same rubric without discussing their scores.

3. **Compare scores criterion by criterion.** Build a comparison table showing each reviewer's score for each criterion.

4. **Identify disagreements.** Any disagreement greater than 1 point on the same criterion requires discussion.

5. **Resolve against level descriptors.** Do not compromise to a middle score. Go back to the `scoring_guide` and determine which level descriptor most accurately matches the evidence. Update your shared understanding of what each level means.

6. **Compute Cohen's kappa.** This measures inter-rater reliability. Target kappa > 0.70 (substantial agreement) for well-defined criteria and > 0.50 for more subjective criteria. If you fall short, repeat the exercise with a different artifact.

7. **Update decision trees.** Where disagreements clustered, refine the `decision_tree` for those criteria to reduce future ambiguity.

## Setting Up a Review Cadence

Governed review is not a one-time activity. Establish a regular rhythm:

- **Architecture review board** meets on a defined schedule (weekly, biweekly, or per-milestone)
- **Evaluation records** are created for every reviewed artifact, conforming to `evaluation.schema.json`
- **Actions from Conditional Pass** results are tracked to completion with named owners and deadlines
- **Re-calibration** happens quarterly or when new team members join the review rotation

For more on evaluation record structure, see the [Getting Started guide](../getting-started.md). For terminology definitions (Cohen's kappa, evidence class, RULERS), see the [Terminology glossary](../terminology.md).

## Checkpoint: You Are at Level 3 When...

- [ ] Your team uses a matching profile (not just the core rubric) for every assessment
- [ ] Every score uses the RULERS protocol --- evidence anchor first, then score
- [ ] You have completed a calibration exercise with kappa > 0.70
- [ ] Overlays are applied based on context (not arbitrarily or never)
- [ ] Evaluation records are structured and conform to `evaluation.schema.json`
- [ ] The three evaluation types (artifact quality, architectural fitness, governance fit) are reported separately in every evaluation

## Next Steps

Your team now produces governed, calibrated, evidence-anchored architecture evaluations. The next step is to bring AI agents into the process --- not to replace human judgment, but to augment it with a second independent perspective.

Continue to [Agent-Assisted Evaluation](agent-assisted.md).
