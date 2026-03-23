export interface OnboardingEntry {
  slug: string
  title: string
  description: string
  loadContent: () => Promise<string>
  maturityLevel: number
  maturityTransition: string
  maturityLabel: string
}

export const onboardingGuides: OnboardingEntry[] = [
  {
    slug: 'overview',
    title: 'Adoption Maturity Model',
    description: 'Understand the five levels of architecture review maturity and assess where your organization stands today.',
    loadContent: () => import('../../../docs/onboarding/overview.md?raw').then(m => m.default),
    maturityLevel: 0,
    maturityTransition: 'Overview',
    maturityLabel: 'Maturity Model',
  },
  {
    slug: 'first-assessment',
    title: 'Your First Assessment',
    description: 'Install the CLI, score your first artifact with the core rubric, and learn to interpret evaluation results.',
    loadContent: () => import('../../../docs/onboarding/first-assessment.md?raw').then(m => m.default),
    maturityLevel: 2,
    maturityTransition: 'Level 1 \u2192 2',
    maturityLabel: 'Ad Hoc \u2192 Rubric-Based',
  },
  {
    slug: 'governed-review',
    title: 'Governed Review',
    description: 'Add profiles and overlays, calibrate your team, and establish evidence-anchored architecture review.',
    loadContent: () => import('../../../docs/onboarding/governed-review.md?raw').then(m => m.default),
    maturityLevel: 3,
    maturityTransition: 'Level 2 \u2192 3',
    maturityLabel: 'Rubric-Based \u2192 Governed',
  },
  {
    slug: 'agent-assisted',
    title: 'Agent-Assisted Evaluation',
    description: 'Set up AI agent evaluation, run hybrid assessments, and implement the challenge pass.',
    loadContent: () => import('../../../docs/onboarding/agent-assisted.md?raw').then(m => m.default),
    maturityLevel: 4,
    maturityTransition: 'Level 3 \u2192 4',
    maturityLabel: 'Governed \u2192 Hybrid',
  },
  {
    slug: 'scaling-optimization',
    title: 'Scaling and Optimization',
    description: 'Integrate with CI/CD, enable continuous calibration, and drive organization-wide adoption.',
    loadContent: () => import('../../../docs/onboarding/scaling-optimization.md?raw').then(m => m.default),
    maturityLevel: 5,
    maturityTransition: 'Level 4 \u2192 5',
    maturityLabel: 'Hybrid \u2192 Optimized',
  },
]

export function getOnboardingBySlug(slug: string): OnboardingEntry | undefined {
  return onboardingGuides.find((g) => g.slug === slug)
}
