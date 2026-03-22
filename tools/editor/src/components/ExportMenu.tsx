import { useState, useCallback } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import type { SxProps, Theme } from '@mui/material/styles'

export interface ExportOption {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void | Promise<void>
}

interface ExportMenuProps {
  options: ExportOption[]
  disabled?: boolean
  buttonSx?: SxProps<Theme>
}

export default function ExportMenu({ options, disabled, buttonSx }: ExportMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())
  const open = Boolean(anchorEl)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleOptionClick = useCallback((opt: ExportOption) => {
    handleClose()
    const result = opt.onClick()
    if (result && typeof (result as Promise<void>).then === 'function') {
      setLoadingKeys((prev) => new Set(prev).add(opt.key))
      ;(result as Promise<void>).finally(() => {
        setLoadingKeys((prev) => {
          const next = new Set(prev)
          next.delete(opt.key)
          return next
        })
      })
    }
  }, [handleClose])

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClick}
        disabled={disabled}
        endIcon={<ArrowDropDownIcon />}
        sx={buttonSx}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        {options.map((opt) => {
          const loading = loadingKeys.has(opt.key)
          return (
            <MenuItem
              key={opt.key}
              onClick={() => handleOptionClick(opt)}
              disabled={loading}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {loading ? <CircularProgress size={18} /> : opt.icon}
              </ListItemIcon>
              <ListItemText>{opt.label}</ListItemText>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
