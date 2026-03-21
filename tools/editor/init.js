import { cpSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AWS_ICON_PAGE_URL = process.env.EAROS_AWS_ICON_PAGE_URL ?? 'https://aws.amazon.com/architecture/icons/';
const AWS_ICON_PACKAGE_URL = process.env.EAROS_AWS_ICON_PACKAGE_URL;
const AWS_ICON_ALIAS_SPECS = [
    { alias: 'api-gateway', tokenVariants: [['api', 'gateway']], preferredPathTokens: ['service'] },
    { alias: 'aws-cloud', tokenVariants: [['aws', 'cloud']], preferredPathTokens: ['group'] },
    { alias: 'cloudfront', tokenVariants: [['cloudfront'], ['cloud', 'front']], preferredPathTokens: ['service'] },
    { alias: 'cloudtrail', tokenVariants: [['cloudtrail'], ['cloud', 'trail']], preferredPathTokens: ['service'] },
    { alias: 'cognito', tokenVariants: [['cognito']], preferredPathTokens: ['service'] },
    { alias: 'data-firehose', tokenVariants: [['firehose'], ['kinesis', 'data', 'firehose']], preferredPathTokens: ['service'] },
    { alias: 'dynamodb', tokenVariants: [['dynamodb'], ['dynamo', 'db']], preferredPathTokens: ['service'] },
    { alias: 'eventbridge', tokenVariants: [['eventbridge'], ['event', 'bridge']], preferredPathTokens: ['service'] },
    { alias: 'lambda', tokenVariants: [['lambda']], preferredPathTokens: ['service'] },
    { alias: 'nat-gateway', tokenVariants: [['nat', 'gateway']], preferredPathTokens: ['resource'] },
    { alias: 'private-subnet', tokenVariants: [['private', 'subnet']], preferredPathTokens: ['resource'] },
    { alias: 'route53', tokenVariants: [['route', '53'], ['route53']], preferredPathTokens: ['service'] },
    { alias: 's3', tokenVariants: [['s3'], ['simple', 'storage', 'service']], preferredPathTokens: ['service'] },
    { alias: 'ses', tokenVariants: [['ses'], ['simple', 'email', 'service']], preferredPathTokens: ['service'] },
    { alias: 'sns', tokenVariants: [['sns'], ['simple', 'notification', 'service']], preferredPathTokens: ['service'] },
    { alias: 'sqs', tokenVariants: [['sqs'], ['simple', 'queue', 'service']], preferredPathTokens: ['service'] },
    { alias: 'waf', tokenVariants: [['waf'], ['web', 'application', 'firewall']], preferredPathTokens: ['service'] },
    { alias: 'xray', tokenVariants: [['xray'], ['x', 'ray']], preferredPathTokens: ['service'] },
];
function tokenizeForMatch(value) {
    return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean));
}
function normalizeZipEntryPath(entryName) {
    const normalized = entryName.replace(/\\/g, '/').replace(/^\/+/, '');
    const segments = normalized.split('/').filter(Boolean);
    if (!segments.length || segments.some((segment) => segment === '..' || segment.includes(':'))) {
        return null;
    }
    return segments.join('/');
}
async function resolveAwsIconPackageUrl() {
    if (AWS_ICON_PACKAGE_URL)
        return AWS_ICON_PACKAGE_URL;
    const response = await fetch(AWS_ICON_PAGE_URL, { redirect: 'follow' });
    if (!response.ok) {
        throw new Error(`Unable to load AWS icon page: HTTP ${response.status}`);
    }
    const html = await response.text();
    const button2UrlMatch = html.match(/"button2URL":"([^"]+\.zip)"/i);
    if (button2UrlMatch?.[1]) {
        return new URL(button2UrlMatch[1], response.url).toString();
    }
    const anchorMatch = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Icon package\s*<\/a>/i);
    if (anchorMatch?.[1]) {
        return new URL(anchorMatch[1], response.url).toString();
    }
    const zipMatches = [...html.matchAll(/https:\/\/d1\.awsstatic\.com\/[^"'\\s>]+\.zip/gi)].map((match) => match[0]);
    const candidateUrl = zipMatches.find((url) => /asset|icon/i.test(url)) ?? zipMatches[0];
    if (candidateUrl)
        return candidateUrl;
    throw new Error(`Could not find the AWS icon package link on ${response.url}`);
}
function buildExtractedIconEntry(normalizedPath, outputPath) {
    return {
        normalizedPath,
        outputPath,
        pathTokens: tokenizeForMatch(normalizedPath),
        fileTokens: tokenizeForMatch(basename(normalizedPath)),
    };
}
function matchesVariant(entry, tokenVariant) {
    return tokenVariant.every((token) => entry.pathTokens.has(token) || entry.fileTokens.has(token));
}
function scoreAliasCandidate(entry, spec) {
    const matchedVariant = spec.tokenVariants.find((tokenVariant) => matchesVariant(entry, tokenVariant));
    if (!matchedVariant)
        return Number.NEGATIVE_INFINITY;
    let score = matchedVariant.length * 10;
    if (spec.preferredPathTokens.every((token) => entry.pathTokens.has(token)))
        score += 40;
    if (entry.fileTokens.has('arch'))
        score += 5;
    score -= entry.normalizedPath.length / 1000;
    return score;
}
function createAwsIconAliases(iconsDir, extractedEntries) {
    const awsAliasDir = join(iconsDir, 'aws');
    mkdirSync(awsAliasDir, { recursive: true });
    let aliasCount = 0;
    const missingAliases = [];
    for (const spec of AWS_ICON_ALIAS_SPECS) {
        const bestCandidate = extractedEntries
            .map((entry) => ({ entry, score: scoreAliasCandidate(entry, spec) }))
            .filter((candidate) => Number.isFinite(candidate.score))
            .sort((left, right) => right.score - left.score)[0];
        if (!bestCandidate) {
            missingAliases.push(spec.alias);
            continue;
        }
        copyFileSync(bestCandidate.entry.outputPath, join(awsAliasDir, `${spec.alias}.svg`));
        aliasCount += 1;
    }
    return { aliasCount, missingAliases };
}
async function downloadAwsIcons(targetDir) {
    const packageUrl = await resolveAwsIconPackageUrl();
    const response = await fetch(packageUrl, { redirect: 'follow' });
    if (!response.ok) {
        throw new Error(`Unable to download AWS icon package: HTTP ${response.status}`);
    }
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const iconsDir = join(targetDir, 'icons');
    mkdirSync(iconsDir, { recursive: true });
    let fileCount = 0;
    const extractedEntries = [];
    for (const [entryName, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir)
            continue;
        const normalizedEntryPath = normalizeZipEntryPath(entryName);
        if (!normalizedEntryPath)
            continue;
        const outputPath = join(iconsDir, normalizedEntryPath);
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, await zipEntry.async('nodebuffer'));
        fileCount += 1;
        if (normalizedEntryPath.toLowerCase().endsWith('.svg')) {
            extractedEntries.push(buildExtractedIconEntry(normalizedEntryPath, outputPath));
        }
    }
    const { aliasCount, missingAliases } = createAwsIconAliases(iconsDir, extractedEntries);
    return { packageUrl, fileCount, aliasCount, missingAliases };
}
export async function initWorkspace(targetDir, options = {}) {
    const target = resolve(process.cwd(), targetDir);
    // When compiled, init.js sits in tools/editor/ alongside assets/
    const assetsDir = join(__dirname, 'assets', 'init');
    const workspaceExists = existsSync(join(target, 'earos.manifest.yaml'));
    if (!existsSync(assetsDir)) {
        console.error('Asset directory not found. Run npm run build first.');
        process.exit(1);
    }
    if (workspaceExists && !options.downloadIcons) {
        console.error(`${target} already contains an EAROS workspace (earos.manifest.yaml exists).`);
        process.exit(1);
    }
    if (!workspaceExists) {
        mkdirSync(target, { recursive: true });
        cpSync(assetsDir, target, { recursive: true });
    }
    else {
        console.log(`EAROS workspace already exists at ${target}; downloading icons only.`);
    }
    let iconDownloadSummary = '';
    if (options.downloadIcons) {
        const { packageUrl, fileCount, aliasCount, missingAliases } = await downloadAwsIcons(target);
        iconDownloadSummary = `  icons/                 AWS architecture icon package (${fileCount} files)\n  icons/aws/             Stable Mermaid icon aliases (${aliasCount} files)\n`;
        console.log(`Downloaded AWS icons from ${packageUrl}`);
        if (missingAliases.length) {
            console.warn(`Missing AWS icon aliases: ${missingAliases.join(', ')}`);
        }
    }
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
${iconDownloadSummary}  earos.manifest.yaml    File inventory (single source of truth)
  AGENTS.md              Project guide for AI agents (agent-agnostic)

Next steps:
${cdStep}  earos                  Open the editor
  earos validate core/core-meta-rubric.yaml   Validate a file
  earos manifest check   Verify manifest integrity
`);
}
