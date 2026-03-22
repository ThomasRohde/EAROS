# Scaling and Optimization

> **Level 4 to 5: Hybrid to Optimized**

Your team runs hybrid human-agent evaluations with tracked metrics. Now you make architecture review a continuous, automated, organization-wide capability --- integrated into delivery workflows, continuously calibrated, and visible to leadership.

## What Changes at This Level

At Level 4, evaluation is a deliberate activity: someone decides to review an artifact, assigns reviewers, and orchestrates the process. At Level 5, evaluation becomes embedded in how your organization delivers --- triggered automatically, calibrated continuously, and reported to stakeholders who never touch a rubric YAML.

## CI/CD Integration

Architecture fitness functions are automated tests that verify an architecture meets quality attribute targets. At Level 5, EAROS evaluation becomes one of those fitness functions.

### Pre-merge gate

Embed an EAROS evaluation as a quality gate in your pull request or merge request pipeline. When an architecture artifact is modified:

1. The pipeline detects the change (e.g., a modified `artifact.yaml` or solution design document)
2. An agent evaluation runs against the matching rubric (core + profile + applicable overlays)
3. If the status is **Reject** or **Not Reviewable**, the merge is blocked
4. If the status is **Conditional Pass**, the merge proceeds but actions are created automatically
5. If the status is **Pass**, the merge proceeds cleanly

### Post-merge quality tracking

After merge, record evaluation results in a time-series store. This enables trend analysis: is artifact quality improving or degrading over time? Which dimensions are consistently weak? Which teams produce the strongest artifacts?

### Architecture as code

Fitness functions work best when architecture artifacts are machine-readable. EAROS is designed for this --- artifacts conforming to `artifact.schema.json` can be validated, scored, and tracked automatically. Encourage teams to adopt structured artifact formats (YAML with frontmatter, ArchiMate exchange, diagram-as-code) rather than unstructured documents.

## Continuous Calibration

At earlier levels, calibration is an event --- a scheduled exercise where reviewers score reference artifacts and compare results. At Level 5, calibration becomes continuous.

### Wasserstein-based alignment

The RULERS protocol uses the Wasserstein distance to measure how far an agent's score distribution has drifted from the reference human distribution. When the distance exceeds a threshold, re-calibration is triggered automatically.

### Calibration triggers

- **Profile update:** When a profile's criteria, scoring guides, or decision trees are modified, re-calibrate against the gold set before production use
- **Agent model change:** When the underlying AI model is updated, run the calibration suite to verify score alignment
- **Drift detection:** Monitor Wasserstein distance over rolling evaluation windows; alert when it exceeds your threshold

### Maintaining the gold set

The gold set (`calibration/gold-set/`) contains reference artifacts with known scores. As your organization's standards evolve, the gold set must evolve too. Add new reference artifacts periodically and retire outdated ones. Every gold-set artifact needs scores from at least 2 calibrated human reviewers.

## Creating Custom Profiles

The five built-in profiles (solution-architecture, reference-architecture, adr, capability-map, roadmap) cover the most common artifact types. Your organization likely has others: integration designs, data architecture documents, migration plans, platform specifications, API governance records.

### The 6-step process

1. **Qualify the need.** The artifact type must recur enough to justify standardization, and the core rubric alone must be insufficient.

2. **Choose a design method.** EAROS defines five approaches: decision-centred (A), viewpoint-centred (B), lifecycle-centred (C), risk-centred (D), and pattern-library (E). Select the one that matches your artifact's primary concern.

3. **Start from the template.** Copy `templates/new-profile.template.yaml` and set the required fields: `kind: profile`, `inherits: [EAROS-CORE-002]`, and `design_method`.

4. **Write up to 12 criteria.** Each criterion needs all required fields: `question`, `description`, `scoring_guide` (all 5 levels), `required_evidence`, `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, and `remediation_hints`.

5. **Calibrate before production.** Score 3--5 representative artifacts with 2+ reviewers. Target kappa > 0.70.

6. **Publish.** Validate against `rubric.schema.json`, add to the manifest, and document in the changelog.

For detailed authoring guidance, see the [Profile Authoring Guide](../profile-authoring-guide.md). The `earos-create` skill can walk you through the entire process interactively.

## Organizational Rollout

### Training

Use the maturity model itself as a training roadmap. New team members start at Level 1 and progress through the guides:

- **Week 1:** Complete [Your First Assessment](first-assessment.md) --- score a real artifact against the core rubric
- **Week 2:** Complete [Governed Review](governed-review.md) --- join a calibration exercise, learn profiles and overlays
- **Week 3:** Complete [Agent-Assisted Evaluation](agent-assisted.md) --- run a hybrid evaluation and reconcile disagreements
- **Ongoing:** Participate in review rotations and calibration exercises

### Governance

Rubrics are governed assets at Level 5. This means:

- **Version control:** All rubric changes go through pull requests with peer review
- **Owner approval:** Each rubric has a designated owner (typically a principal or lead architect) who approves changes
- **Semver versioning:** Major changes (scoring model, gate structure) bump the major version; new criteria bump minor; documentation fixes bump patch
- **Re-calibration:** Every rubric change that affects scoring requires re-calibration before the updated rubric enters production use

### Culture

The most common failure mode for architecture review frameworks is perception. If teams see EAROS as a bureaucratic gate --- a hoop to jump through before deployment --- adoption will be grudging and superficial.

Position EAROS as a quality tool, not a gatekeeping tool:

- **For authors:** EAROS tells you exactly what a good artifact looks like before you write it. Use the `earos-template-fill` skill or the scoring guide to understand expectations upfront.
- **For reviewers:** EAROS makes review faster and more consistent. You spend less time debating what "good" means and more time giving actionable feedback.
- **For leadership:** EAROS provides measurable, comparable quality data across the portfolio. It replaces "we think our architecture practice is mature" with evidence.

### Scaling across teams

Start with a pilot team that is motivated and willing to iterate. Let them reach Level 3 before expanding. Use their calibration data, evaluation records, and lessons learned to accelerate the next team's adoption. Do not mandate enterprise-wide adoption on day one.

## Executive Reporting

The `earos-report` skill generates portfolio-level views from evaluation records. At Level 5, these reports become a regular governance input.

### What executive reports provide

- **Traffic-light dashboards:** Red/amber/green status for each evaluated artifact, grouped by team, domain, or portfolio
- **Dimension trends:** Which quality dimensions are improving or declining across the portfolio over time
- **Gate failure hotspots:** Which criteria most frequently trigger gate failures --- these are systemic weaknesses worth investing in
- **Remediation tracking:** Status of actions from Conditional Pass evaluations --- are they being completed?

### Aggregating across the portfolio

Individual evaluations tell you about one artifact. Aggregated evaluations tell you about your architecture practice. Track:

- How many artifacts achieve Pass vs. Conditional Pass vs. Rework Required
- Which teams consistently produce higher-quality artifacts (and what practices they follow)
- Whether quality improves after remediation actions are completed

## Measuring Adoption

At Level 5, you track KPIs for architecture review maturity itself:

| KPI | What It Measures | Target Direction |
|-----|-----------------|-----------------|
| **Evaluation throughput** | Number of evaluations completed per month | Increasing (more artifacts reviewed) |
| **Time-to-review** | Elapsed time from artifact submission to completed evaluation | Decreasing (faster feedback) |
| **Inter-rater reliability** | Kappa between human and agent evaluators | Stable above 0.70 |
| **Remediation completion rate** | Percentage of Conditional Pass actions completed within deadline | Increasing |
| **Gate failure rate** | Percentage of evaluations triggering critical or major gate failures | Decreasing (artifacts improving) |
| **First-pass Pass rate** | Percentage of artifacts achieving Pass on first evaluation | Increasing (authors learning expectations) |

A rising first-pass Pass rate is the strongest signal that EAROS is working: artifact authors are internalizing quality expectations and producing better work upfront.

## Checkpoint: You Are at Level 5 When...

- [ ] Architecture evaluation is integrated into your CI/CD or delivery pipeline
- [ ] Calibration happens continuously, not just at setup time --- drift is detected and triggers re-calibration
- [ ] You create and maintain custom profiles for your organization's artifact types
- [ ] Executive reporting provides portfolio-level quality visibility on a regular cadence
- [ ] Rubric updates follow a governed change process (version bumps, owner approval, re-calibration)
- [ ] Architecture review is perceived as a quality enabler, not a bureaucratic gate

## What Comes Next

Level 5 is not a destination --- it is a steady state of continuous improvement. From here:

- **Contribute back.** EAROS is open source. If you create profiles for artifact types that others would benefit from, consider contributing them to the project.
- **Share calibration data.** Cross-organizational calibration data strengthens the framework for everyone. Anonymized score distributions help improve the Wasserstein calibration baselines.
- **Evolve the standard.** As your organization's architecture practice matures, your evaluation needs will evolve. Propose improvements to the EAROS standard through the governance process.

For the full EAROS standard, see `standard/EAROS.md`. For terminology, see the [Terminology glossary](../terminology.md). For technical reference on creating profiles, see the [Profile Authoring Guide](../profile-authoring-guide.md).
