#!/usr/bin/env node
'use strict';
// EAROS YAML validator — called by the pre-commit hook
// Usage: node tools/validate-yaml.js [--frontmatter] <file>

const path = require('path');
const fs = require('fs');

// Resolve js-yaml from the editor's node_modules (already a dependency there)
let yaml;
try {
  yaml = require(path.join(__dirname, 'editor', 'node_modules', 'js-yaml'));
} catch (_) {
  try {
    yaml = require('js-yaml');
  } catch (_2) {
    // Validator can't load — warn but don't block the commit
    console.warn('EAROS validate-yaml: js-yaml not found. Run: cd tools/editor && npm install');
    process.exit(0);
  }
}

const args = process.argv.slice(2);
const frontmatterMode = args[0] === '--frontmatter';
const file = frontmatterMode ? args[1] : args[0];

if (!file) {
  console.error('Usage: validate-yaml.js [--frontmatter] <file>');
  process.exit(1);
}

let content;
try {
  content = fs.readFileSync(file, 'utf8');
} catch (e) {
  console.error(`validate-yaml: cannot read ${file}: ${e.message}`);
  process.exit(1);
}

const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');

try {
  if (frontmatterMode) {
    // Extract YAML between leading --- delimiters
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) process.exit(0); // No frontmatter — nothing to validate
    yaml.load(match[1]);
  } else {
    yaml.load(content);
  }
} catch (e) {
  const label = frontmatterMode ? 'YAML FRONTMATTER ERROR' : 'YAML ERROR';
  console.error(`${label} in ${relPath}:`);
  console.error(`  ${e.message.split('\n')[0]}`);
  console.error(`  Tip: quote strings that contain colons — e.g. "RTO: 4 hours"`);
  process.exit(1);
}

process.exit(0);
