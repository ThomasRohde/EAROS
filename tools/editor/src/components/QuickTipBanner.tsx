import { useState } from 'react'
import { Alert, Collapse } from '@mui/material'

interface QuickTipBannerProps {
  /** Unique key used to persist dismissal in localStorage */
  tipKey: string
  message: string
}

const LS_PREFIX = 'earos-tip-dismissed-'

export default function QuickTipBanner({ tipKey, message }: QuickTipBannerProps) {
  const storageKey = `${LS_PREFIX}${tipKey}`

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  })

  const handleClose = () => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {
      // localStorage unavailable — still dismiss for this session
    }
    setDismissed(true)
  }

  return (
    <Collapse in={!dismissed} unmountOnExit>
      <Alert
        severity="info"
        onClose={handleClose}
        sx={{
          borderRadius: 0,
          py: 0.25,
          px: 2,
          fontSize: '0.82rem',
          '& .MuiAlert-message': { py: 0.75 },
        }}
      >
        {message}
      </Alert>
    </Collapse>
  )
}
