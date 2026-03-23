/**
 * EaROS standalone Express server.
 * Serves the pre-built React app from dist/ and provides the API endpoints.
 */
import express from 'express';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, sep } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import open from 'open';
import { exportToDocx, exportRubricToDocx, exportEvaluationToDocx } from './export-docx.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
function findRepoRoot() {
    const cwd = process.cwd();
    if (existsSync(resolve(cwd, 'earos.manifest.yaml')))
        return cwd;
    // Dev fallback: two levels above tools/editor/
    const devRoot = resolve(__dirname, '../..');
    if (existsSync(resolve(devRoot, 'earos.manifest.yaml')))
        return devRoot;
    return cwd;
}
function safeRepoPath(repoRoot, rawPath) {
    const decoded = decodeURIComponent(rawPath);
    const abs = resolve(repoRoot, decoded);
    if (abs !== repoRoot && !abs.startsWith(repoRoot + sep))
        return null;
    return abs;
}
function findAvailablePort(preferred) {
    return new Promise((resolvePort) => {
        const probe = createServer();
        probe.listen(preferred, () => {
            const port = probe.address().port;
            probe.close(() => resolvePort(port));
        });
        probe.on('error', () => {
            // Port in use — let OS assign a random one
            const fallback = createServer();
            fallback.listen(0, () => {
                const port = fallback.address().port;
                fallback.close(() => resolvePort(port));
            });
        });
    });
}
let evalCache = null;
const EVAL_CACHE_TTL = 5000;
export async function startServer(fileArg) {
    const REPO_ROOT = findRepoRoot();
    const distDir = resolve(__dirname, 'dist');
    if (!existsSync(distDir)) {
        console.error('dist/ not found. Run: npm run build');
        process.exit(1);
    }
    const app = express();
    app.use(express.json({ limit: '200mb' }));
    app.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });
    // GET /api/manifest  or  GET /api/files
    const manifestHandler = (_req, res) => {
        const manifestPath = resolve(REPO_ROOT, 'earos.manifest.yaml');
        if (!existsSync(manifestPath)) {
            res.status(404).json({ error: 'earos.manifest.yaml not found — run: earos manifest' });
        }
        else {
            res.json(yaml.load(readFileSync(manifestPath, 'utf8')));
        }
    };
    app.get('/api/manifest', manifestHandler);
    app.get('/api/files', manifestHandler);
    // GET /api/evaluations — recursively scan for evaluation files
    function findEvaluationFiles(baseDir, prefix) {
        const found = [];
        if (!existsSync(baseDir))
            return found;
        try {
            for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
                if (entry.isDirectory()) {
                    found.push(...findEvaluationFiles(resolve(baseDir, entry.name), `${prefix}${entry.name}/`));
                }
                else if (entry.name.endsWith('.evaluation.yaml') || entry.name === 'evaluation.yaml') {
                    found.push({ path: `${prefix}${entry.name}`, name: entry.name });
                }
            }
        }
        catch { /* skip unreadable dirs */ }
        return found;
    }
    function getCachedEvaluationFiles(repoRoot) {
        if (evalCache && Date.now() - evalCache.ts < EVAL_CACHE_TTL)
            return evalCache.files;
        const files = [];
        for (const dir of ['examples', 'evaluations']) {
            files.push(...findEvaluationFiles(resolve(repoRoot, dir), `${dir}/`));
        }
        evalCache = { files, ts: Date.now() };
        return files;
    }
    app.get('/api/evaluations', (_req, res) => {
        const files = getCachedEvaluationFiles(REPO_ROOT);
        res.json({ files });
    });
    // GET /api/evaluations/summary — lightweight metadata per evaluation file
    app.get('/api/evaluations/summary', (_req, res) => {
        const files = getCachedEvaluationFiles(REPO_ROOT);
        const summaries = files.map((f) => {
            const absPath = resolve(REPO_ROOT, f.path);
            try {
                const data = yaml.load(readFileSync(absPath, 'utf8'));
                return {
                    path: f.path,
                    name: f.name,
                    overall_status: data?.overall_status ?? undefined,
                    overall_score: data?.overall_score ?? undefined,
                    evaluation_date: data?.evaluation_date ?? undefined,
                    title: data?.artifact_ref?.title ?? data?.artifact_id ?? f.name.replace(/\.evaluation\.yaml$|\.yaml$/, ''),
                };
            }
            catch {
                return { path: f.path, name: f.name, title: f.name };
            }
        });
        res.json({ summaries });
    });
    // GET /api/file/:path  (path may contain slashes)
    app.get('/api/file/*', (req, res) => {
        const rawPath = req.params[0];
        const absPath = safeRepoPath(REPO_ROOT, rawPath);
        if (!absPath) {
            res.status(403).json({ error: 'Path outside repo root' });
            return;
        }
        if (!existsSync(absPath)) {
            res.status(404).json({ error: `File not found: ${rawPath}` });
            return;
        }
        try {
            res.json(yaml.load(readFileSync(absPath, 'utf8')));
        }
        catch (e) {
            console.error('[API error]', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/file/:path
    app.post('/api/file/*', express.json({ limit: '5mb' }), (req, res) => {
        const rawPath = req.params[0];
        const absPath = safeRepoPath(REPO_ROOT, rawPath);
        if (!absPath) {
            res.status(403).json({ error: 'Path outside repo root' });
            return;
        }
        if (!absPath.endsWith('.yaml') && !absPath.endsWith('.yml')) {
            res.status(400).json({ error: 'Only YAML files can be written' });
            return;
        }
        try {
            const content = yaml.dump(req.body, { lineWidth: 120, noRefs: true });
            writeFileSync(absPath, content, 'utf8');
            // Invalidate eval cache if writing an evaluation file
            if (absPath.endsWith('.evaluation.yaml') || absPath.includes('/evaluations/')) {
                evalCache = null;
            }
            res.json({ ok: true });
        }
        catch (e) {
            console.error('[API error]', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/export/docx  — generate a Word document from artifact JSON
    app.post('/api/export/docx', express.json({ limit: '25mb' }), async (req, res) => {
        try {
            const payload = req.body;
            const artifactData = payload?.artifactData ?? payload;
            const renderedDiagrams = payload?.artifactData && payload.renderedDiagrams && typeof payload.renderedDiagrams === 'object'
                ? payload.renderedDiagrams
                : undefined;
            if (!artifactData || typeof artifactData !== 'object') {
                res.status(400).json({ error: 'Request body must be artifact JSON' });
                return;
            }
            const buf = await exportToDocx(artifactData, renderedDiagrams);
            const title = artifactData?.metadata?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'artifact';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
            res.send(buf);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            if (message.startsWith('Missing browser-rendered diagrams for export:')) {
                res.status(400).json({ error: message });
                return;
            }
            console.error('[API error]', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/export/docx/rubric  — generate a Word document from rubric JSON
    app.post('/api/export/docx/rubric', express.json({ limit: '25mb' }), async (req, res) => {
        try {
            const data = req.body;
            if (!data || typeof data !== 'object') {
                res.status(400).json({ error: 'Request body must be rubric JSON' });
                return;
            }
            const buf = await exportRubricToDocx(data);
            const title = data?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'rubric';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
            res.send(buf);
        }
        catch (e) {
            console.error('[API error]', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // POST /api/export/docx/evaluation  — generate a Word document from evaluation JSON
    app.post('/api/export/docx/evaluation', express.json({ limit: '25mb' }), async (req, res) => {
        try {
            const data = req.body;
            if (!data || typeof data !== 'object') {
                res.status(400).json({ error: 'Request body must be evaluation JSON' });
                return;
            }
            const buf = await exportEvaluationToDocx(data);
            const title = data?.artifact_ref?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'evaluation';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${title}-assessment.docx"`);
            res.send(buf);
        }
        catch (e) {
            console.error('[API error]', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Unknown API routes
    app.all('/api/*', (_req, res) => {
        res.status(404).json({ error: 'Unknown API route' });
    });
    // Workspace icon assets
    app.use('/icons', express.static(resolve(REPO_ROOT, 'icons')));
    // Static files — served after API routes
    app.use(express.static(distDir));
    // SPA fallback
    app.get('*', (_req, res) => {
        res.sendFile(resolve(distDir, 'index.html'));
    });
    const port = await findAvailablePort(process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
    const host = process.env.EAROS_HOST ?? '127.0.0.1';
    app.listen(port, host, () => {
        const url = fileArg
            ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
            : `http://localhost:${port}`;
        console.log(`EaROS Editor → ${url}`);
        open(url);
    });
}
