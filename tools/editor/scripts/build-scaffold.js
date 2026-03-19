/**
 * Build step: bundle EAROS framework files into scaffold/ so they ship with the npm package.
 * Run via: npm run build:scaffold
 */
import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..', '..')
const scaffoldDir = resolve(__dirname, '..', 'scaffold')

// Clean and recreate
if (existsSync(scaffoldDir)) {
  rmSync(scaffoldDir, { recursive: true })
}
mkdirSync(scaffoldDir, { recursive: true })

// Copy framework directories
for (const dir of ['core', 'profiles', 'overlays', 'templates']) {
  const src = join(repoRoot, dir)
  if (existsSync(src)) {
    cpSync(src, join(scaffoldDir, dir), { recursive: true })
    console.log(`  copied ${dir}/`)
  } else {
    console.warn(`  warning: ${src} not found, skipping`)
  }
}

// Copy schemas
const schemasSrc = join(repoRoot, 'standard', 'schemas')
if (existsSync(schemasSrc)) {
  cpSync(schemasSrc, join(scaffoldDir, 'standard', 'schemas'), { recursive: true })
  console.log('  copied standard/schemas/')
}

// Copy manifest
const manifestSrc = join(repoRoot, 'earos.manifest.yaml')
if (existsSync(manifestSrc)) {
  cpSync(manifestSrc, join(scaffoldDir, 'earos.manifest.yaml'))
  console.log('  copied earos.manifest.yaml')
}

// Copy Claude skills (so earos init workspaces are immediately usable with Claude Code)
const skillsSrc = join(repoRoot, '.claude', 'skills')
if (existsSync(skillsSrc)) {
  cpSync(skillsSrc, join(scaffoldDir, '.claude', 'skills'), { recursive: true })
  console.log('  copied .claude/skills/')
}

// Copy README and CLAUDE.md (complete, self-contained workspace feel)
const readmeSrc = join(repoRoot, 'README.md')
if (existsSync(readmeSrc)) {
  cpSync(readmeSrc, join(scaffoldDir, 'README.md'))
  console.log('  copied README.md')
}
const claudeMdSrc = join(repoRoot, 'CLAUDE.md')
if (existsSync(claudeMdSrc)) {
  cpSync(claudeMdSrc, join(scaffoldDir, 'CLAUDE.md'))
  console.log('  copied CLAUDE.md')
}

// Create placeholder directories (empty dirs don't survive npm pack)
for (const dir of ['evaluations', 'calibration/gold-set', 'calibration/results']) {
  mkdirSync(join(scaffoldDir, dir), { recursive: true })
  writeFileSync(join(scaffoldDir, dir, '.gitkeep'), '')
}

// Create a .gitignore for new workspaces
writeFileSync(
  join(scaffoldDir, '.gitignore'),
  'node_modules/\ndist/\n*.tgz\n.DS_Store\nThumbs.db\n'
)

console.log(`✓ Scaffold built: ${scaffoldDir}`)
