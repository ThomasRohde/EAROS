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
        bgcolor: valid ? '#f1f8e9' : '#fff3e0',
        borderTop: '1px solid',
        borderColor: valid ? '#c5e1a5' : '#ffe0b2',
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
