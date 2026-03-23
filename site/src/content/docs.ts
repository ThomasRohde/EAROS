export interface DocEntry {
  slug: string
  title: string
  description: string
  loadContent: () => Promise<string>
}

export const docs: DocEntry[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Quick introduction to EaROS concepts and first steps for reviewers and architects.',
    loadContent: () => import('../../../docs/getting-started.md?raw').then(m => m.default),
  },
  {
    slug: 'standard',
    title: 'The Standard',
    description: 'The EAROS standard document. Full reference for the scoring model, gates, and evaluation flow.',
    loadContent: () => import('../../../standard/EAROS.md?raw').then(m => m.default),
  },
  {
    slug: 'adoption-maturity',
    title: 'Adoption Maturity Model',
    description: 'Five-level maturity model for staged EAROS adoption. Determine your current level and next steps.',
    loadContent: () => import('../../../docs/onboarding/overview.md?raw').then(m => m.default),
  },
  {
    slug: 'editor-cli',
    title: 'Editor & CLI',
    description: 'Full reference for the earos CLI commands, workspace scaffolding, web editor, and AI agent skills.',
    loadContent: () => import('../../../tools/editor/README.md?raw').then(m => m.default),
  },
  {
    slug: 'profile-authoring',
    title: 'Profile Authoring Guide',
    description: 'How to create new artifact-type profiles. Design methods, calibration, and YAML structure.',
    loadContent: () => import('../../../docs/profile-authoring-guide.md?raw').then(m => m.default),
  },
  {
    slug: 'terminology',
    title: 'Terminology',
    description: 'Glossary of all EAROS-specific, statistical, and architecture terms used across the framework.',
    loadContent: () => import('../../../docs/terminology.md?raw').then(m => m.default),
  },
]

export function getDocBySlug(slug: string): DocEntry | undefined {
  return docs.find((d) => d.slug === slug)
}
