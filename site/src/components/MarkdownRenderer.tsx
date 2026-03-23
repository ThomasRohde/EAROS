import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import rehypeHighlight from 'rehype-highlight'
import { Box, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import '../markdown.css'

/**
 * Map of repo-relative markdown paths to site routes.
 * Handles both relative references (from different source directories)
 * and normalises them to internal /docs/ routes.
 */
const MD_ROUTE_MAP: Record<string, string> = {
  'getting-started.md': '/docs/getting-started',
  'profile-authoring-guide.md': '/docs/profile-authoring',
  'terminology.md': '/docs/terminology',
  'EAROS.md': '/docs/standard',
  // Onboarding guides
  'overview.md': '/onboarding/overview',
  'first-assessment.md': '/onboarding/first-assessment',
  'governed-review.md': '/onboarding/governed-review',
  'agent-assisted.md': '/onboarding/agent-assisted',
  'scaling-optimization.md': '/onboarding/scaling-optimization',
}

/** Try to resolve an href that points at a .md file to an internal route. */
function resolveHref(href: string): { to: string; internal: boolean } {
  // Strip any leading relative path segments and extract the filename
  const filename = href.split('/').pop()?.split('#')[0] ?? ''
  const fragment = href.includes('#') ? '#' + href.split('#')[1] : ''
  const route = MD_ROUTE_MAP[filename]
  if (route) {
    return { to: route + fragment, internal: true }
  }
  return { to: href, internal: false }
}

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const theme = useTheme()

  return (
    <Box className="markdown-body" data-theme={theme.palette.mode}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSmartypants]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a({ href, children, ...props }) {
            if (!href) return <a {...props}>{children}</a>
            const { to, internal } = resolveHref(href)
            if (internal) {
              return <Link to={to}>{children}</Link>
            }
            // External links open in new tab
            if (href.startsWith('http')) {
              return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
            }
            return <a href={href} {...props}>{children}</a>
          },
          img({ src, alt, ...props }: any) {
            if (src && !src.startsWith('http')) {
              // Resolve paths relative to the base URL for GitHub Pages
              const base = import.meta.env.BASE_URL
              const resolved = src.startsWith('/') ? base + src.slice(1) : base + 'screenshots/' + src
              return <img src={resolved} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: 8 }} {...props} />
            }
            return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: 8 }} {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
