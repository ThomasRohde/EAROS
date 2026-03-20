import { MermaidRenderer, mermaidTester } from './MermaidRenderer'
import { ProseRenderer, proseTester } from './ProseRenderer'
import { ScoringGuideRenderer, scoringGuideTester } from './ScoringGuideRenderer'
import { ChipListRenderer, chipListTester } from './ChipListRenderer'
import { DecisionTreeRenderer, decisionTreeTester } from './DecisionTreeRenderer'
import { ExamplesRenderer, examplesTester } from './ExamplesRenderer'

export const customRenderers = [
  { tester: mermaidTester, renderer: MermaidRenderer },
  { tester: proseTester, renderer: ProseRenderer },
  { tester: scoringGuideTester, renderer: ScoringGuideRenderer },
  { tester: chipListTester, renderer: ChipListRenderer },
  { tester: decisionTreeTester, renderer: DecisionTreeRenderer },
  { tester: examplesTester, renderer: ExamplesRenderer },
]
