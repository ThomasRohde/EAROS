'use strict';
const PptxGenJS = require('pptxgenjs');
const path = require('path');

// ── PALETTE ───────────────────────────────────────────────────────────────────
const C = {
  NAVY:   '1a1a2e',   // primary dark — title/section slides
  NAVY2:  '16213e',   // secondary dark — section dividers
  NAVY3:  '0f3460',   // accent dark
  GOLD:   'd4a574',   // warm gold accent
  CREAM:  'f7f7f2',   // content slide background
  WHITE:  'ffffff',
  TXT:    '1e293b',   // body text on light
  TXT2:   '475569',   // secondary text on light
  TXT_L:  'f0ede6',   // body text on dark
  MUTED:  '64748b',   // muted text
  // status
  S_PASS: '15803d',
  S_COND: 'b45309',
  S_REDO: '1d4ed8',
  S_REJE: 'b91c1c',
};

const W = 10;
const H = 5.625;
const FONT = 'Arial';

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
function rect(s, x, y, w, h, color) {
  s.addShape('rect', { x, y, w, h, fill: { color }, line: { color } });
}

function txt(s, text, x, y, w, h, opts = {}) {
  s.addText(text, { x, y, w, h, fontFace: FONT, fontSize: 12, color: C.TXT, ...opts });
}

// ── SLIDE TEMPLATES ───────────────────────────────────────────────────────────
function coverSlide(pptx, title, subtitle, partLabel) {
  const s = pptx.addSlide();
  s.background = { color: C.NAVY };
  rect(s, 0, 0, W, 0.07, C.GOLD);
  txt(s, 'EAROS FRAMEWORK', 6.3, 0.16, 3.5, 0.3, {
    fontSize: 8, color: C.MUTED, align: 'right', bold: false,
  });
  txt(s, title, 0.65, 1.3, 8.7, 2.0, {
    fontSize: 34, color: C.WHITE, bold: true, align: 'left', valign: 'middle',
    lineSpacingMultiple: 1.15,
  });
  rect(s, 0.65, 3.28, 1.5, 0.05, C.GOLD);
  txt(s, subtitle, 0.65, 3.42, 8.5, 0.65, {
    fontSize: 13, color: C.TXT_L, align: 'left', bold: false,
  });
  txt(s, partLabel, 0.65, H - 0.42, 8.5, 0.3, {
    fontSize: 8.5, color: C.MUTED, align: 'left',
  });
  return s;
}

function sectionSlide(pptx, title, note) {
  const s = pptx.addSlide();
  s.background = { color: C.NAVY2 };
  rect(s, 0, 0, W, 0.07, C.GOLD);
  rect(s, 0, 0.07, 0.5, H - 0.07, C.NAVY3);
  txt(s, title, 0.8, 1.5, 8.8, 1.4, {
    fontSize: 24, color: C.WHITE, bold: true, align: 'left', lineSpacingMultiple: 1.2,
  });
  rect(s, 0.8, 3.1, 2.0, 0.05, C.GOLD);
  if (note) {
    txt(s, note, 0.8, 3.25, 8.5, 0.55, { fontSize: 12, color: C.MUTED });
  }
  return s;
}

function contentSlide(pptx, title) {
  const s = pptx.addSlide();
  s.background = { color: C.CREAM };
  rect(s, 0, 0, W, 0.72, C.NAVY);
  rect(s, 0, 0.72, W, 0.05, C.GOLD);
  txt(s, title, 0.3, 0.02, 9.4, 0.68, {
    fontSize: 16, color: C.WHITE, bold: true, align: 'left', valign: 'middle',
  });
  return s;
}

function endSlide(pptx, partLabel, nextText) {
  const s = pptx.addSlide();
  s.background = { color: C.NAVY };
  rect(s, 0, 0, W, 0.07, C.GOLD);
  rect(s, 0, H - 0.07, W, 0.07, C.GOLD);
  txt(s, 'EAROS FRAMEWORK', W / 2 - 2.5, 1.5, 5, 0.35, {
    fontSize: 9, color: C.MUTED, align: 'center', bold: false,
  });
  txt(s, 'Enterprise Architecture\nRubric Operational Standard', W / 2 - 3, 1.95, 6, 1.1, {
    fontSize: 20, color: C.WHITE, bold: true, align: 'center', lineSpacingMultiple: 1.3,
  });
  rect(s, W / 2 - 1, 3.12, 2, 0.05, C.GOLD);
  if (nextText) {
    txt(s, nextText, W / 2 - 3, 3.27, 6, 0.4, {
      fontSize: 11, color: C.MUTED, align: 'center',
    });
  }
  txt(s, partLabel, W / 2 - 3, H - 0.55, 6, 0.3, {
    fontSize: 8, color: C.MUTED, align: 'center',
  });
  return s;
}

function newPptx(title) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = title;
  pptx.subject = 'EAROS Framework v2.0';
  pptx.author = 'EAROS Framework';
  return pptx;
}

// ── PART 1: EXECUTIVE OVERVIEW ────────────────────────────────────────────────
function buildPart1() {
  const pptx = newPptx('EAROS v2.0 — Part 1: Executive Overview');

  // S1: Cover
  coverSlide(pptx,
    'EAROS v2.0\nEnterprise Architecture Rubric Operational Standard',
    'Part 1: Executive Overview',
    'March 2026'
  );

  // S2: Agenda
  {
    const s = contentSlide(pptx, 'Agenda');
    const items = [
      ['01', 'Why EAROS?'],
      ['02', 'Core Principles'],
      ['03', 'Three-Layer Composition Model'],
      ['04', 'Three Distinct Evaluations'],
      ['05', "What's New in Version 2.0"],
    ];
    items.forEach(([num, label], i) => {
      const y = 0.95 + i * 0.84;
      rect(s, 0.4, y, 0.65, 0.62, C.NAVY3);
      txt(s, num, 0.4, y, 0.65, 0.62, {
        fontSize: 18, color: C.GOLD, bold: true, align: 'center', valign: 'middle',
      });
      txt(s, label, 1.2, y + 0.1, 8, 0.45, {
        fontSize: 14, color: C.TXT, align: 'left', valign: 'middle',
      });
    });
  }

  // S3: Why EAROS?
  {
    const s = contentSlide(pptx, 'Why EAROS?');
    txt(s, 'The problem with architecture review today', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const colW = 4.4;
    const colH = 3.65;
    const col1X = 0.3;
    const col2X = col1X + colW + 0.2;
    const colY = 1.2;

    rect(s, col1X, colY, colW, 0.42, C.S_REJE);
    txt(s, 'Without EAROS', col1X, colY, colW, 0.42, {
      fontSize: 12, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
    });
    rect(s, col1X, colY + 0.42, colW, colH - 0.42, 'fff0f0');
    const withoutItems = [
      'Inconsistent reviews across teams',
      'Scores hidden behind opaque averages',
      'No evidence trail to artifact content',
      'AI agents cannot be deployed reliably',
      'Rubrics are ad-hoc and ungoverned',
    ];
    withoutItems.forEach((item, i) => {
      txt(s, `\u2022  ${item}`, col1X + 0.2, colY + 0.62 + i * 0.56, colW - 0.35, 0.5, {
        fontSize: 11.5, color: '7f1d1d',
      });
    });

    rect(s, col2X, colY, colW, 0.42, C.S_PASS);
    txt(s, 'With EAROS', col2X, colY, colW, 0.42, {
      fontSize: 12, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
    });
    rect(s, col2X, colY + 0.42, colW, colH - 0.42, 'f0fdf4');
    const withItems = [
      'Standardised, evidence-based review',
      'Explicit gates prevent hidden failures',
      'Every score anchored to evidence',
      'AI agents under auditable protocols',
      'Rubrics are governed, versioned assets',
    ];
    withItems.forEach((item, i) => {
      txt(s, `\u2022  ${item}`, col2X + 0.2, colY + 0.62 + i * 0.56, colW - 0.35, 0.5, {
        fontSize: 11.5, color: '14532d',
      });
    });
  }

  // S4: Core Principles 1–4
  {
    const s = contentSlide(pptx, 'Core Principles (1\u20134)');
    txt(s, 'Eight principles govern all EAROS rubrics', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });
    const principles = [
      ['1. Concern-Driven', 'Evaluate whether artifacts answer stakeholder concerns, not just document completeness.'],
      ['2. Evidence First', 'Every score must point to evidence or explicitly state it is missing.'],
      ['3. Gates Before Averages', 'Mandatory failures must not be hidden by weighted averages.'],
      ['4. Explainability', 'Prefer disciplined ordinal scales over false numerical precision.'],
    ];
    principles.forEach(([title, desc], i) => {
      const y = 1.22 + i * 1.02;
      rect(s, 0.3, y, 0.07, 0.9, C.GOLD);
      rect(s, 0.37, y, 9.28, 0.9, C.WHITE);
      txt(s, title, 0.55, y + 0.07, 9.0, 0.3, {
        fontSize: 12.5, color: C.NAVY, bold: true,
      });
      txt(s, desc, 0.55, y + 0.4, 9.0, 0.42, {
        fontSize: 11, color: C.TXT2,
      });
    });
  }

  // S5: Core Principles 5–8
  {
    const s = contentSlide(pptx, 'Core Principles (5\u20138)');
    txt(s, 'Principle 8 is new in v2.0', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });
    const principles = [
      ['5. Separate Observation', 'Distinguish observed, inferred, and external evidence classes.', false],
      ['6. Governed Assets', 'Rubrics are versioned, reviewed, calibrated, and changed under governance.', false],
      ['7. Auditable Agents', 'Agent evaluations must remain inspectable by human reviewers.', false],
      ['8. Machine-Readable', 'NEW: Artifacts in parseable formats enable automated assessment.', true],
    ];
    principles.forEach(([title, desc, isNew], i) => {
      const y = 1.22 + i * 1.02;
      rect(s, 0.3, y, 0.07, 0.9, C.GOLD);
      rect(s, 0.37, y, 9.28, 0.9, isNew ? 'fefce8' : C.WHITE);
      txt(s, title, 0.55, y + 0.07, 7.8, 0.3, {
        fontSize: 12.5, color: C.NAVY, bold: true,
      });
      if (isNew) {
        rect(s, 7.9, y + 0.07, 1.55, 0.26, C.S_COND);
        txt(s, 'NEW in v2.0', 7.9, y + 0.07, 1.55, 0.26, {
          fontSize: 8.5, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
        });
      }
      txt(s, desc, 0.55, y + 0.4, 9.0, 0.42, {
        fontSize: 11, color: C.TXT2,
      });
    });
  }

  // S6: Three-Layer Composition Model
  {
    const s = contentSlide(pptx, 'Three-Layer Composition Model');
    txt(s, 'How rubrics compose to cover any artifact and context', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const sX = 0.3;
    const sW = 5.8;

    // Layer 3 — Overlays
    rect(s, sX, 1.22, sW, 1.05, 'e0e7ff');
    rect(s, sX, 1.22, 0.08, 1.05, C.NAVY3);
    txt(s, 'Layer 3: OVERLAYS', sX + 0.2, 1.28, sW - 0.3, 0.3, {
      fontSize: 11.5, color: C.NAVY3, bold: true,
    });
    txt(s, 'Cross-cutting concerns applied by context', sX + 0.2, 1.58, sW - 0.3, 0.25, {
      fontSize: 10, color: C.TXT2,
    });
    txt(s, 'security  \u00b7  data-governance  \u00b7  regulatory', sX + 0.2, 1.84, sW - 0.3, 0.3, {
      fontSize: 10, color: C.NAVY3, italic: true,
    });

    // Layer 2 — Profiles
    rect(s, sX, 2.37, sW, 1.05, 'e0f2fe');
    rect(s, sX, 2.37, 0.08, 1.05, '0369a1');
    txt(s, 'Layer 2: PROFILES', sX + 0.2, 2.43, sW - 0.3, 0.3, {
      fontSize: 11.5, color: '075985', bold: true,
    });
    txt(s, 'Specialise for artifact class', sX + 0.2, 2.73, sW - 0.3, 0.25, {
      fontSize: 10, color: C.TXT2,
    });
    txt(s, 'solution-architecture  \u00b7  reference-architecture  \u00b7  adr  \u00b7  capability-map  \u00b7  roadmap',
      sX + 0.2, 2.99, sW - 0.3, 0.3, {
        fontSize: 9.5, color: '075985', italic: true,
      });

    // Layer 1 — Core
    rect(s, sX, 3.52, sW, 1.05, 'fef3c7');
    rect(s, sX, 3.52, 0.08, 1.05, C.GOLD);
    txt(s, 'Layer 1: CORE META-RUBRIC', sX + 0.2, 3.58, sW - 0.3, 0.3, {
      fontSize: 11.5, color: '92400e', bold: true,
    });
    txt(s, 'Universal foundation — applies to ALL artifacts', sX + 0.2, 3.88, sW - 0.3, 0.25, {
      fontSize: 10, color: C.TXT2,
    });
    txt(s, '9 dimensions  \u00b7  10 criteria  \u00b7  0\u20134 ordinal scale  \u00b7  gate model',
      sX + 0.2, 4.14, sW - 0.3, 0.3, {
        fontSize: 9.5, color: '92400e', italic: true,
      });

    // Right panel
    rect(s, 6.3, 1.18, 3.4, 3.42, C.NAVY);
    txt(s, 'How it works', 6.48, 1.28, 3.1, 0.35, {
      fontSize: 11.5, color: C.GOLD, bold: true,
    });
    [
      'Core always evaluated first',
      'Profile adds artifact-specific criteria',
      'Overlays inject cross-cutting requirements',
      'Gates checked before computing averages',
      '',
      'One global rubric = too generic',
      'Fully bespoke = ungovernable',
      'This model is the balance',
    ].forEach((item, i) => {
      if (!item) return;
      txt(s, `\u2013  ${item}`, 6.48, 1.68 + i * 0.36, 3.1, 0.32, {
        fontSize: 9.5, color: C.TXT_L,
      });
    });
  }

  // S7: Three Distinct Evaluations
  {
    const s = contentSlide(pptx, 'Three Distinct Evaluations');
    txt(s, 'EAROS never collapses these into one opaque score', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const boxes = [
      { label: 'Artifact Quality',      color: C.NAVY3, bg: 'eef2ff',
        q: 'Is the artifact complete, coherent, clear, traceable, and fit for its stated purpose?' },
      { label: 'Architectural Fitness', color: '0369a1', bg: 'f0f9ff',
        q: 'Is the architecture sound relative to business drivers, quality attributes, risks, and tradeoffs?' },
      { label: 'Governance Fit',        color: '15803d', bg: 'f0fdf4',
        q: 'Does the artifact comply with mandatory principles, standards, controls, and review expectations?' },
    ];

    boxes.forEach(({ label, color, bg, q }, i) => {
      const x = 0.3 + i * 3.23;
      const bW = 3.0;
      rect(s, x, 1.22, bW, 0.42, color);
      txt(s, label, x + 0.1, 1.22, bW - 0.2, 0.42, {
        fontSize: 11.5, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, x, 1.64, bW, 3.1, bg);
      txt(s, q, x + 0.2, 1.84, bW - 0.4, 2.5, {
        fontSize: 11.5, color: C.TXT, align: 'left',
      });
    });

    txt(s, 'These are related but distinct. A beautiful, complete artifact can describe an architecturally unsound system.',
      0.3, H - 0.44, 9.4, 0.32, {
        fontSize: 9.5, color: C.TXT2, italic: true, align: 'center',
      });
  }

  // S8: Section — What's New
  sectionSlide(pptx, "What's New in v2.0", 'Key enhancements from 63 research sources');

  // S9: Version 2.0 Enhancements
  {
    const s = contentSlide(pptx, "Version 2.0 Enhancements");
    txt(s, 'Incorporating latest research on AI-agent evaluation', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const columns = [
      { title: 'Scoring Science', color: C.NAVY3, items: [
        '0\u20133 vs 0\u20134 scale tradeoff analysis',
        'Inter-rater reliability targets (\u03ba > 0.70)',
        'Evidence-anchored scoring protocol',
      ]},
      { title: 'DAG Evaluation', color: '0369a1', items: [
        '8-step directed acyclic graph',
        'Replaces monolithic 3-pass model',
        'RULERS rubric locking protocol',
      ]},
      { title: 'Artifact Formats', color: '15803d', items: [
        'ArchiMate exchange format',
        'ADR YAML/JSON (DRF)',
        'YAML frontmatter metadata',
      ]},
    ];

    columns.forEach(({ title, color, items }, i) => {
      const x = 0.3 + i * 3.23;
      const cW = 3.0;
      rect(s, x, 1.22, cW, 0.42, color);
      txt(s, title, x, 1.22, cW, 0.42, {
        fontSize: 12, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, x, 1.64, cW, 3.55, C.WHITE);
      items.forEach((item, j) => {
        const iy = 1.85 + j * 0.78;
        rect(s, x + 0.2, iy, 0.08, 0.08, C.GOLD);
        txt(s, item, x + 0.4, iy - 0.05, cW - 0.55, 0.6, {
          fontSize: 11.5, color: C.TXT,
        });
      });
    });
  }

  // S10: End
  endSlide(pptx, 'Part 1 of 3 \u00b7 EAROS Framework v2.0 \u00b7 March 2026', 'Continues: Part 2 \u2014 Scoring and AI Assessment \u2192');

  return pptx;
}

// ── PART 2: SCORING & AI ASSESSMENT ──────────────────────────────────────────
function buildPart2() {
  const pptx = newPptx('EAROS v2.0 — Part 2: Scoring and AI Assessment');

  // S1: Cover
  coverSlide(pptx,
    'EAROS v2.0\nScoring and AI Assessment',
    'Part 2 of 3 | March 2026',
    'March 2026'
  );

  // S2: Scoring Standard 0–4
  {
    const s = contentSlide(pptx, 'Scoring Standard: 0\u20134 Ordinal Scale');
    txt(s, 'Every score must be explainable and evidence-linked', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const rows = [
      { score: '4', label: 'Strong',   desc: 'Fully addressed, well evidenced, internally consistent, and decision-ready',             color: C.S_PASS, bg: 'f0fdf4' },
      { score: '3', label: 'Good',     desc: 'Clearly addressed with adequate evidence and only minor gaps',                           color: '16a34a', bg: 'f0fdf4' },
      { score: '2', label: 'Partial',  desc: 'Explicitly addressed, but coverage incomplete, inconsistent, or weakly evidenced',       color: C.S_COND, bg: 'fffbeb' },
      { score: '1', label: 'Weak',     desc: 'Criterion acknowledged or implied, but inadequate for decision support',                 color: 'ea580c', bg: 'fff7ed' },
      { score: '0', label: 'Absent',   desc: 'No meaningful evidence, or evidence directly contradicts the criterion',                 color: C.S_REJE, bg: 'fef2f2' },
    ];

    rows.forEach(({ score, label, desc, color, bg }, i) => {
      const y = 1.22 + i * 0.8;
      rect(s, 0.3, y, 0.55, 0.7, color);
      txt(s, score, 0.3, y, 0.55, 0.7, {
        fontSize: 22, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, 0.85, y, 1.4, 0.7, color);
      txt(s, label, 0.85, y, 1.4, 0.7, {
        fontSize: 13, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, 2.25, y, 7.4, 0.7, bg);
      txt(s, desc, 2.4, y, 7.2, 0.7, {
        fontSize: 11, color: C.TXT, valign: 'middle',
      });
    });

    txt(s, 'v2.0: Research suggests 0\u20133 for pure agent use. Retain 0\u20134 for human and hybrid review.',
      0.3, 5.25, 9.4, 0.28, { fontSize: 9.5, color: C.TXT2, italic: true });
  }

  // S3: Status Model
  {
    const s = contentSlide(pptx, 'Status Model');
    txt(s, 'Gates prevent critical failures from being averaged away', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const statuses = [
      { label: 'Pass',             color: C.S_PASS, bg: 'f0fdf4',
        conditions: ['No critical gate failures', 'Weighted score \u2265 3.2', 'No dimension < 2.0'] },
      { label: 'Conditional Pass', color: C.S_COND, bg: 'fffbeb',
        conditions: ['No critical gate failures', 'Score 2.4\u20133.19', 'Weaknesses containable'] },
      { label: 'Rework Required',  color: C.S_REDO, bg: 'eff6ff',
        conditions: ['Score < 2.4', 'Repeated weak dimensions', 'Insufficient evidence'] },
      { label: 'Reject',           color: C.S_REJE, bg: 'fef2f2',
        conditions: ['Critical gate failure', 'Artifact type mismatch', 'Purpose unclear'] },
    ];

    statuses.forEach(({ label, color, bg, conditions }, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.3 + col * 4.85;
      const y = 1.2 + row * 2.05;
      const bW = 4.5;
      const bH = 1.85;

      rect(s, x, y, bW, 0.42, color);
      txt(s, label, x + 0.15, y, bW - 0.3, 0.42, {
        fontSize: 12.5, color: C.WHITE, bold: true, valign: 'middle',
      });
      rect(s, x, y + 0.42, bW, bH - 0.42, bg);
      conditions.forEach((c, j) => {
        txt(s, `\u2022  ${c}`, x + 0.2, y + 0.56 + j * 0.4, bW - 0.35, 0.36, {
          fontSize: 11, color: C.TXT,
        });
      });
    });
  }

  // S4: Section — Agentic Evaluation
  sectionSlide(pptx, 'Agentic Evaluation', 'New in v2.0: DAG-based evaluation with evidence anchoring');

  // S5: DAG-Based Evaluation Flow
  {
    const s = contentSlide(pptx, 'DAG-Based Evaluation Flow');
    txt(s, '8-step directed acyclic graph replaces monolithic 3-pass model', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const steps = [
      { n: '1', title: 'Structural Validation',     desc: 'Binary checks: metadata, sections, schema conformance' },
      { n: '2', title: 'Content Extraction',        desc: 'Extract evidence for each criterion from identified sections' },
      { n: '3', title: 'Criterion Scoring',         desc: 'Each criterion scored independently with evidence anchoring' },
      { n: '4', title: 'Cross-Reference Validation',desc: 'Check consistency between criterion scores and artifact sections' },
    ];
    const steps2 = [
      { n: '5', title: 'Dimension Aggregation',     desc: 'Compute dimension-level scores from criterion results' },
      { n: '6', title: 'Challenge Pass',            desc: 'Identify unsupported claims, over-scoring, unanswered questions' },
      { n: '7', title: 'Calibration',               desc: 'Compare scores against gold-set using RULERS Wasserstein method' },
      { n: '8', title: 'Status Determination',      desc: 'Apply gate checks then status thresholds to produce final verdict' },
    ];

    const colY = 1.2;
    const stepH = 0.97;
    const gap = 0.04;

    [[steps, 0.3], [steps2, 5.15]].forEach(([group, baseX]) => {
      const gW = 4.5;
      txt(s, group === steps ? 'Steps 1\u20134: Analysis' : 'Steps 5\u20138: Synthesis',
        baseX, colY - 0.25, gW, 0.22, { fontSize: 10, color: C.TXT2, bold: true });
      group.forEach(({ n, title, desc }, i) => {
        const y = colY + i * (stepH + gap);
        rect(s, baseX, y, 0.52, stepH, C.NAVY);
        txt(s, n, baseX, y, 0.52, stepH, {
          fontSize: 20, color: C.GOLD, bold: true, align: 'center', valign: 'middle',
        });
        rect(s, baseX + 0.52, y, gW - 0.52, stepH, C.WHITE);
        txt(s, title, baseX + 0.65, y + 0.06, gW - 0.8, 0.32, {
          fontSize: 11.5, color: C.NAVY, bold: true,
        });
        txt(s, desc, baseX + 0.65, y + 0.4, gW - 0.8, 0.48, {
          fontSize: 10, color: C.TXT2,
        });
      });
    });

    // Arrow between columns
    txt(s, '\u2192', 4.82, 2.5, 0.3, 0.5, {
      fontSize: 22, color: C.GOLD, bold: true, align: 'center', valign: 'middle',
    });
  }

  // S6: RULERS Evidence-Anchoring Protocol
  {
    const s = contentSlide(pptx, 'RULERS Evidence-Anchoring Protocol');
    txt(s, 'Every agent-generated score must include five elements', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const elements = [
      { label: 'Citation',     desc: 'Specific reference to artifact section, page, paragraph, or diagram ID' },
      { label: 'Quotation',    desc: 'The relevant text from the artifact that supports the score' },
      { label: 'Evidence Class', desc: 'Observed (direct), Inferred (interpretation), or External (from standards/policy)' },
      { label: 'Sufficiency',  desc: 'Sufficient, Partial, or Insufficient for the criterion' },
      { label: 'Confidence',   desc: 'Low, Medium, or High with explicit reasons for anything below High' },
    ];

    elements.forEach(({ label, desc }, i) => {
      const x = 0.3 + (i % 3) * 3.23;
      const y = i < 3 ? 1.22 : 2.75;
      const eW = 2.9;
      const eH = 1.25;
      rect(s, x, y, eW, 0.38, C.NAVY3);
      txt(s, label, x + 0.12, y, eW - 0.24, 0.38, {
        fontSize: 12, color: C.WHITE, bold: true, valign: 'middle',
      });
      rect(s, x, y + 0.38, eW, eH - 0.38, C.WHITE);
      txt(s, desc, x + 0.15, y + 0.48, eW - 0.3, eH - 0.55, {
        fontSize: 10.5, color: C.TXT,
      });
    });

    rect(s, 0.3, 4.1, 9.4, 0.5, 'fef3c7');
    txt(s, 'Scores without evidence anchors are flagged as unverified and excluded from automated status determination.',
      0.5, 4.1, 9.1, 0.5, { fontSize: 11, color: '92400e', valign: 'middle' });
  }

  // S7: Calibration and Reliability Targets
  {
    const s = contentSlide(pptx, 'Calibration and Reliability Targets');
    txt(s, 'New in v2.0: explicit inter-rater reliability targets', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    // Left: Targets
    rect(s, 0.3, 1.2, 4.4, 0.4, C.NAVY);
    txt(s, 'Reliability Targets', 0.45, 1.2, 4.2, 0.4, {
      fontSize: 12, color: C.WHITE, bold: true, valign: 'middle',
    });
    const targets = [
      'Binary criteria:  > 95% agreement',
      'Ordinal (well-defined):  \u03ba > 0.70',
      'Ordinal (subjective):  \u03ba > 0.50',
      'Overall assessment:  \u03c1 > 0.80',
      '',
      'Adjacent-score tolerance: disagreements of exactly',
      'one level are treated as soft disagreements.',
    ];
    targets.forEach((t, i) => {
      txt(s, t, 0.45, 1.7 + i * 0.42, 4.1, 0.38, { fontSize: 11, color: C.TXT });
    });

    // Right: Process
    rect(s, 5.0, 1.2, 4.7, 0.4, C.NAVY3);
    txt(s, 'Calibration Process', 5.15, 1.2, 4.5, 0.4, {
      fontSize: 12, color: C.WHITE, bold: true, valign: 'middle',
    });
    const steps = [
      'Select 10\u201320 representative artifacts',
      'Score independently with 2+ reviewers',
      'Compare results across reviewers',
      'Identify ambiguous criteria and rewrite',
      'Repeat until agreement stabilises',
    ];
    steps.forEach((step, i) => {
      rect(s, 5.0, 1.7 + i * 0.64, 0.38, 0.38, C.GOLD);
      txt(s, `${i + 1}`, 5.0, 1.7 + i * 0.64, 0.38, 0.38, {
        fontSize: 11, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      txt(s, step, 5.48, 1.72 + i * 0.64, 4.1, 0.35, { fontSize: 11, color: C.TXT });
    });
    txt(s, 'Recalibrate on: profile changes, rubric updates, new artifact types.',
      0.3, 5.0, 9.4, 0.3, { fontSize: 9.5, color: C.TXT2, italic: true });
  }

  // S8: End
  endSlide(pptx, 'Part 2 of 3 \u00b7 EAROS Framework v2.0 \u00b7 March 2026', 'Continues: Part 3 \u2014 Implementation Guide \u2192');

  return pptx;
}

// ── PART 3: IMPLEMENTATION GUIDE ─────────────────────────────────────────────
function buildPart3() {
  const pptx = newPptx('EAROS v2.0 — Part 3: Implementation Guide');

  // S1: Cover
  coverSlide(pptx,
    'EAROS v2.0\nImplementation Guide',
    'Part 3 of 3 | March 2026',
    'March 2026'
  );

  // S2: Profile Design Methods
  {
    const s = contentSlide(pptx, "Profile Design Methods");
    txt(s, "Choose based on the artifact's primary purpose", 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const methods = [
      { id: 'A', label: 'Decision-Centred',  use: 'ADRs, investment reviews, exception requests',                  color: C.NAVY3, group: 'Decision / Viewpoint' },
      { id: 'B', label: 'Viewpoint-Centred', use: 'Capability maps, reference architectures, landscape views',     color: C.NAVY3, group: null },
      { id: 'C', label: 'Lifecycle-Centred', use: 'Transition designs, roadmaps, handover docs',                   color: '0369a1', group: 'Lifecycle / Risk' },
      { id: 'D', label: 'Risk-Centred',      use: 'Security, regulatory, resilience architecture',                 color: '0369a1', group: null },
      { id: 'E', label: 'Pattern Library',   use: 'Recurring reference architectures and platform service definitions', color: C.S_COND, group: 'Pattern Library' },
    ];

    methods.forEach(({ id, label, use, color, group }, i) => {
      const y = 1.2 + i * 0.84;
      if (group) {
        txt(s, group, 0.3, y - 0.02, 1.5, 0.28, {
          fontSize: 8.5, color: C.TXT2, bold: true,
        });
      }
      rect(s, 0.3, y + 0.24, 0.5, 0.52, color);
      txt(s, id, 0.3, y + 0.24, 0.5, 0.52, {
        fontSize: 18, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, 0.8, y + 0.24, 8.85, 0.52, C.WHITE);
      txt(s, label, 0.95, y + 0.27, 2.8, 0.3, {
        fontSize: 12, color: C.NAVY, bold: true,
      });
      txt(s, use, 3.85, y + 0.27, 5.7, 0.3, {
        fontSize: 11, color: C.TXT2,
      });
    });

    txt(s, 'Max 5\u201312 criteria per profile. More suggests mixing concerns.',
      0.3, H - 0.4, 9.4, 0.28, { fontSize: 9.5, color: C.TXT2, italic: true });
  }

  // S3: Recommended Starter Profiles
  {
    const s = contentSlide(pptx, 'Recommended Starter Profiles');
    txt(s, 'Start with a controlled seed set, run for 6\u20138 weeks, then tune', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    // Artifact Profiles (left)
    rect(s, 0.3, 1.18, 5.6, 0.38, C.NAVY);
    txt(s, 'Artifact Profiles', 0.45, 1.18, 5.4, 0.38, {
      fontSize: 11.5, color: C.WHITE, bold: true, valign: 'middle',
    });
    const profiles = [
      ['Capability Map',       'Decomposition, non-overlap, naming, ownership, business linkage'],
      ['Solution Architecture','Problem statement, options, quality attributes, integration, operations'],
      ['ADR',                  'Decision clarity, options, consequences, tradeoffs, reversibility'],
      ['Roadmap',              'Dependencies, sequencing, transitions, ownership, milestones'],
    ];
    profiles.forEach(([name, focus], i) => {
      const y = 1.66 + i * 0.84;
      rect(s, 0.3, y, 5.6, 0.76, i % 2 === 0 ? 'f8fafc' : C.WHITE);
      txt(s, name, 0.48, y + 0.06, 2.0, 0.3, {
        fontSize: 11.5, color: C.NAVY, bold: true,
      });
      txt(s, focus, 0.48, y + 0.38, 5.3, 0.32, {
        fontSize: 10, color: C.TXT2,
      });
    });

    // Context Overlays (right)
    rect(s, 6.1, 1.18, 3.6, 0.38, C.NAVY3);
    txt(s, 'Context Overlays', 6.25, 1.18, 3.4, 0.38, {
      fontSize: 11.5, color: C.WHITE, bold: true, valign: 'middle',
    });
    const overlays = [
      ['Security Overlay',    'Non-negotiable controls, threat assessment, residual risk visibility'],
      ['Regulatory Overlay',  'Mandatory compliance checks, audit trail requirements'],
    ];
    overlays.forEach(([name, focus], i) => {
      const y = 1.66 + i * 0.9;
      rect(s, 6.1, y, 3.6, 0.82, i === 0 ? 'f8fafc' : C.WHITE);
      txt(s, name, 6.25, y + 0.06, 3.3, 0.3, {
        fontSize: 11, color: C.NAVY, bold: true,
      });
      txt(s, focus, 6.25, y + 0.38, 3.3, 0.38, {
        fontSize: 10, color: C.TXT2,
      });
    });

    txt(s, 'Overlays apply across all artifact types — applied by context, not artifact class.',
      0.3, H - 0.4, 9.4, 0.28, { fontSize: 9.5, color: C.TXT2, italic: true });
  }

  // S4: Section — Artifact Formats
  sectionSlide(pptx, 'Artifact Formats', 'New in v2.0: machine-readable format requirements');

  // S5: Artifact Format Requirements
  {
    const s = contentSlide(pptx, 'Artifact Format Requirements');
    txt(s, 'Machine-readable formats for reliable AI assessment', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const panels = [
      { title: 'Structured Metadata', color: C.NAVY3, items: [
        'YAML frontmatter on every artifact:',
        '  \u00b7 document_type',
        '  \u00b7 version and status',
        '  \u00b7 domain and systems',
        '  \u00b7 quality_attributes',
        '  \u00b7 standards_compliance',
        '  \u00b7 related_artifacts',
        'Schema validation enables automated',
        'structural checks.',
      ]},
      { title: 'Model Formats', color: '0369a1', items: [
        'ArchiMate Exchange (XML/XSD)',
        'OpenAPI for API specs',
        'ADR: MADR or DRF (YAML/JSON)',
        'arc42 template (12 sections)',
        '',
        'Schema validation enables automated',
        'structural checks.',
      ]},
      { title: 'Diagram-as-Code', color: '15803d', items: [
        'Structurizr DSL (C4)',
        'PlantUML',
        'Mermaid or D2',
        '',
        'Machine-readable model as authoritative',
        'source. Rendered diagram as visual aid.',
      ]},
    ];

    panels.forEach(({ title, color, items }, i) => {
      const x = 0.3 + i * 3.23;
      const pW = 3.0;
      rect(s, x, 1.22, pW, 0.4, color);
      txt(s, title, x + 0.12, 1.22, pW - 0.24, 0.4, {
        fontSize: 11.5, color: C.WHITE, bold: true, valign: 'middle',
      });
      rect(s, x, 1.62, pW, 3.6, C.WHITE);
      items.forEach((item, j) => {
        if (!item) return;
        txt(s, item, x + 0.18, 1.72 + j * 0.38, pW - 0.3, 0.35, {
          fontSize: 10, color: C.TXT,
        });
      });
    });
  }

  // S6: Rollout Roadmap
  {
    const s = contentSlide(pptx, 'Rollout Roadmap');
    txt(s, 'Phased approach to operationalising EAROS v2.0', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const phases = [
      { label: 'Phase 1', when: 'Weeks 1\u20134',   color: C.NAVY3, items: [
        'Core Meta-Rubric',
        'Run on 10\u201320 real artifacts',
        'Calibrate with 2+ reviewers',
        'Establish baselines',
      ]},
      { label: 'Phase 2', when: 'Weeks 5\u201310',  color: '0369a1', items: [
        'Starter Profiles',
        'Security + Regulatory overlays',
        'Calibrate each profile',
      ]},
      { label: 'Phase 3', when: 'Weeks 11\u201316', color: C.S_COND, items: [
        'Agent Assessment',
        'DAG evaluation pipeline',
        'Parallel human + agent reviews',
        'Target: \u03ba > 0.70',
      ]},
      { label: 'Phase 4', when: 'Ongoing',          color: '374151', items: [
        'Scale and Govern',
        'Add profiles on demand',
        'Monitor rubric metrics',
        'Expand agent autonomy',
      ]},
    ];

    phases.forEach(({ label, when, color, items }, i) => {
      const x = 0.3 + i * 2.38;
      const pW = 2.2;
      rect(s, x, 1.2, pW, 0.48, color);
      txt(s, label, x + 0.1, 1.2, pW - 0.2, 0.26, {
        fontSize: 11.5, color: C.WHITE, bold: true, valign: 'bottom',
      });
      txt(s, when, x + 0.1, 1.46, pW - 0.2, 0.22, {
        fontSize: 9, color: 'c8d0da', valign: 'top',
      });
      rect(s, x, 1.68, pW, 3.5, C.WHITE);
      // Connector arrow (not last)
      if (i < 3) {
        txt(s, '\u25b6', x + pW + 0.02, 2.9, 0.28, 0.35, {
          fontSize: 11, color: C.GOLD, align: 'center', valign: 'middle',
        });
      }
      items.forEach((item, j) => {
        txt(s, `\u2022  ${item}`, x + 0.14, 1.82 + j * 0.58, pW - 0.22, 0.5, {
          fontSize: 10.5, color: C.TXT,
        });
      });
    });
  }

  // S7: Governance Model
  {
    const s = contentSlide(pptx, 'Governance Model');
    txt(s, 'Six roles and operational metrics', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    // Roles
    rect(s, 0.3, 1.18, 5.6, 0.38, C.NAVY);
    txt(s, 'Roles', 0.45, 1.18, 5.4, 0.38, {
      fontSize: 11.5, color: C.WHITE, bold: true, valign: 'middle',
    });

    const roles = [
      ['Rubric Owner',       'Content, lifecycle, versioning, quality'],
      ['Review Authority',   'Approves major changes, profile publication'],
      ['Evaluator',          'Applies the rubric (human or agent)'],
      ['Challenger',         'Reviews evaluation quality, disputes weak reasoning'],
      ['Calibration Lead',   'Benchmark examples, agreement monitoring'],
      ['Agent Steward',      'Prompts, workflows, schemas, automation controls'],
    ];
    roles.forEach(([role, resp], i) => {
      const y = 1.66 + i * 0.54;
      rect(s, 0.3, y, 5.6, 0.5, i % 2 === 0 ? 'f8fafc' : C.WHITE);
      txt(s, role, 0.45, y + 0.06, 2.2, 0.3, {
        fontSize: 11, color: C.NAVY, bold: true,
      });
      txt(s, resp, 2.75, y + 0.06, 3.1, 0.3, {
        fontSize: 10.5, color: C.TXT2,
      });
    });

    // Key metrics (right)
    rect(s, 6.1, 1.18, 3.6, 0.38, C.NAVY3);
    txt(s, 'Key Metrics', 6.25, 1.18, 3.4, 0.38, {
      fontSize: 11.5, color: C.WHITE, bold: true, valign: 'middle',
    });
    const metrics = [
      'Pass / rework distribution',
      'Agent\u2013human agreement (\u03ba)',
      'Gate failure frequency',
      'Waiver rate',
      'Time to evaluate',
    ];
    metrics.forEach((m, i) => {
      txt(s, `\u2022  ${m}`, 6.25, 1.68 + i * 0.54, 3.3, 0.46, {
        fontSize: 11, color: C.TXT,
      });
    });
  }

  // S8: Next Deliverables
  {
    const s = contentSlide(pptx, 'Next Deliverables');
    txt(s, 'To operationalise EAROS v2.0', 0.3, 0.86, 9.4, 0.28, {
      fontSize: 11, color: C.TXT2, italic: true,
    });

    const deliverables = [
      'core-meta-rubric.v2.yaml',
      'solution-architecture.v2.yaml',
      'adr.v2.yaml',
      'capability-map.v2.yaml',
      'evaluation.schema.v2.json',
      'rubric.schema.v2.json',
      'calibration-pack.v2.md',
      'agent-evaluation-pipeline (DAG implementation)',
    ];

    deliverables.forEach((d, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const x = 0.3 + col * 4.85;
      const y = 1.22 + row * 0.98;

      rect(s, x, y, 0.4, 0.4, C.NAVY3);
      txt(s, `${i + 1}`, x, y, 0.4, 0.4, {
        fontSize: 13, color: C.WHITE, bold: true, align: 'center', valign: 'middle',
      });
      rect(s, x + 0.4, y, 4.2, 0.4, C.WHITE);
      txt(s, d, x + 0.55, y + 0.04, 3.95, 0.35, {
        fontSize: 11.5, color: C.TXT, valign: 'middle',
      });
    });
  }

  // S9: End
  endSlide(pptx, 'Part 3 of 3 \u00b7 EAROS Framework v2.0 \u00b7 March 2026', null);

  return pptx;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = path.join(__dirname, 'presentations');

  console.log('Building Part 1: Executive Overview…');
  const p1 = buildPart1();
  await p1.writeFile({ fileName: path.join(outDir, 'EAROS_v2_Part1_Overview.pptx') });
  console.log('  \u2713 presentations/EAROS_v2_Part1_Overview.pptx');

  console.log('Building Part 2: Scoring and AI Assessment…');
  const p2 = buildPart2();
  await p2.writeFile({ fileName: path.join(outDir, 'EAROS_v2_Part2_Scoring.pptx') });
  console.log('  \u2713 presentations/EAROS_v2_Part2_Scoring.pptx');

  console.log('Building Part 3: Implementation Guide…');
  const p3 = buildPart3();
  await p3.writeFile({ fileName: path.join(outDir, 'EAROS_v2_Part3_Implementation.pptx') });
  console.log('  \u2713 presentations/EAROS_v2_Part3_Implementation.pptx');

  console.log('\nDone. All 3 presentations written to presentations/');
}

main().catch(err => { console.error(err); process.exit(1); });
