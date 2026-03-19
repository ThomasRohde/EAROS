/**
 * EAROS standalone Express server.
 * Serves the pre-built React app from dist/ and provides the API endpoints.
 */
import express from 'express';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import open from 'open';
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
    if (!abs.startsWith(repoRoot))
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
export async function startServer(fileArg) {
    const REPO_ROOT = findRepoRoot();
    const distDir = resolve(__dirname, 'dist');
    if (!existsSync(distDir)) {
        console.error('dist/ not found. Run: npm run build');
        process.exit(1);
    }
    const app = express();
    app.use(express.json());
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
    // GET /api/evaluations
    app.get('/api/evaluations', (_req, res) => {
        const files = [];
        for (const dir of ['examples', 'evaluations']) {
            const dirPath = resolve(REPO_ROOT, dir);
            if (existsSync(dirPath)) {
                try {
                    for (const entry of readdirSync(dirPath)) {
                        if (entry.endsWith('.evaluation.yaml')) {
                            files.push({ path: `${dir}/${entry}`, name: entry });
                        }
                    }
                }
                catch { /* skip unreadable dirs */ }
            }
        }
        res.json({ files });
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
            res.status(500).json({ error: String(e) });
        }
    });
    // POST /api/file/:path
    app.post('/api/file/*', (req, res) => {
        const rawPath = req.params[0];
        const absPath = safeRepoPath(REPO_ROOT, rawPath);
        if (!absPath) {
            res.status(403).json({ error: 'Path outside repo root' });
            return;
        }
        try {
            const content = yaml.dump(req.body, { lineWidth: 120, noRefs: true });
            writeFileSync(absPath, content, 'utf8');
            res.json({ ok: true });
        }
        catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });
    // Unknown API routes
    app.all('/api/*', (_req, res) => {
        res.status(404).json({ error: 'Unknown API route' });
    });
    // Static files — served after API routes
    app.use(express.static(distDir));
    // SPA fallback
    app.get('*', (_req, res) => {
        res.sendFile(resolve(distDir, 'index.html'));
    });
    const port = await findAvailablePort(3000);
    app.listen(port, () => {
        const url = fileArg
            ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
            : `http://localhost:${port}`;
        console.log(`EAROS Editor → ${url}`);
        open(url);
    });
}
