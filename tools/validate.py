#!/usr/bin/env python3
"""EAROS Consistency Validation Script — validates all rubric YAML files."""

import yaml, json, os, re, sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, SchemaError
    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False

ROOT = Path(__file__).parent.parent

RUBRIC_FILES = [
    "core/core-meta-rubric.yaml",
    "profiles/reference-architecture.yaml",
    "profiles/solution-architecture.yaml",
    "profiles/adr.yaml",
    "profiles/capability-map.yaml",
    "profiles/roadmap.yaml",
    "overlays/security.yaml",
    "overlays/data-governance.yaml",
    "overlays/regulatory.yaml",
]

KNOWN_RUBRIC_IDS = set()
# Pre-populate known IDs
for f in RUBRIC_FILES:
    p = ROOT / f
    if p.exists():
        with open(p) as fp:
            d = yaml.safe_load(fp)
        if d and d.get("rubric_id"):
            KNOWN_RUBRIC_IDS.add(d["rubric_id"])

# Load schema
SCHEMA_PATH = ROOT / "standard/schemas/rubric.schema.json"
with open(SCHEMA_PATH) as f:
    SCHEMA = json.load(f)

if HAS_JSONSCHEMA:
    VALIDATOR = Draft202012Validator(SCHEMA)

SCHEMA_REQUIRED_TOP = SCHEMA["required"]
SCHEMA_REQUIRED_CRITERION = ["id", "question", "metric_type", "scale",
                              "required_evidence", "scoring_guide"]
CLAUDE_REQUIRED_CRITERION = ["description", "gate", "anti_patterns",
                              "remediation_hints", "decision_tree"]
VALID_GATE_SEVERITIES = {"advisory", "major", "critical"}
VALID_METHODS = {"gates_first_then_weighted_average", "append_to_base_rubric",
                 "merge_with_inherited_and_apply_core_thresholds"}

all_criterion_ids = {}  # id -> file
all_dimension_ids = {}  # id -> file
all_errors = []
all_warnings = []

def check_file(filepath):
    rel = str(Path(filepath).relative_to(ROOT))
    errors = []
    warnings = []

    with open(filepath) as fp:
        doc = yaml.safe_load(fp)

    if not doc:
        errors.append("File is empty or invalid YAML")
        return rel, errors, warnings, doc

    # 1. Schema validation (jsonschema)
    if HAS_JSONSCHEMA:
        schema_errors = list(VALIDATOR.iter_errors(doc))
        for e in schema_errors:
            errors.append(f"Schema: {e.json_path}: {e.message}")
    else:
        # Manual required-field check
        for req in SCHEMA_REQUIRED_TOP:
            if req not in doc:
                errors.append(f"Schema: missing required top-level field '{req}'")

    kind = doc.get("kind", "")
    inherits = doc.get("inherits", [])
    version = doc.get("version", "")

    # 2. Cross-reference integrity
    if kind == "overlay" and inherits:
        errors.append(f"Cross-ref: Overlay must NOT have an 'inherits' field (found: {inherits})")
    if kind == "profile":
        if not inherits:
            errors.append("Cross-ref: Profile has no 'inherits' field — profiles must inherit EAROS-CORE-002")
        for ref in inherits:
            clean = ref.split("@")[0]
            if clean not in KNOWN_RUBRIC_IDS:
                errors.append(f"Cross-ref: 'inherits' references non-existent rubric_id '{ref}'")

    # 3. design_method for profiles
    if kind == "profile" and "design_method" not in doc:
        errors.append("Schema: Profile missing 'design_method' field (required for EAROS v2 profiles)")

    # 4. (File naming check removed — version is no longer encoded in filenames;
    #     use the internal `version` field instead.)

    # 5. Rubric_id prefix convention for overlays
    rubric_id = doc.get("rubric_id", "")
    if kind == "overlay":
        if rubric_id and "OVR" not in rubric_id and "OVL" in rubric_id:
            warnings.append(
                f"Naming: rubric_id '{rubric_id}' uses 'OVL' prefix; other overlays use 'OVR' — inconsistent"
            )

    # 6. Scoring method
    scoring = doc.get("scoring", {})
    method = scoring.get("method", "")
    if method and method not in VALID_METHODS:
        warnings.append(f"Scoring: non-standard method name '{method}'")

    # 7. Dimension and criterion checks
    crit_count = 0
    dim_count = 0
    for dim in doc.get("dimensions", []):
        dim_id = dim.get("id")
        dim_count += 1
        if dim_id:
            if dim_id in all_dimension_ids:
                errors.append(
                    f"ID-unique: DUPLICATE dimension ID '{dim_id}' "
                    f"(also in {all_dimension_ids[dim_id]})"
                )
            else:
                all_dimension_ids[dim_id] = rel

        for crit in dim.get("criteria", []):
            crit_id = crit.get("id", "UNKNOWN")
            crit_count += 1

            if crit_id in all_criterion_ids:
                errors.append(
                    f"ID-unique: DUPLICATE criterion ID '{crit_id}' "
                    f"(also in {all_criterion_ids[crit_id]})"
                )
            else:
                all_criterion_ids[crit_id] = rel

            # Required schema fields
            if not HAS_JSONSCHEMA:  # jsonschema already caught these
                for req in SCHEMA_REQUIRED_CRITERION:
                    if req not in crit:
                        errors.append(f"Schema: criterion '{crit_id}' missing required field '{req}'")

            # scoring_guide completeness for ordinal
            if crit.get("metric_type") == "ordinal":
                sg = crit.get("scoring_guide", {})
                for k in ["0", "1", "2", "3", "4"]:
                    if k not in sg:
                        errors.append(
                            f"Scoring: criterion '{crit_id}' scoring_guide missing key '{k}'"
                        )

            # Gate severity check
            gate = crit.get("gate")
            if isinstance(gate, dict):
                severity = gate.get("severity", "")
                if severity and severity not in VALID_GATE_SEVERITIES:
                    errors.append(
                        f"Gate: criterion '{crit_id}' has invalid gate severity '{severity}'"
                    )

            # CLAUDE.md recommended fields (warn)
            for req in CLAUDE_REQUIRED_CRITERION:
                if req not in crit:
                    warnings.append(
                        f"Quality: criterion '{crit_id}' missing CLAUDE.md field '{req}'"
                    )
            ex = crit.get("examples", {})
            if "good" not in ex or "bad" not in ex:
                warnings.append(
                    f"Quality: criterion '{crit_id}' missing examples.good / examples.bad"
                )

    return rel, errors, warnings, doc


print("=" * 70)
print("EAROS Consistency Validation")
print(f"Root: {ROOT}")
print(f"jsonschema available: {HAS_JSONSCHEMA}")
print("=" * 70)

file_results = []
for f in RUBRIC_FILES:
    p = ROOT / f
    rel, errors, warnings, doc = check_file(p)
    file_results.append((rel, errors, warnings, doc))
    all_errors.extend(errors)
    all_warnings.extend(warnings)

print("\n--- Per-File Results ---\n")
for rel, errors, warnings, doc in file_results:
    status = "FAIL" if errors else ("WARN" if warnings else "PASS")
    kind = doc.get("kind", "?") if doc else "?"
    version = doc.get("version", "?") if doc else "?"
    print(f"[{status}] {rel}  (kind={kind}, version={version})")
    for e in errors:
        print(f"       ERROR: {e}")
    for w in warnings[:5]:
        print(f"       warn:  {w}")
    if len(warnings) > 5:
        print(f"       warn:  ... ({len(warnings)-5} more quality warnings)")

print("\n--- Summary ---")
print(f"Total errors:        {len(all_errors)}")
print(f"Total warnings:      {len(all_warnings)}")
print(f"Unique criterion IDs: {len(all_criterion_ids)}")
print(f"Unique dimension IDs: {len(all_dimension_ids)}")
print()
print("All criterion IDs (alphabetical):")
for cid in sorted(all_criterion_ids):
    print(f"  {cid:20s} <- {all_criterion_ids[cid]}")
