import { Box, Typography, Chip } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { ValidationResult } from '../utils/validate'

interface Props {
  validation: ValidationResult
  kind: string
}

export default function StatusBar({ validation, kind }: Props) {
  const { valid, errors } = validation
  const visible = errors.slice(0, 4)
  const overflow = errors.length - visible.length

  return (
    <Box
      sx={{
        px: 2,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: valid
          ? (theme) => theme.palette.mode === 'dark' ? 'hsl(125 50% 35% / 0.08)' : 'hsl(129 33% 92%)'
          : (theme) => theme.palette.mode === 'dark' ? 'hsl(41 95% 46% / 0.08)' : 'hsl(53 100% 92%)',
        borderTop: '1px solid',
        borderColor: valid
          ? (theme) => theme.palette.mode === 'dark' ? 'hsl(125 50% 35% / 0.2)' : 'hsl(125 46% 84%)'
          : (theme) => theme.palette.mode === 'dark' ? 'hsl(41 95% 46% / 0.2)' : 'hsl(51 90% 88%)',
        minHeight: 32,
        flexShrink: 0,
      }}
    >
      {valid ? (
        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
      ) : (
        <ErrorOutlineIcon sx={{ fontSize: 16, color: 'warning.main' }} />
      )}
      <Typography variant="caption" sx={{ fontWeight: 500, color: valid ? 'success.dark' : 'warning.dark' }}>
        {valid
          ? `Valid · ${kind}`
          : `${errors.length} validation error${errors.length !== 1 ? 's' : ''}`}
      </Typography>
      {!valid &&
        visible.map((err, i) => (
          <Chip
            key={i}
            label={`${err.path}: ${err.message}`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        ))}
      {overflow > 0 && (
        <Typography variant="caption" color="warning.dark">
          +{overflow} more
        </Typography>
      )}
    </Box>
  )
}
