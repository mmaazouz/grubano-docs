import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { FlowDiagram } from '@/components/FlowDiagram'

// Inject our globally-available MDX components on top of the theme defaults.
// Anything added here can be used in any .mdx file without an explicit import.
const base = getDocsMDXComponents()

export const useMDXComponents = ((components?: Record<string, unknown>) => ({
  ...base,
  ...components,
  FlowDiagram,
})) as typeof getDocsMDXComponents
