/**
 * EAROS — Export artifact data to a Microsoft Word (.docx) document.
 *
 * Mermaid diagrams are rendered to PNG via the Kroki public API (no local
 * Chromium required).  If Kroki is unreachable the diagram placeholder is
 * replaced with an italic note rather than failing the entire export.
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, PageBreak, Header, Footer, SectionType, SimpleField, } from 'docx';
// ─── Kroki Mermaid rendering ──────────────────────────────────────────────────
const KROKI_URL = 'https://kroki.io/mermaid/png';
const PLACEHOLDER_PNG = Buffer.alloc(0); // sentinel — real empty buffer
async function renderMermaidDiagram(diagram) {
    try {
        const response = await fetch(KROKI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: diagram.trim(),
            signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok)
            return null;
        const arr = await response.arrayBuffer();
        return Buffer.from(arr);
    }
    catch {
        return null;
    }
}
function extractDiagrams(obj, path = '') {
    if (!obj || typeof obj !== 'object')
        return [];
    const refs = [];
    // Fields that may contain Mermaid source
    const DIAGRAM_FIELDS = new Set(['diagram_source', 'diagram', 'mermaid', 'mermaid_source']);
    for (const [k, v] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k;
        if (DIAGRAM_FIELDS.has(k) && typeof v === 'string' && v.trim()) {
            refs.push({ key: p, source: v.trim() });
        }
        else if (Array.isArray(v)) {
            v.forEach((item, i) => refs.push(...extractDiagrams(item, `${p}[${i}]`)));
        }
        else if (typeof v === 'object' && v !== null) {
            refs.push(...extractDiagrams(v, p));
        }
    }
    return refs;
}
// ─── docx helpers ─────────────────────────────────────────────────────────────
const NAVY = '1F3864';
const DARK_GREY = '404040';
const MID_GREY = '777777';
const ORANGE = 'C55A11';
function h1(text) {
    return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        run: { color: NAVY, bold: true, font: 'Arial', size: 28 },
    });
}
function h2(text) {
    return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 80 },
        run: { color: NAVY, bold: true, font: 'Arial', size: 24 },
    });
}
function h3(text) {
    return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 60 },
        run: { color: ORANGE, bold: true, font: 'Arial', size: 22 },
    });
}
function body(text, indent = 0) {
    return new Paragraph({
        children: [
            new TextRun({
                text,
                font: 'Arial',
                size: 20,
                color: DARK_GREY,
            }),
        ],
        spacing: { before: 60, after: 60 },
        indent: indent ? { left: indent * 360 } : undefined,
    });
}
function bullet(text, level = 0) {
    return new Paragraph({
        children: [new TextRun({ text, font: 'Arial', size: 20, color: DARK_GREY })],
        bullet: { level },
        spacing: { before: 40, after: 40 },
    });
}
function label(key, value) {
    return new Paragraph({
        children: [
            new TextRun({ text: `${key}: `, font: 'Arial', size: 20, bold: true, color: DARK_GREY }),
            new TextRun({ text: value, font: 'Arial', size: 20, color: DARK_GREY }),
        ],
        spacing: { before: 40, after: 40 },
    });
}
function italicNote(text) {
    return new Paragraph({
        children: [new TextRun({ text, font: 'Arial', size: 18, italics: true, color: MID_GREY })],
        spacing: { before: 60, after: 60 },
    });
}
function pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
}
function horizontalRule() {
    return new Paragraph({
        border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 200, after: 200 },
        children: [],
    });
}
function diagImage(pngBuffer) {
    return new Paragraph({
        children: [
            new ImageRun({
                data: pngBuffer,
                transformation: { width: 580, height: 340 },
                type: 'png',
            }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
    });
}
// Simple two-column key-value table
function kvTable(pairs) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: pairs.map(([k, v]) => new TableRow({
            children: [
                new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, font: 'Arial', size: 18 })] })],
                }),
                new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: v, font: 'Arial', size: 18 })] })],
                }),
            ],
        })),
    });
}
// Generic header-row table
function dataTable(headers, rows) {
    const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h) => new TableCell({
            shading: { fill: NAVY },
            children: [
                new Paragraph({
                    children: [new TextRun({ text: h, bold: true, font: 'Arial', size: 18, color: 'FFFFFF' })],
                }),
            ],
        })),
    });
    const dataRows = rows.map((row) => new TableRow({
        children: row.map((cell) => new TableCell({
            children: [
                new Paragraph({
                    children: [new TextRun({ text: cell ?? '', font: 'Arial', size: 18 })],
                }),
            ],
        })),
    }));
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}
function str(v) {
    if (v == null)
        return '';
    if (typeof v === 'string')
        return v.trim();
    if (typeof v === 'number' || typeof v === 'boolean')
        return String(v);
    return '';
}
function renderStringList(items, children, indent = 1) {
    if (!Array.isArray(items))
        return;
    for (const item of items) {
        if (typeof item === 'string')
            children.push(bullet(item, indent - 1));
        else if (item && typeof item === 'object') {
            const text = item.description ?? item.statement ?? item.text ?? JSON.stringify(item);
            children.push(bullet(str(text), indent - 1));
        }
    }
}
function renderMetadata(metadata, children) {
    children.push(h1('Metadata'));
    const pairs = [];
    const SKIP = new Set(['stakeholders', 'change_log']);
    for (const [k, v] of Object.entries(metadata)) {
        if (SKIP.has(k))
            continue;
        if (typeof v === 'string' || typeof v === 'number') {
            pairs.push([k.replace(/_/g, ' '), str(v)]);
        }
    }
    if (pairs.length)
        children.push(kvTable(pairs));
    // Stakeholders table
    const stakeholders = metadata.stakeholders;
    if (Array.isArray(stakeholders) && stakeholders.length) {
        children.push(h2('Stakeholders'));
        children.push(dataTable(['Role', 'Name / Team', 'Concerns'], stakeholders.map((s) => [str(s.role), str(s.name), str(s.concerns)])));
    }
    // Change log table
    const changeLog = metadata.change_log;
    if (Array.isArray(changeLog) && changeLog.length) {
        children.push(h2('Change Log'));
        children.push(dataTable(['Version', 'Date', 'Author', 'Changes'], changeLog.map((c) => [
            str(c.version),
            str(c.date),
            str(c.author),
            Array.isArray(c.changes) ? c.changes.map(str).join('\n') : str(c.changes),
        ])));
    }
}
function renderReadingGuide(data, children) {
    children.push(h1('Reading Guide'));
    if (data.how_to_use)
        children.push(body(str(data.how_to_use)));
    const map = data.section_map;
    if (Array.isArray(map) && map.length) {
        children.push(h2('Section Map'));
        children.push(dataTable(['Section', 'Audience', 'Concern'], map.map((m) => [str(m.section), str(m.audience), str(m.concern)])));
    }
}
function renderScope(data, children) {
    children.push(h1('Scope'));
    if (data.statement)
        children.push(body(str(data.statement)));
    if (Array.isArray(data.in_scope) && data.in_scope.length) {
        children.push(h2('In Scope'));
        renderStringList(data.in_scope, children);
    }
    if (Array.isArray(data.out_of_scope) && data.out_of_scope.length) {
        children.push(h2('Out of Scope'));
        renderStringList(data.out_of_scope, children);
    }
    if (data.boundary_definition) {
        children.push(h2('Boundary Definition'));
        children.push(body(str(data.boundary_definition)));
    }
    if (Array.isArray(data.assumptions) && data.assumptions.length) {
        children.push(h2('Assumptions'));
        for (const a of data.assumptions) {
            const text = typeof a === 'string' ? a : str(a.assumption);
            children.push(bullet(text));
            if (a.consequence_if_violated)
                children.push(body(`→ ${str(a.consequence_if_violated)}`, 1));
        }
    }
}
function renderDriversAndPrinciples(data, children) {
    children.push(h1('Drivers and Principles'));
    if (Array.isArray(data.drivers) && data.drivers.length) {
        children.push(h2('Business Drivers'));
        for (const d of data.drivers) {
            children.push(h3(`${str(d.id)} — ${str(d.description).split('\n')[0].substring(0, 80)}`));
            if (d.description)
                children.push(body(str(d.description)));
            if (d.architecture_response) {
                children.push(body('Architecture response:'));
                children.push(body(str(d.architecture_response), 1));
            }
        }
    }
    if (Array.isArray(data.principles) && data.principles.length) {
        children.push(h2('Architecture Principles'));
        children.push(dataTable(['ID', 'Principle', 'How Applied'], data.principles.map((p) => [str(p.id), str(p.name), str(p.how_applied)])));
    }
}
function renderView(name, data, children, diagramImages, diagramKey) {
    children.push(h2(name));
    const desc = data.description ?? data.narrative ?? data.overview;
    if (desc)
        children.push(body(str(desc)));
    // Render diagram if available
    const imgBuf = diagramImages.get(diagramKey);
    if (imgBuf && imgBuf.length > 0) {
        children.push(diagImage(imgBuf));
    }
    else if (data.diagram_source || data.diagram || data.mermaid) {
        children.push(italicNote('[Diagram could not be rendered — Kroki API may be unavailable]'));
    }
    // Narrative steps (data flow view)
    if (Array.isArray(data.narrative_steps)) {
        for (const step of data.narrative_steps) {
            children.push(bullet(`Step ${step.step ?? ''}: ${str(step.description)}`));
        }
    }
}
function renderArchitectureViews(data, children, diagramImages) {
    children.push(h1('Architecture Views'));
    const VIEW_LABELS = {
        context: 'Context View (C4 Level 1)',
        functional: 'Functional / Container View',
        deployment: 'Deployment View',
        data_flow: 'Data Flow View',
        security: 'Security View',
    };
    for (const [key, viewData] of Object.entries(data)) {
        if (typeof viewData !== 'object' || viewData === null)
            continue;
        const label = VIEW_LABELS[key] ?? key.replace(/_/g, ' ');
        const diagramKey = `sections.architecture_views.${key}.diagram_source`;
        renderView(label, viewData, children, diagramImages, diagramKey);
    }
}
function renderCrosscuttingConcerns(data, children) {
    children.push(h1('Crosscutting Concerns'));
    for (const [key, value] of Object.entries(data)) {
        children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
        if (typeof value === 'string') {
            children.push(body(value));
        }
        else if (Array.isArray(value)) {
            renderStringList(value, children);
        }
        else if (typeof value === 'object' && value !== null) {
            for (const [k, v] of Object.entries(value)) {
                children.push(h3(k.replace(/_/g, ' ')));
                if (typeof v === 'string')
                    children.push(body(v));
                else if (Array.isArray(v))
                    renderStringList(v, children);
            }
        }
    }
}
function renderArchitectureDecisions(data, children) {
    children.push(h1('Architecture Decisions (ADRs)'));
    const adrs = Array.isArray(data) ? data : Object.values(data);
    for (const adr of adrs) {
        if (typeof adr !== 'object' || !adr)
            continue;
        const title = `${str(adr.id) || ''} — ${str(adr.title) || str(adr.decision_title) || ''}`;
        children.push(h2(title.replace(/^— /, '')));
        const pairs = [];
        if (adr.status)
            pairs.push(['Status', str(adr.status)]);
        if (adr.date)
            pairs.push(['Date', str(adr.date)]);
        if (pairs.length)
            children.push(kvTable(pairs));
        if (adr.context) {
            children.push(h3('Context'));
            children.push(body(str(adr.context)));
        }
        if (adr.decision) {
            children.push(h3('Decision'));
            children.push(body(str(adr.decision)));
        }
        if (adr.consequences) {
            children.push(h3('Consequences'));
            children.push(body(str(adr.consequences)));
        }
        if (Array.isArray(adr.alternatives_considered) && adr.alternatives_considered.length) {
            children.push(h3('Alternatives Considered'));
            for (const alt of adr.alternatives_considered) {
                if (typeof alt === 'string')
                    children.push(bullet(alt));
                else
                    children.push(bullet(`${str(alt.option || alt.name || '')}: ${str(alt.reason || alt.rationale || '')}`));
            }
        }
    }
}
function renderQualityAttributes(data, children) {
    children.push(h1('Quality Attributes'));
    const items = Array.isArray(data) ? data : Object.values(data);
    if (!items.length)
        return;
    const first = items[0];
    if (typeof first === 'object' && first !== null) {
        const headers = Object.keys(first).map((k) => k.replace(/_/g, ' '));
        const rows = items.map((item) => Object.values(item).map(str));
        children.push(dataTable(headers, rows));
    }
}
function renderOperationalModel(data, children) {
    children.push(h1('Operational Model'));
    const STRING_FIELDS = ['deployment_strategy', 'release_process', 'review_cadence'];
    for (const f of STRING_FIELDS) {
        if (data[f]) {
            children.push(h2(f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
            children.push(body(str(data[f])));
        }
    }
    const LIST_FIELDS = ['environments', 'operational_runbooks'];
    for (const f of LIST_FIELDS) {
        if (Array.isArray(data[f]) && data[f].length) {
            children.push(h2(f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
            renderStringList(data[f], children);
        }
    }
    // Forward any sub-objects we haven't explicitly handled
    for (const [key, value] of Object.entries(data)) {
        if ([...STRING_FIELDS, ...LIST_FIELDS].includes(key))
            continue;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
            for (const [k, v] of Object.entries(value)) {
                if (typeof v === 'string')
                    children.push(label(k.replace(/_/g, ' '), v));
                else if (Array.isArray(v))
                    renderStringList(v, children);
            }
        }
    }
}
function renderImplementationGuidance(data, children) {
    children.push(h1('Implementation Guidance'));
    for (const [key, value] of Object.entries(data)) {
        children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
        if (typeof value === 'string')
            children.push(body(value));
        else if (Array.isArray(value))
            renderStringList(value, children);
        else if (typeof value === 'object' && value !== null) {
            for (const [k, v] of Object.entries(value)) {
                children.push(h3(k.replace(/_/g, ' ')));
                if (typeof v === 'string')
                    children.push(body(v));
                else if (Array.isArray(v))
                    renderStringList(v, children);
            }
        }
    }
}
function renderGovernance(data, children) {
    children.push(h1('Governance and Compliance'));
    const compliance = data.compliance_mapping;
    if (Array.isArray(compliance) && compliance.length) {
        children.push(h2('Compliance Mapping'));
        const headers = Object.keys(compliance[0]).map((k) => k.replace(/_/g, ' '));
        const rows = compliance.map((c) => Object.values(c).map(str));
        children.push(dataTable(headers, rows));
    }
    const risks = data.risk_register;
    if (Array.isArray(risks) && risks.length) {
        children.push(h2('Risk Register'));
        children.push(dataTable(['Risk', 'Likelihood', 'Impact', 'Mitigation'], risks.map((r) => [str(r.risk), str(r.likelihood), str(r.impact), str(r.mitigation)])));
    }
    if (data.review_cadence) {
        children.push(h2('Review Cadence'));
        children.push(body(str(data.review_cadence)));
    }
}
function renderGlossary(data, children) {
    children.push(h1('Glossary'));
    const items = Array.isArray(data) ? data : Object.values(data);
    if (!items.length)
        return;
    children.push(dataTable(['Term', 'Definition'], items.map((g) => typeof g === 'object' ? [str(g.term ?? g.name ?? ''), str(g.definition ?? '')] : [str(g), ''])));
}
// Generic fallback for unknown sections
function renderGenericSection(title, data, children) {
    children.push(h1(title));
    if (typeof data === 'string') {
        children.push(body(data));
    }
    else if (Array.isArray(data)) {
        renderStringList(data, children);
    }
    else if (typeof data === 'object' && data !== null) {
        for (const [key, value] of Object.entries(data)) {
            children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
            if (typeof value === 'string')
                children.push(body(value));
            else if (Array.isArray(value))
                renderStringList(value, children);
            else if (typeof value === 'object' && value !== null) {
                for (const [k, v] of Object.entries(value)) {
                    if (typeof v === 'string')
                        children.push(label(k.replace(/_/g, ' '), v));
                    else if (Array.isArray(v))
                        renderStringList(v, children);
                }
            }
        }
    }
}
// Component catalog / classification — array of components with name/type/etc.
function renderComponentSection(title, data, children) {
    children.push(h1(title));
    const items = Array.isArray(data.components ?? data) ? (data.components ?? data) : [];
    if (items.length && typeof items[0] === 'object') {
        const headers = ['Name', 'Type', 'Technology', 'Responsibility'];
        const rows = items.map((c) => [
            str(c.name),
            str(c.type),
            str(c.technology),
            str(c.responsibility),
        ]);
        children.push(dataTable(headers, rows));
    }
    // Also render any non-component string fields
    if (data.mandatory_components) {
        children.push(h2('Mandatory Components'));
        renderStringList(data.mandatory_components, children);
    }
    if (data.optional_components) {
        children.push(h2('Optional Components'));
        renderStringList(data.optional_components, children);
    }
}
// ─── Document assembly ────────────────────────────────────────────────────────
const KNOWN_SECTIONS = {
    reading_guide: (d, c) => renderReadingGuide(d, c),
    scope: (d, c) => renderScope(d, c),
    drivers_and_principles: (d, c) => renderDriversAndPrinciples(d, c),
    architecture_views: (d, c, imgs) => renderArchitectureViews(d, c, imgs),
    crosscutting_concerns: (d, c) => renderCrosscuttingConcerns(d, c),
    architecture_decisions: (d, c) => renderArchitectureDecisions(d, c),
    quality_attributes: (d, c) => renderQualityAttributes(d, c),
    operational_model: (d, c) => renderOperationalModel(d, c),
    implementation_guidance: (d, c) => renderImplementationGuidance(d, c),
    implementation_artifacts: (d, c) => renderImplementationGuidance(d, c),
    governance: (d, c) => renderGovernance(d, c),
    glossary: (d, c) => renderGlossary(d, c),
    component_classification: (d, c) => renderComponentSection('Component Classification', d, c),
    components: (d, c) => renderComponentSection('Components', d, c),
};
function titlePage(meta) {
    const title = str(meta.title) || 'Architecture Artifact';
    const subtitle = str(meta.artifact_type ?? '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return [
        new Paragraph({ children: [], spacing: { before: 2000 } }),
        new Paragraph({
            children: [new TextRun({ text: title, font: 'Arial', size: 56, bold: true, color: NAVY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
        }),
        new Paragraph({
            children: [new TextRun({ text: subtitle, font: 'Arial', size: 28, color: MID_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: `Version ${str(meta.version) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Status: ${str(meta.status) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Owner: ${str(meta.owner) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: str(meta.effective_date) ? `Effective: ${str(meta.effective_date)}` : '',
                    font: 'Arial',
                    size: 20,
                    color: MID_GREY,
                }),
            ],
            alignment: AlignmentType.CENTER,
        }),
        pageBreak(),
    ];
}
// ─── Main export function ─────────────────────────────────────────────────────
export async function exportToDocx(artifactData) {
    const meta = artifactData.metadata ?? {};
    const sections = artifactData.sections ?? {};
    // 1. Extract all diagram references
    const diagRefs = extractDiagrams(artifactData);
    // 2. Render diagrams in parallel (max 10 at a time to avoid rate-limiting)
    const diagramImages = new Map();
    const BATCH = 10;
    for (let i = 0; i < diagRefs.length; i += BATCH) {
        const batch = diagRefs.slice(i, i + BATCH);
        const results = await Promise.all(batch.map((r) => renderMermaidDiagram(r.source)));
        batch.forEach((r, idx) => diagramImages.set(r.key, results[idx]));
    }
    // 3. Build document body
    const children = [];
    // Title page
    for (const p of titlePage(meta))
        children.push(p);
    // Metadata block
    if (Object.keys(meta).length) {
        renderMetadata(meta, children);
        children.push(horizontalRule());
    }
    // Sections — known first (in preferred order), then unknowns
    const sectionOrder = [
        'reading_guide',
        'scope',
        'drivers_and_principles',
        'architecture_views',
        'crosscutting_concerns',
        'component_classification',
        'components',
        'architecture_decisions',
        'quality_attributes',
        'operational_model',
        'implementation_guidance',
        'implementation_artifacts',
        'governance',
        'glossary',
    ];
    const rendered = new Set();
    for (const key of sectionOrder) {
        if (key in sections) {
            const renderer = KNOWN_SECTIONS[key];
            if (renderer) {
                children.push(pageBreak());
                renderer(sections[key], children, diagramImages);
                rendered.add(key);
            }
        }
    }
    // Unknown sections (anything not in sectionOrder or KNOWN_SECTIONS)
    for (const [key, value] of Object.entries(sections)) {
        if (!rendered.has(key)) {
            children.push(pageBreak());
            const title = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            renderGenericSection(title, value, children);
        }
    }
    // 4. Assemble the Word document
    const title = str(meta.title) || 'Architecture Artifact';
    const doc = new Document({
        title,
        creator: str(meta.owner) || 'EAROS',
        description: str(meta.purpose),
        styles: {
            default: {
                document: {
                    run: { font: 'Arial', size: 20 },
                },
            },
        },
        sections: [
            {
                properties: {
                    type: SectionType.CONTINUOUS,
                    page: {
                        margin: { top: 720, right: 720, bottom: 720, left: 720 },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: title, font: 'Arial', size: 16, color: MID_GREY }),
                                    new TextRun({ text: '\t', font: 'Arial', size: 16 }),
                                    new TextRun({ text: 'EAROS Architecture Document', font: 'Arial', size: 16, color: MID_GREY }),
                                ],
                                border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: MID_GREY }),
                                    new SimpleField('PAGE'),
                                ],
                                border: { top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
                            }),
                        ],
                    }),
                },
                children,
            },
        ],
    });
    return Packer.toBuffer(doc);
}
