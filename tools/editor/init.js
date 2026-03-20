import { cpSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function initWorkspace(targetDir) {
    const target = resolve(process.cwd(), targetDir);
    // When compiled, init.js sits in tools/editor/ alongside assets/
    const assetsDir = join(__dirname, 'assets', 'init');
    if (!existsSync(assetsDir)) {
        console.error('Asset directory not found. Run npm run build first.');
        process.exit(1);
    }
    if (existsSync(join(target, 'earos.manifest.yaml'))) {
        console.error(`${target} already contains an EAROS workspace (earos.manifest.yaml exists).`);
        process.exit(1);
    }
    mkdirSync(target, { recursive: true });
    cpSync(assetsDir, target, { recursive: true });
    const isCurrentDir = targetDir === '.' || targetDir === './';
    const cdStep = isCurrentDir ? '' : `  cd ${targetDir}\n`;
    console.log(`
✓ EAROS workspace initialized at: ${target}

Contents:
  core/                  Core meta-rubric (universal foundation)
  profiles/              Artifact-specific profiles (5 included)
  overlays/              Cross-cutting concern overlays (3 included)
  standard/schemas/      JSON schemas for validation
  templates/             Blank templates for new profiles and evaluations
  evaluations/           Your evaluation records go here
  calibration/           Calibration artifacts and results
  .agents/skills/        All 10 EAROS skills for any AI coding agent
  earos.manifest.yaml    File inventory (single source of truth)
  AGENTS.md              Project guide for AI agents (agent-agnostic)

Next steps:
${cdStep}  earos                  Open the editor
  earos validate core/core-meta-rubric.yaml   Validate a file
  earos manifest check   Verify manifest integrity
`);
}
