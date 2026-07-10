import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { FlowDiagram } from '@/components/FlowDiagram'
import { HomeHero } from '@/components/HomeHero'
import { SpacesGrid } from '@/components/SpacesGrid'
import { QuickStartCards } from '@/components/QuickStartCards'
import { ContactStrip } from '@/components/ContactStrip'
import {
  RelatedActors,
  JourneyStrip,
  MiniMap,
  LearningPath,
  Comparison,
  Faq,
} from '@/components/DocVisuals'

// Anything added here becomes usable in .mdx without an explicit import.
const base = getDocsMDXComponents()

export const useMDXComponents = ((components?: Record<string, unknown>) => ({
  ...base,
  ...components,
  FlowDiagram,
  HomeHero,
  SpacesGrid,
  QuickStartCards,
  ContactStrip,
  // v5 pedagogical visual components (CD)
  RelatedActors,
  JourneyStrip,
  MiniMap,
  LearningPath,
  Comparison,
  Faq,
})) as typeof getDocsMDXComponents
