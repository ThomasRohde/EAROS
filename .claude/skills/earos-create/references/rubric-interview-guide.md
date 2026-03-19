# Rubric Interview Guide

This guide deepens the Step 3 interview in SKILL.md. Use it when initial answers are thin, when the user seems uncertain about what they're trying to create, or when you need richer material to generate good scoring guide descriptors.

---

## Why the Interview Matters More Than the Template

A rubric written from a template but without understanding the artifact type produces criteria that:
- Are too abstract to calibrate reliably (different reviewers interpret them differently)
- Duplicate what the core already measures (wasted criteria budget)
- Miss the actual failure modes that make this artifact type problematic

The interview is where you learn the specific quality signals for this artifact type. You cannot invent them — they come from people who have reviewed many examples.

---

## Deepening Question Bank

Use these follow-up questions when initial answers are surface-level. You don't need all of them — pick the ones relevant to what's missing.

### On Artifact Identity

**If the user can't describe the decision it supports:**
- "Imagine someone reads this artifact and then has to do something. What do they do — and for whom?"
- "What would be different in the world if this artifact didn't exist or was absent?"
- "Who would be upset if this artifact was missing from a review pack? What would they be unable to decide?"

**If the artifact type seems too broad:**
- "Is there a sub-type that behaves very differently? For example, a 'design document' could be a solution architecture, a data model, or an API contract — each needs different criteria."
- "Would you review a 10-page version and a 50-page version the same way? If not, they might be different types."

**If the frequency or stakes are unclear:**
- "Does this artifact go through a formal governance gate, or is it reviewed informally?"
- "What happens if a bad version gets approved — what's the worst-case consequence?"

---

### On Quality Markers

**If the user can't describe what a good example looks like:**
- "Think of the best piece of work you've ever reviewed of this type. What stood out? What did it have that others didn't?"
- "If you were teaching someone to write this artifact type, what's the first thing you'd tell them?"
- "What question does a good version answer that a weak version leaves hanging?"

**If the user can only list obvious failures:**
- "Beyond 'it's incomplete' or 'it's unclear' — what specifically is always missing from a weak version of this artifact type?"
- "What does the author always get wrong on the first draft? Not whether they tried — but what does the output miss?"
- "Have you ever had an artifact rejected or sent back? What triggered that? What was the specific problem?"

**If the mid-range (level 2–3) is unclear:**
- "If an artifact addresses this thing partially — some of it there, some missing — what does 'partial' look like specifically?"
- "What's the minimum version that would still be useful to a reviewer, even if imperfect?"

---

### On Structure and Criteria

**If the user proposes too many criteria (> 12):**
- "If you had to cut this list in half, which 5-6 things are most important? What would you still be willing to fail an artifact on?"
- "Are any of these criteria really different aspects of the same underlying thing? If so, they might merge into one criterion with a richer scoring guide."
- "Which of these does the core meta-rubric already cover? Remember: stakeholders, scope, traceability, consistency, compliance, and actionability are already in every assessment."

**If the criteria feel abstract:**
- "For this criterion, what's the specific observable evidence you'd look for — a table, a diagram, a named section, a decision statement?"
- "If you were writing a checklist for a junior reviewer, what would the first item say?"
- "How would you know, in 30 seconds of skimming, whether an artifact passes this criterion?"

---

### On Gates and Stakes

**If the user wants everything to be a critical gate:**
- "If every criterion were a critical gate, any weakness anywhere would cause a reject. Is that what you intend?"
- "What's the minimum viable artifact of this type — the version you'd conditionally approve with named conditions? What must be present for that to be possible?"
- "Reserve critical gates for: (1) things that make the artifact completely un-reviewable, (2) mandatory compliance requirements. Everything else should be major or advisory."

**If the user can't identify any gates:**
- "Is there anything so important that its absence should immediately cap or block approval — regardless of how good the rest of the artifact is?"
- "What would you tell an Architecture Board member if they asked 'why did this pass?' — if there's something you'd be embarrassed to have absent, that's a gate candidate."

---

## Profile-Specific Interview Patterns

### For ADR-like artifacts (decision records)
- "What makes a good decision record vs. a good argument document? The difference matters for criteria."
- "Does the artifact need to be reversible — can the decision be revisited? If so, criteria for time-bounding decisions matter."
- "Who needs to be able to reconstruct the reasoning 2 years from now with no context? That drives the evidence requirements."

### For Capability Maps
- "What level of abstraction is expected — business capability, product capability, or technical capability?"
- "Is this a current state, target state, or transition map? Each has different criteria."
- "What makes a capability 'well-defined' in your context — is it a name, a description, a set of processes, a heat map?"

### For Roadmaps
- "What's the planning horizon — 3 months, 12 months, 3 years? This changes what 'specificity' means."
- "Who owns delivery of the roadmap items? Named owners or just teams?"
- "Is this a commitment roadmap (things we will do) or a strategy roadmap (things we aim to do)? They have different evidence requirements."

### For Platform/Operational Handover Docs
- "Who's the recipient — someone taking over operational ownership, a new team adopting the platform, or an integration partner?"
- "What must they be able to do after reading this that they couldn't do before?"
- "What's the runbook equivalent for this artifact type?"

### For Overlays (Cross-cutting concerns)
- "Does this overlay apply to all artifact types equally, or are some more important than others?"
- "For which artifact types is this concern most critical? (Those are your gate candidates.)"
- "What's the minimum evidence that would satisfy this concern — even for a simple, low-risk artifact?"

---

## When to Stop the Interview

Stop when you can answer these five questions from the interview responses:

1. **Artifact identity**: What is this thing and what decision does it support?
2. **Quality levels**: What does a level 0, 2, and 4 artifact look like for the 3–5 key criteria?
3. **Common failures**: What are the 3 most reliable signs of a weak artifact of this type?
4. **Critical/major gates**: What would cause an outright reject vs. a conditional pass?
5. **Design method**: Which of the 5 methods (A–E) best fits the dimensional structure?

If you can answer all five, you have enough to generate good YAML. If you cannot, ask one more question before drafting.
