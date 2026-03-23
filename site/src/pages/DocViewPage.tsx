import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { docs, getDocBySlug } from '../content/docs'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { sapphire } from '../theme'

export default function DocViewPage() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const doc = slug ? getDocBySlug(slug) : undefined

  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doc) {
      setLoading(false)
      return
    }
    setLoading(true)
    setContent('')
    doc.loadContent().then((md) => {
      setContent(md)
      setLoading(false)
    })
  }, [doc])

  if (!doc) {
    return (
      <Box sx={{ py: { xs: 8, md: 12 }, px: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#ffffff' : sapphire.blue[900] }}>
          Document not found
        </Typography>
        <Button component={Link} to="/docs" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Docs
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: 3 }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: 'auto',
          display: 'flex',
          gap: 4,
        }}
      >
        {/* Sidebar nav */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 200,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
          }}
        >
          <Button
            component={Link}
            to="/docs"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              mb: 2,
              color: isDark ? sapphire.gray[400] : sapphire.gray[600],
              fontSize: '0.8rem',
              justifyContent: 'flex-start',
              px: 1,
            }}
          >
            All docs
          </Button>
          {docs.map((d) => (
            <Button
              key={d.slug}
              component={Link}
              to={`/docs/${d.slug}`}
              size="small"
              sx={{
                display: 'block',
                textAlign: 'left',
                width: '100%',
                px: 1,
                py: 0.5,
                fontSize: '0.85rem',
                fontWeight: d.slug === slug ? 600 : 400,
                color:
                  d.slug === slug
                    ? isDark
                      ? sapphire.blue[400]
                      : sapphire.blue[500]
                    : isDark
                      ? sapphire.gray[300]
                      : sapphire.gray[600],
                borderRadius: 1,
                bgcolor:
                  d.slug === slug
                    ? isDark
                      ? 'hsla(218, 92%, 49%, 0.08)'
                      : sapphire.blue[50]
                    : 'transparent',
                '&:hover': {
                  bgcolor: isDark ? 'hsla(218, 92%, 49%, 0.06)' : 'hsla(218, 92%, 49%, 0.04)',
                },
              }}
            >
              {d.title}
            </Button>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Mobile back link */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <Button
              component={Link}
              to="/docs"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}
            >
              All docs
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </Box>
      </Box>
    </Box>
  )
}
