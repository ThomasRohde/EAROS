import { useRef } from 'react'
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Divider,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import type { AppMode } from '../App'

interface Props {
  onSelectMode: (mode: AppMode) => void
}

export default function HomeScreen({ onSelectMode }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
          EAROS Editor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enterprise Architecture Rubric Operational Standard · v2.0
        </Typography>
      </Box>

      {/* Mode selection */}
      <Typography variant="overline" color="text.disabled" sx={{ mb: 2, letterSpacing: 1.5 }}>
        What would you like to do?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 5,
          maxWidth: 740,
          width: '100%',
        }}
      >
        {/* Edit Rubric card */}
        <Card
          sx={{
            flex: '1 1 300px',
            maxWidth: 340,
            borderRadius: 3,
            border: '2px solid #c5cae9',
            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
            '&:hover': {
              borderColor: '#1a237e',
              boxShadow: '0 6px 24px rgba(26,35,126,0.14)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardActionArea onClick={() => onSelectMode('rubric')} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4.5, px: 4 }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  bgcolor: '#e8eaf6',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <SettingsIcon sx={{ fontSize: 38, color: '#1a237e' }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1.5, color: '#1a237e' }}>
                Edit Rubric
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                Create or modify scoring criteria — the rules that define how architecture
                artifacts are evaluated.
              </Typography>
              <Typography variant="caption" sx={{ color: '#9fa8da', fontWeight: 500 }}>
                For rubric authors and governance teams
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Assess Artifact card */}
        <Card
          sx={{
            flex: '1 1 300px',
            maxWidth: 340,
            borderRadius: 3,
            border: '2px solid #c8e6c9',
            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
            '&:hover': {
              borderColor: '#2e7d32',
              boxShadow: '0 6px 24px rgba(46,125,50,0.14)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardActionArea onClick={() => onSelectMode('assessment')} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4.5, px: 4 }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  bgcolor: '#e8f5e9',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <AssignmentTurnedInIcon sx={{ fontSize: 38, color: '#2e7d32' }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1.5, color: '#2e7d32' }}>
                Assess Artifact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                Score an architecture document against EAROS criteria — record evidence, assign
                scores, and determine status.
              </Typography>
              <Typography variant="caption" sx={{ color: '#a5d6a7', fontWeight: 500 }}>
                For architects and reviewers
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      {/* Escape hatch */}
      <Divider sx={{ width: '100%', maxWidth: 500, mb: 2.5 }} />
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          e.target.value = ''
          onSelectMode('rubric')
        }}
      />
      <Button
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
        sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 400 }}
      >
        Import a YAML file
      </Button>
    </Box>
  )
}
