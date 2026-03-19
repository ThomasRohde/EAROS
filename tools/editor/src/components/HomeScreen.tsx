import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import EditNoteIcon from '@mui/icons-material/EditNote'
import type { AppMode } from '../App'

interface Props {
  onSelectMode: (mode: AppMode) => void
}

interface CardDef {
  mode: AppMode
  icon: React.ReactNode
  title: string
  description: string
  subtitle: string
  accentColor: string
  borderColor: string
  hoverBorderColor: string
  hoverShadow: string
  iconBg: string
}

const ROWS: Array<{ label: string; cards: CardDef[] }> = [
  {
    label: 'For Governance Teams',
    cards: [
      {
        mode: 'create-rubric',
        icon: <AddCircleIcon sx={{ fontSize: 36, color: '#1a237e' }} />,
        title: 'Create Rubric',
        description: 'Design new scoring criteria for an artifact type',
        subtitle: 'Build a new core rubric, profile, or overlay from scratch',
        accentColor: '#1a237e',
        borderColor: '#c5cae9',
        hoverBorderColor: '#1a237e',
        hoverShadow: '0 6px 24px rgba(26,35,126,0.14)',
        iconBg: '#e8eaf6',
      },
      {
        mode: 'rubric',
        icon: <SettingsIcon sx={{ fontSize: 36, color: '#1a237e' }} />,
        title: 'Edit Rubric',
        description: 'Modify existing scoring criteria',
        subtitle: 'Update dimensions, criteria, and scoring guides',
        accentColor: '#1a237e',
        borderColor: '#c5cae9',
        hoverBorderColor: '#1a237e',
        hoverShadow: '0 6px 24px rgba(26,35,126,0.14)',
        iconBg: '#e8eaf6',
      },
    ],
  },
  {
    label: 'For Reviewers',
    cards: [
      {
        mode: 'new-assessment',
        icon: <PlaylistAddCheckIcon sx={{ fontSize: 36, color: '#2e7d32' }} />,
        title: 'New Assessment',
        description: 'Score an architecture document',
        subtitle: 'Start a new evaluation with guided setup',
        accentColor: '#2e7d32',
        borderColor: '#c8e6c9',
        hoverBorderColor: '#2e7d32',
        hoverShadow: '0 6px 24px rgba(46,125,50,0.14)',
        iconBg: '#e8f5e9',
      },
      {
        mode: 'continue-assessment',
        icon: <FolderOpenIcon sx={{ fontSize: 36, color: '#2e7d32' }} />,
        title: 'Continue Assessment',
        description: 'Resume a saved evaluation',
        subtitle: 'Open and continue an existing evaluation record',
        accentColor: '#2e7d32',
        borderColor: '#c8e6c9',
        hoverBorderColor: '#2e7d32',
        hoverShadow: '0 6px 24px rgba(46,125,50,0.14)',
        iconBg: '#e8f5e9',
      },
    ],
  },
  {
    label: 'For Architects',
    cards: [
      {
        mode: 'new-artifact',
        icon: <NoteAddIcon sx={{ fontSize: 36, color: '#e65100' }} />,
        title: 'Create Artifact',
        description: 'Write a new architecture document',
        subtitle: 'Start from a template with built-in EAROS guidance',
        accentColor: '#e65100',
        borderColor: '#ffe0b2',
        hoverBorderColor: '#e65100',
        hoverShadow: '0 6px 24px rgba(230,81,0,0.14)',
        iconBg: '#fff3e0',
      },
      {
        mode: 'edit-artifact',
        icon: <EditNoteIcon sx={{ fontSize: 36, color: '#e65100' }} />,
        title: 'Edit Artifact',
        description: 'Improve an existing document',
        subtitle: 'Open an architecture document and see EAROS assessment guidance',
        accentColor: '#e65100',
        borderColor: '#ffe0b2',
        hoverBorderColor: '#e65100',
        hoverShadow: '0 6px 24px rgba(230,81,0,0.14)',
        iconBg: '#fff3e0',
      },
    ],
  },
]

export default function HomeScreen({ onSelectMode }: Props) {
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
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
          EAROS Editor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enterprise Architecture Rubric Operational Standard · v2.0
        </Typography>
      </Box>

      {/* Card grid */}
      <Box sx={{ maxWidth: 780, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ROWS.map((row) => (
          <Box key={row.label}>
            {/* Section header */}
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                mb: 1.5,
                color: '#757575',
                fontWeight: 600,
                letterSpacing: 1.2,
                fontSize: '0.7rem',
              }}
            >
              {row.label}
            </Typography>

            {/* Two-column row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {row.cards.map((card) => (
                <Card
                  key={card.mode}
                  sx={{
                    borderRadius: 2.5,
                    border: `1.5px solid ${card.borderColor}`,
                    transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.15s',
                    '&:hover': {
                      borderColor: card.hoverBorderColor,
                      boxShadow: card.hoverShadow,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => onSelectMode(card.mode)} sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2.5 }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: card.iconBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {card.icon}
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: card.accentColor, mb: 0.5, lineHeight: 1.2 }}
                        >
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                          {card.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {card.subtitle}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
