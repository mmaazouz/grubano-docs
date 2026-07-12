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
  Comparison,
} from '@/components/DocVisuals'
import { LearningPath } from '@/components/LearningPath'
import { Faq } from '@/components/Faq'
import {
  ArticleMeta,
  Eyebrow,
  Essentials,
  Breakdown,
  RelatedCards,
} from '@/components/ArticleV5'
import { SpaceHero, ActionGroup, ActionCards } from '@/components/SpaceLanding'
import { HeroStats } from '@/components/HeroStats'

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
  Faq, // single-open accordion (article-v5)
  // article-v5 building blocks (mockup docs/article-v5.html)
  ArticleMeta,
  Eyebrow,
  Essentials,
  Breakdown,
  RelatedCards,
  // landing d'espace « Démarrer ici » (maquette landing-espace)
  SpaceHero,
  ActionGroup,
  ActionCards,
  // page éditoriale « Découvrir Grubano » (maquette discover.html)
  HeroStats,
})) as typeof getDocsMDXComponents
