import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import YamlPreview from './YamlPreview'

interface Props {
  data: unknown
  open: boolean
  onClose: () => void
  storageKey: string
}

const DEFAULT_WIDTH = 42
const MIN_WIDTH = 28
const MAX_WIDTH = 60

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value))
}

function readStoredWidth(storageKey: string) {
  if (typeof window === 'undefined') return DEFAULT_WIDTH
  const parsed = Number(window.localStorage.getItem(storageKey))
  return Number.isFinite(parsed) ? clampWidth(parsed) : DEFAULT_WIDTH
}

export default function YamlPreviewPane({ data, open, onClose, storageKey }: Props) {
  const theme = useTheme()
  const useDrawer = useMediaQuery(theme.breakpoints.down('lg'))
  const [widthPct, setWidthPct] = useState(() => readStoredWidth(storageKey))
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    window.localStorage.setItem(storageKey, String(widthPct))
  }, [open, storageKey, widthPct])

  const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    const parent = panel?.parentElement
    if (!panel || !parent) return

    event.preventDefault()
    const parentRect = parent.getBoundingClientRect()

    const onMove = (moveEvent: PointerEvent) => {
      const nextWidth = ((parentRect.right - moveEvent.clientX) / parentRect.width) * 100
      setWidthPct(clampWidth(nextWidth))
    }

    const onUp = () => {
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  if (!open) return null

  if (useDrawer) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 560 },
            maxWidth: '100vw',
            p: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <YamlPreview data={data} open={open} onToggle={onClose} />
        </Box>
      </Drawer>
    )
  }

  return (
    <Box
      ref={panelRef}
      sx={{
        position: 'relative',
        flex: `0 0 ${widthPct}%`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 320,
        maxWidth: '70%',
      }}
    >
      <Box
        role="separator"
        aria-label="Resize YAML preview"
        onPointerDown={handleResizeStart}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: -8,
          width: 16,
          zIndex: 1,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            width: 4,
            height: 56,
            borderRadius: 999,
            bgcolor: 'divider',
            transition: 'background-color 0.2s ease',
          },
          '&:hover::before': {
            bgcolor: 'text.secondary',
          },
        }}
      />
      <YamlPreview data={data} open={open} onToggle={onClose} />
    </Box>
  )
}
