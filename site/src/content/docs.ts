import standardMd from '../../../standard/EAROS.md?raw'
import gettingStartedMd from '../../../docs/getting-started.md?raw'
import profileAuthoringMd from '../../../docs/profile-authoring-guide.md?raw'
import terminologyMd from '../../../docs/terminology.md?raw'

export interface DocEntry {
  slug: string
  title: string
  description: string
  content: string
}

export const docs: DocEntry[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Quick introduction to EaROS concepts and first steps for reviewers and architects.',
    content: gettingStartedMd,
  },
  {
    slug: 'standard',
    title: 'The Standard',
    description: 'The canonical EAROS v2 standard document. Complete reference for the scoring model, gates, and evaluation flow.',
    content: standardMd,
  },
  {
    slug: 'profile-authoring',
    title: 'Profile Authoring Guide',
    description: 'How to create new artifact-type profiles. Design methods, calibration, and YAML structure.',
    content: profileAuthoringMd,
  },
  {
    slug: 'terminology',
    title: 'Terminology',
    description: 'Glossary of all EAROS-specific, statistical, and architecture terms used across the framework.',
    content: terminologyMd,
  },
]

export function getDocBySlug(slug: string): DocEntry | undefined {
  return docs.find((d) => d.slug === slug)
}
