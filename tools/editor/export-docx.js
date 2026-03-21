/**
 * EAROS — Export artifact data to a Microsoft Word (.docx) document.
 *
 * Mermaid diagrams are rendered to PNG via the Kroki public API (no local
 * Chromium required).  If Kroki is unreachable the diagram placeholder is
 * replaced with an italic note rather than failing the entire export.
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, PageBreak, Header, Footer, SectionType, SimpleField, TableOfContents, } from 'docx';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
function loadArtifactSchema() {
    const candidates = [
        resolve(MODULE_DIR, 'schemas', 'artifact.schema.json'),
        resolve(MODULE_DIR, '../schemas', 'artifact.schema.json'),
        resolve(MODULE_DIR, '../../standard/schemas', 'artifact.schema.json'),
    ];
    for (const candidate of candidates) {
        try {
            return JSON.parse(readFileSync(candidate, 'utf8'));
        }
        catch {
            // Try next candidate path.
        }
    }
    console.warn('[export-docx] Artifact schema not found; falling back to shape-driven rendering');
    return null;
}
const ARTIFACT_SCHEMA = loadArtifactSchema();
// ─── Kroki Mermaid rendering ──────────────────────────────────────────────────
const KROKI_URL = 'https://kroki.io/mermaid/png';
async function renderMermaidDiagram(diagram, label) {
    try {
        const response = await fetch(KROKI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: diagram.trim(),
            signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
            console.warn(`[export-docx] Diagram render failed for "${label}": HTTP ${response.status}`);
            return null;
        }
        const arr = await response.arrayBuffer();
        const buf = Buffer.from(arr);
        if (buf.length === 0) {
            console.warn(`[export-docx] Diagram render returned empty buffer for "${label}"`);
            return null;
        }
        return buf;
    }
    catch (err) {
        console.warn(`[export-docx] Diagram render error for "${label}":`, err);
        return null;
    }
}
function extractDiagrams(obj, path = '', label = '') {
    if (!obj || typeof obj !== 'object')
        return [];
    const refs = [];
    // Fields that may contain Mermaid source
    const DIAGRAM_FIELDS = new Set(['diagram_source', 'diagram', 'mermaid', 'mermaid_source']);
    for (const [k, v] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k;
        const l = label ? `${label} › ${k}` : k;
        if (DIAGRAM_FIELDS.has(k) && typeof v === 'string' && v.trim()) {
            refs.push({ key: p, source: v.trim(), label: l });
        }
        else if (Array.isArray(v)) {
            v.forEach((item, i) => refs.push(...extractDiagrams(item, `${p}[${i}]`, `${l}[${i}]`)));
        }
        else if (typeof v === 'object' && v !== null) {
            refs.push(...extractDiagrams(v, p, l));
        }
    }
    return refs;
}
// ─── docx helpers ─────────────────────────────────────────────────────────────
const NAVY = '1F3864';
const DARK_GREY = '404040';
const MID_GREY = '777777';
const ORANGE = 'C55A11';
// Word ignores raw `\n` inside a text node, so emit explicit line breaks.
function textRuns(text, run) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    while (lines.length > 1 && lines[lines.length - 1] === '')
        lines.pop();
    return lines.map((line, index) => new TextRun({
        ...run,
        text: line === '' && lines.length > 1 ? ' ' : line,
        ...(index > 0 ? { break: 1 } : {}),
    }));
}
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
        style: 'Normal',
        children: textRuns(text, { font: 'Arial', size: 20, color: DARK_GREY }),
        spacing: { before: 60, after: 60 },
        indent: indent ? { left: indent * 360 } : undefined,
    });
}
function bullet(text, level = 0) {
    return new Paragraph({
        children: textRuns(text, { font: 'Arial', size: 20, color: DARK_GREY }),
        bullet: { level },
        spacing: { before: 40, after: 40 },
    });
}
function label(key, value) {
    return new Paragraph({
        style: 'Normal',
        children: [
            new TextRun({ text: `${key}: `, font: 'Arial', size: 20, bold: true, color: DARK_GREY }),
            ...textRuns(value, { font: 'Arial', size: 20, color: DARK_GREY }),
        ],
        spacing: { before: 40, after: 40 },
    });
}
function italicNote(text) {
    return new Paragraph({
        style: 'Normal',
        children: textRuns(text, { font: 'Arial', size: 18, italics: true, color: MID_GREY }),
        spacing: { before: 60, after: 60 },
    });
}
/** Indented consequence line under an assumption bullet */
function consequence(text) {
    return new Paragraph({
        style: 'Normal',
        children: textRuns(`→ ${text}`, { font: 'Arial', size: 18, italics: true, color: MID_GREY }),
        indent: { left: 720 },
        spacing: { before: 20, after: 40 },
    });
}
function pageBreak() {
    return new Paragraph({ style: 'Normal', children: [new PageBreak()] });
}
function horizontalRule() {
    return new Paragraph({
        style: 'Normal',
        border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 200, after: 200 },
        children: [],
    });
}
function diagImage(pngBuffer) {
    return new Paragraph({
        style: 'Normal',
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
                    children: [new Paragraph({ style: 'Normal', children: textRuns(k, { bold: true, font: 'Arial', size: 18 }) })],
                }),
                new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ style: 'Normal', children: textRuns(v, { font: 'Arial', size: 18 }) })],
                }),
            ],
        })),
    });
}
// Generic header-row table
function dataTable(headers, rows) {
    const columnCount = headers.length;
    const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h) => new TableCell({
            shading: { fill: NAVY },
            children: [
                new Paragraph({
                    style: 'Normal',
                    children: textRuns(h, { bold: true, font: 'Arial', size: 18, color: 'FFFFFF' }),
                }),
            ],
        })),
    });
    const dataRows = rows.map((row) => new TableRow({
        children: Array.from({ length: columnCount }, (_, index) => row[index] ?? '').map((cell) => new TableCell({
            children: [
                new Paragraph({
                    style: 'Normal',
                    children: textRuns(cell ?? '', { font: 'Arial', size: 18 }),
                }),
            ],
        })),
    }));
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}
function objectTable(items, schema) {
    if (!items.length)
        return null;
    const keys = orderedObjectKeys(items, schema).filter((key) => items.every((item) => isScalarish(item?.[key])));
    if (!keys.length)
        return null;
    return dataTable(keys.map((key) => displayLabel(key, propertySchema(schema, key))), items.map((item) => keys.map((key) => str(item?.[key]))));
}
// ─── Section renderers ────────────────────────────────────────────────────────
function str(v) {
    if (v == null)
        return '';
    if (typeof v === 'string')
        return v.trim();
    if (typeof v === 'number' || typeof v === 'boolean')
        return String(v);
    return '';
}
function prettyLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function displayLabel(key, schema) {
    return str(schema?.title) || prettyLabel(key);
}
function heading(level, text) {
    if (level <= 1)
        return h1(text);
    if (level === 2)
        return h2(text);
    return h3(text);
}
function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function isScalarish(value) {
    return value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
function schemaProperties(schema) {
    return isPlainObject(schema?.properties) ? schema.properties : {};
}
function propertySchema(schema, key) {
    return schemaProperties(schema)[key];
}
function itemSchema(schema) {
    return isPlainObject(schema?.items) ? schema.items : undefined;
}
function sectionSchema(key) {
    const sections = propertySchema(ARTIFACT_SCHEMA, 'sections');
    return propertySchema(sections, key);
}
function topLevelSchema(key) {
    return propertySchema(ARTIFACT_SCHEMA, key);
}
function orderedObjectKeys(items, schema) {
    const objects = Array.isArray(items) ? items.filter(isPlainObject) : [items].filter(isPlainObject);
    const keys = [];
    const seen = new Set();
    for (const key of Object.keys(schemaProperties(schema))) {
        if (objects.some((item) => key in item)) {
            seen.add(key);
            keys.push(key);
        }
    }
    for (const item of objects) {
        for (const key of Object.keys(item)) {
            if (seen.has(key))
                continue;
            seen.add(key);
            keys.push(key);
        }
    }
    return keys;
}
function isScalarObject(value) {
    return isPlainObject(value) && Object.values(value).every(isScalarish);
}
function primaryObjectField(value, schema) {
    const preferred = ['title', 'name', 'id', 'term', 'section', 'control', 'role', 'version'];
    for (const key of preferred) {
        const text = str(value[key]);
        if (text)
            return { key, text };
    }
    for (const key of orderedObjectKeys(value, schema)) {
        const text = str(value[key]);
        if (text)
            return { key, text };
    }
    return null;
}
function renderStructuredArray(items, children, schema, level = 2) {
    if (!items.length)
        return;
    if (items.every(isScalarish)) {
        for (const item of items)
            children.push(bullet(str(item), Math.max(level - 2, 0)));
        return;
    }
    if (items.every(isScalarObject)) {
        const table = objectTable(items, itemSchema(schema));
        if (table) {
            children.push(table);
            return;
        }
    }
    const childSchema = itemSchema(schema);
    for (const [index, item] of items.entries()) {
        if (isScalarish(item)) {
            children.push(bullet(str(item), Math.max(level - 2, 0)));
            continue;
        }
        if (!isPlainObject(item))
            continue;
        const primary = primaryObjectField(item, childSchema);
        if (primary) {
            children.push(heading(level, primary.text));
        }
        else {
            children.push(heading(level, `Item ${index + 1}`));
        }
        if (isScalarObject(item)) {
            const pairs = orderedObjectKeys(item, childSchema)
                .filter((key) => key !== primary?.key && str(item[key]))
                .map((key) => [displayLabel(key, propertySchema(childSchema, key)), str(item[key])]);
            if (pairs.length)
                children.push(kvTable(pairs));
            continue;
        }
        renderStructuredObject(item, children, childSchema, Math.min(level + 1, 3), new Set(primary ? [primary.key] : []));
    }
}
function renderStructuredObject(value, children, schema, level = 2, skipKeys = new Set()) {
    for (const key of orderedObjectKeys(value, schema)) {
        if (skipKeys.has(key))
            continue;
        const child = value[key];
        if (child == null || child === '')
            continue;
        const childSchema = propertySchema(schema, key);
        const title = displayLabel(key, childSchema);
        children.push(heading(level, title));
        renderStructuredValue(child, children, childSchema, Math.min(level + 1, 3));
    }
}
function renderStructuredValue(value, children, schema, level = 2) {
    if (value == null || value === '')
        return;
    if (isScalarish(value)) {
        children.push(body(str(value)));
        return;
    }
    if (Array.isArray(value)) {
        renderStructuredArray(value, children, schema, level);
        return;
    }
    if (isPlainObject(value)) {
        renderStructuredObject(value, children, schema, level);
    }
}
function renderStringList(items, children, indent = 1, schema) {
    if (!Array.isArray(items))
        return;
    if (items.length && items.every(isScalarObject)) {
        const table = objectTable(items, schema);
        if (table) {
            children.push(table);
            return;
        }
    }
    for (const item of items) {
        if (isScalarish(item))
            children.push(bullet(str(item), indent - 1));
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
                children.push(consequence(str(a.consequence_if_violated)));
        }
    }
}
function renderDriversAndPrinciples(data, children) {
    children.push(h1('Business Context and Drivers'));
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
function renderView(viewLabel, data, children, diagramImages, diagramKey) {
    children.push(h2(viewLabel));
    const desc = data.description ?? data.narrative ?? data.overview;
    if (desc)
        children.push(body(str(desc)));
    // Render diagram if available
    const imgBuf = diagramImages.get(diagramKey);
    if (imgBuf && imgBuf.length > 0) {
        children.push(diagImage(imgBuf));
    }
    else if (data.diagram_source || data.diagram || data.mermaid || data.mermaid_source) {
        children.push(italicNote(`[${viewLabel} diagram could not be rendered — Kroki API may be unavailable]`));
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
        const viewLabel = VIEW_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const diagramKey = `sections.architecture_views.${key}.diagram_source`;
        renderView(viewLabel, viewData, children, diagramImages, diagramKey);
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
        if (adr.rationale) {
            children.push(h3('Rationale'));
            children.push(body(str(adr.rationale)));
        }
        if (adr.consequences) {
            children.push(h3('Consequences'));
            children.push(body(str(adr.consequences)));
        }
        // Trade-offs (structured or string)
        if (adr.trade_offs) {
            children.push(h3('Trade-offs'));
            if (typeof adr.trade_offs === 'string') {
                children.push(body(str(adr.trade_offs)));
            }
            else if (typeof adr.trade_offs === 'object') {
                if (Array.isArray(adr.trade_offs.benefits) && adr.trade_offs.benefits.length) {
                    children.push(body('Benefits:'));
                    renderStringList(adr.trade_offs.benefits, children);
                }
                if (Array.isArray(adr.trade_offs.drawbacks) && adr.trade_offs.drawbacks.length) {
                    children.push(body('Drawbacks:'));
                    renderStringList(adr.trade_offs.drawbacks, children);
                }
            }
        }
        if (adr.revisit_trigger) {
            children.push(h3('Revisit Trigger'));
            children.push(body(str(adr.revisit_trigger)));
        }
        // Handle both 'alternatives_considered' and 'options' field names
        const alternatives = adr.alternatives_considered ?? adr.options;
        if (Array.isArray(alternatives) && alternatives.length) {
            children.push(h3('Options Considered'));
            for (const alt of alternatives) {
                if (typeof alt === 'string') {
                    children.push(bullet(alt));
                }
                else {
                    const id = str(alt.id ?? alt.option ?? alt.name ?? '');
                    const desc = str(alt.description ?? alt.reason ?? alt.rationale ?? '');
                    const optTitle = id && desc ? `Option ${id}: ${desc}` : id || desc;
                    children.push(bullet(optTitle));
                    if (Array.isArray(alt.pros) && alt.pros.length) {
                        children.push(body('Pros:', 1));
                        for (const p of alt.pros)
                            children.push(bullet(str(p), 1));
                    }
                    if (Array.isArray(alt.cons) && alt.cons.length) {
                        children.push(body('Cons:', 1));
                        for (const c of alt.cons)
                            children.push(bullet(str(c), 1));
                    }
                }
            }
        }
    }
}
function renderQualityAttributes(data, children) {
    children.push(h1('Quality Attributes'));
    const items = Array.isArray(data) ? data : Object.values(data);
    if (!items.length)
        return;
    const table = objectTable(items.filter((item) => item && typeof item === 'object' && !Array.isArray(item)), itemSchema(sectionSchema('quality_attributes')));
    if (table)
        children.push(table);
}
function renderOperationalModel(data, children) {
    children.push(h1('Operational Model'));
    renderStructuredObject(data, children, sectionSchema('operational_model'), 2);
}
function renderImplementationGuidance(data, children) {
    children.push(h1('Implementation'));
    for (const [key, value] of Object.entries(data)) {
        children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
        if (typeof value === 'string')
            children.push(body(value));
        else if (Array.isArray(value)) {
            // If array of objects with name/description, render as sub-items
            for (const item of value) {
                if (typeof item === 'string') {
                    children.push(bullet(item));
                }
                else if (typeof item === 'object' && item !== null) {
                    const name = str(item.name ?? item.title ?? item.id ?? '');
                    const desc = str(item.description ?? item.purpose ?? '');
                    if (name)
                        children.push(h3(name));
                    if (desc)
                        children.push(body(desc));
                    // Remaining string fields as labels
                    for (const [k, v] of Object.entries(item)) {
                        if (k === 'name' || k === 'title' || k === 'id' || k === 'description' || k === 'purpose')
                            continue;
                        if (typeof v === 'string')
                            children.push(label(k.replace(/_/g, ' '), v));
                    }
                }
            }
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
function renderGovernance(data, children) {
    children.push(h1('Governance and Compliance'));
    const schema = sectionSchema('governance');
    const compliance = data.compliance_mapping;
    if (Array.isArray(compliance) && compliance.length) {
        children.push(h2('Compliance Mapping'));
        const table = objectTable(compliance.filter((item) => item && typeof item === 'object' && !Array.isArray(item)), itemSchema(propertySchema(schema, 'compliance_mapping')));
        if (table)
            children.push(table);
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
    // Remaining object sub-sections
    for (const [key, value] of Object.entries(data)) {
        if (['compliance_mapping', 'risk_register', 'review_cadence'].includes(key))
            continue;
        children.push(h2(displayLabel(key, propertySchema(schema, key))));
        if (typeof value === 'string')
            children.push(body(value));
        else if (Array.isArray(value))
            renderStringList(value, children, 1, propertySchema(schema, key));
        else if (typeof value === 'object' && value !== null) {
            for (const [k, v] of Object.entries(value)) {
                if (typeof v === 'string')
                    children.push(label(displayLabel(k, propertySchema(propertySchema(schema, key), k)), v));
                else if (Array.isArray(v))
                    renderStringList(v, children, 1, propertySchema(propertySchema(schema, key), k));
            }
        }
    }
}
function renderRaid(data, children) {
    children.push(h1('RAID Register'));
    const SECTION_LABELS = {
        risks: 'Risks',
        assumptions: 'Assumptions',
        issues: 'Issues',
        dependencies: 'Dependencies',
    };
    for (const [key, value] of Object.entries(data)) {
        if (!Array.isArray(value) || !value.length)
            continue;
        const sectionTitle = SECTION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        children.push(h2(sectionTitle));
        for (const item of value) {
            if (typeof item === 'string') {
                children.push(bullet(item));
                continue;
            }
            if (typeof item !== 'object' || !item)
                continue;
            const id = str(item.id ?? '');
            const desc = str(item.description ?? item.statement ?? item.text ?? '');
            const heading = id ? `${id}: ${desc.substring(0, 80)}` : desc.substring(0, 80);
            if (heading)
                children.push(h3(heading));
            if (desc && desc.length > 80)
                children.push(body(desc));
            const FIELD_LABELS = {
                likelihood: 'Likelihood',
                impact: 'Impact',
                owner: 'Owner',
                residual_risk: 'Residual Risk',
                status: 'Status',
                due_date: 'Due Date',
                dependency_type: 'Dependency Type',
                source: 'Source',
            };
            for (const [f, l] of Object.entries(FIELD_LABELS)) {
                if (item[f])
                    children.push(label(l, str(item[f])));
            }
            if (item.mitigation) {
                children.push(h3('Mitigation'));
                children.push(body(str(item.mitigation), 1));
            }
            if (item.resolution) {
                children.push(h3('Resolution'));
                children.push(body(str(item.resolution), 1));
            }
        }
    }
}
function renderDecisionsAndActions(data, children) {
    children.push(h1('Governance Decision'));
    if (data.governance_outcome) {
        children.push(label('Outcome', str(data.governance_outcome)));
    }
    if (data.decision_statement) {
        children.push(h2('Decision Statement'));
        children.push(body(str(data.decision_statement)));
    }
    if (Array.isArray(data.conditions) && data.conditions.length) {
        children.push(h2('Conditions'));
        renderStringList(data.conditions, children);
    }
    if (Array.isArray(data.next_actions) && data.next_actions.length) {
        children.push(h2('Next Actions'));
        children.push(dataTable(['Action', 'Owner', 'Target Date'], data.next_actions.map((a) => [str(a.action), str(a.owner), str(a.target_date)])));
    }
}
function renderGettingStarted(data, children) {
    children.push(h1('Getting Started'));
    if (data.estimated_time_to_first_deployment) {
        children.push(body(str(data.estimated_time_to_first_deployment)));
    }
    if (Array.isArray(data.prerequisites) && data.prerequisites.length) {
        children.push(h2('Prerequisites'));
        renderStringList(data.prerequisites, children);
    }
    if (Array.isArray(data.steps) && data.steps.length) {
        children.push(h2('Deployment Steps'));
        for (const step of data.steps) {
            if (typeof step === 'string') {
                children.push(bullet(step));
                continue;
            }
            if (typeof step !== 'object' || !step)
                continue;
            const stepTitle = str(step.title ?? step.name ?? `Step ${step.step ?? ''}`);
            children.push(h3(stepTitle));
            if (step.description)
                children.push(body(str(step.description)));
            if (step.command) {
                children.push(italicNote(str(step.command)));
            }
            if (step.validation) {
                children.push(body(`Validation: ${str(step.validation)}`, 1));
            }
        }
    }
    if (Array.isArray(data.troubleshooting) && data.troubleshooting.length) {
        children.push(h2('Troubleshooting'));
        for (const t of data.troubleshooting) {
            if (typeof t === 'string') {
                children.push(bullet(t));
            }
            else if (typeof t === 'object' && t) {
                children.push(h3(str(t.symptom ?? '')));
                if (t.cause)
                    children.push(label('Cause', str(t.cause)));
                if (t.resolution)
                    children.push(body(str(t.resolution), 1));
            }
        }
    }
    // Any remaining fields
    for (const [key, value] of Object.entries(data)) {
        if (['estimated_time_to_first_deployment', 'prerequisites', 'steps', 'troubleshooting'].includes(key))
            continue;
        children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
        if (typeof value === 'string')
            children.push(body(value));
        else if (Array.isArray(value))
            renderStringList(value, children);
    }
}
function renderEvolution(data, children) {
    children.push(h1('Evolution Roadmap'));
    if (data.version)
        children.push(label('Current Version', str(data.version)));
    if (Array.isArray(data.known_limitations) && data.known_limitations.length) {
        children.push(h2('Known Limitations'));
        renderStringList(data.known_limitations, children);
    }
    if (Array.isArray(data.roadmap) && data.roadmap.length) {
        children.push(h2('Roadmap'));
        for (const milestone of data.roadmap) {
            if (typeof milestone !== 'object' || !milestone)
                continue;
            const milestoneTitle = `v${str(milestone.version)} — ${str(milestone.planned_date)}`;
            children.push(h3(milestoneTitle));
            if (Array.isArray(milestone.planned_changes)) {
                renderStringList(milestone.planned_changes, children);
            }
        }
    }
    // Remaining fields
    for (const [key, value] of Object.entries(data)) {
        if (['version', 'known_limitations', 'roadmap'].includes(key))
            continue;
        children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
        if (typeof value === 'string')
            children.push(body(value));
        else if (Array.isArray(value))
            renderStringList(value, children);
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
function renderGenericSection(title, data, children, schema) {
    children.push(h1(title));
    renderStructuredValue(data, children, schema, 2);
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
    decisions: (d, c) => renderArchitectureDecisions(d, c),
    architecture_decisions: (d, c) => renderArchitectureDecisions(d, c),
    quality_attributes: (d, c) => renderQualityAttributes(d, c),
    operational_model: (d, c) => renderOperationalModel(d, c),
    implementation_guidance: (d, c) => renderImplementationGuidance(d, c),
    implementation_artifacts: (d, c) => renderImplementationGuidance(d, c),
    governance: (d, c) => renderGovernance(d, c),
    raid: (d, c) => renderRaid(d, c),
    decisions_and_actions: (d, c) => renderDecisionsAndActions(d, c),
    getting_started: (d, c) => renderGettingStarted(d, c),
    evolution: (d, c) => renderEvolution(d, c),
    glossary: (d, c) => renderGlossary(d, c),
    component_classification: (d, c) => renderComponentSection('Component Classification', d, c),
    components: (d, c) => renderComponentSection('Components', d, c),
};
// Logical reading order — decisions before quality/operational, RAID after governance
const SECTION_ORDER = [
    'reading_guide',
    'scope',
    'drivers_and_principles',
    'architecture_views',
    'crosscutting_concerns',
    'component_classification',
    'components',
    'decisions',
    'architecture_decisions',
    'quality_attributes',
    'operational_model',
    'implementation_guidance',
    'implementation_artifacts',
    'governance',
    'raid',
    'decisions_and_actions',
    'getting_started',
    'evolution',
    'glossary',
];
function titlePage(meta) {
    const title = str(meta.title) || 'Architecture Artifact';
    const subtitle = str(meta.artifact_type ?? '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return [
        new Paragraph({ style: 'Normal', children: [], spacing: { before: 2000 } }),
        new Paragraph({
            style: 'Title',
            children: [new TextRun({ text: title, font: 'Arial', size: 56, bold: true, color: NAVY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
        }),
        new Paragraph({
            style: 'Normal',
            children: [new TextRun({ text: subtitle, font: 'Arial', size: 28, color: MID_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
        }),
        new Paragraph({
            style: 'Normal',
            children: [
                new TextRun({ text: `Version ${str(meta.version) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            style: 'Normal',
            children: [new TextRun({ text: `Status: ${str(meta.status) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            style: 'Normal',
            children: [new TextRun({ text: `Owner: ${str(meta.owner) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
            style: 'Normal',
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
        const results = await Promise.all(batch.map((r) => renderMermaidDiagram(r.source, r.label)));
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
    // Table of Contents (after metadata, before content)
    children.push(pageBreak());
    children.push(new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-3',
    }));
    children.push(pageBreak());
    // Sections — known first (in preferred order), then unknowns
    const rendered = new Set();
    for (const key of SECTION_ORDER) {
        if (key in sections) {
            const renderer = KNOWN_SECTIONS[key];
            if (renderer) {
                children.push(pageBreak());
                renderer(sections[key], children, diagramImages);
                rendered.add(key);
            }
        }
    }
    // Unknown sections (anything not in SECTION_ORDER or KNOWN_SECTIONS)
    for (const [key, value] of Object.entries(sections)) {
        if (!rendered.has(key)) {
            children.push(pageBreak());
            const renderer = KNOWN_SECTIONS[key];
            if (renderer) {
                renderer(value, children, diagramImages);
            }
            else {
                const schema = sectionSchema(key);
                const title = displayLabel(key, schema);
                renderGenericSection(title, value, children, schema);
            }
            rendered.add(key);
        }
    }
    // Top-level keys outside of sections (e.g. glossary in some artifact formats)
    const TOP_LEVEL_SKIP = new Set(['kind', 'artifact_type', 'metadata', 'sections']);
    for (const [key, value] of Object.entries(artifactData)) {
        if (TOP_LEVEL_SKIP.has(key) || rendered.has(key))
            continue;
        children.push(pageBreak());
        const renderer = KNOWN_SECTIONS[key];
        if (renderer) {
            renderer(value, children, diagramImages);
        }
        else {
            const schema = topLevelSchema(key);
            const title = displayLabel(key, schema);
            renderGenericSection(title, value, children, schema);
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
                                style: 'Normal',
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
                                style: 'Normal',
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: MID_GREY }),
                                    new SimpleField('PAGE'),
                                    new TextRun({ text: ' of ', font: 'Arial', size: 16, color: MID_GREY }),
                                    new SimpleField('NUMPAGES'),
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
