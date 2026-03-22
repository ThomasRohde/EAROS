# EaROS v2.0 Profile Authoring Guide

## Overview

Profiles extend the Core Meta-Rubric for specific artifact types. This guide explains how to create, validate, and publish a new profile.

## Before You Start

1. Confirm the artifact type recurs enough to justify standardisation
2. Verify the Core Meta-Rubric alone is insufficient
3. Choose a design method (A-E) from EaROS v2.0 Section 15
4. Gather 3-5 representative artifacts for calibration

## Profile Design Methods

| Method | Best For |
|--------|----------|
| A: Decision-Centred | ADRs, investment reviews, exception requests |
| B: Viewpoint-Centred | Capability maps, reference architectures |
| C: Lifecycle-Centred | Transition designs, roadmaps, handover docs |
| D: Risk-Centred | Security, regulatory, resilience architecture |
| E: Pattern-Library | Recurring reference patterns, platform services |

## Profile Rules

- Inherit the core scale (0-4) and status model unless approved exception
- Add no more than 5-12 specific criteria
- Map every criterion to a dimension
- Define evidence anchors, gate types, and applicability rules
- Include examples, anti-patterns, and remediation hints
- Include at least one calibration artifact before approval

## v2.0 Additions

- Include `examples.good` and `examples.bad` for AI disambiguation
- Add `decision_tree` for ambiguous criteria
- Specify `design_method` in metadata
- Set `reliability_targets` for agent evaluation
- Document `agent_scale` if collapsing to 0-3 for agent mode

## Workflow

1. Create proposal (see EaROS Section 16)
2. Classify as profile or overlay
3. Choose design method (A-E)
4. Draft using `templates/new-profile.template.yaml`
5. Build calibration pack (1 strong, 1 weak, 1 ambiguous, 1 incomplete)
6. Run calibration with 2+ reviewers
7. Revise until agreement stabilises
8. Approve, publish, and assign owner
9. Monitor in production
