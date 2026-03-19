import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import type { AppMode } from '../App'

interface Props {
  onSelectMode: (mode: AppMode) => void
}

interface ModeCard {
  mode: AppMode
  icon: React.ReactNode
  title: string
  description: string
  tagline: string
  borderColor: string
  hoverBorderColor: string
  hoverShadow: string
  iconBg: string
  iconColor: string
  titleColor: string
  taglineColor: string
}

const CARDS: ModeCard[] = [
  {
    mode: 'rubric',
    icon: <SettingsIcon sx={{ fontSize: 38, color: '#1a237e' }} />,
    title: 'Edit Rubric',
    description: 'Create or modify scoring criteria — the rules that define how architecture artifacts are evaluated.',
    tagline: 'For rubric authors and governance teams',
    borderColor: '#c5cae9',
    hoverBorderColor: '#1a237e',
    hoverShadow: '0 6px 24px rgba(26,35,126,0.14)',
    iconBg: '#e8eaf6',
    iconColor: '#1a237e',
    titleColor: '#1a237e',
    taglineColor: '#9fa8da',
  },
  {
    mode: 'new-assessment',
    icon: <AddCircleOutlineIcon sx={{ fontSize: 38, color: '#2e7d32' }} />,
    title: 'New Assessment',
    description: 'Score an architecture document against EAROS criteria. Start a new evaluation with guided setup.',
    tagline: 'For architects and reviewers',
    borderColor: '#c8e6c9',
    hoverBorderColor: '#2e7d32',
    hoverShadow: '0 6px 24px rgba(46,125,50,0.14)',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    titleColor: '#2e7d32',
    taglineColor: '#a5d6a7',
  },
  {
    mode: 'continue-assessment',
    icon: <FolderOpenIcon sx={{ fontSize: 38, color: '#e65100' }} />,
    title: 'Continue Assessment',
    description: 'Resume or review an existing evaluation. Open a saved evaluation record.',
    tagline: 'Resume a saved evaluation record',
    borderColor: '#ffe0b2',
    hoverBorderColor: '#e65100',
    hoverShadow: '0 6px 24px rgba(230,81,0,0.14)',
    iconBg: '#fff3e0',
    iconColor: '#e65100',
    titleColor: '#e65100',
    taglineColor: '#ffcc80',
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
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
          EAROS Editor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enterprise Architecture Rubric Operational Standard · v2.0
        </Typography>
      </Box>

      <Typography variant="overline" color="text.disabled" sx={{ mb: 2, letterSpacing: 1.5 }}>
        What would you like to do?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 1080,
          width: '100%',
        }}
      >
        {CARDS.map((card) => (
          <Card
            key={card.mode}
            sx={{
              flex: '1 1 280px',
              maxWidth: 320,
              borderRadius: 3,
              border: `2px solid ${card.borderColor}`,
              transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
              '&:hover': {
                borderColor: card.hoverBorderColor,
                boxShadow: card.hoverShadow,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea onClick={() => onSelectMode(card.mode)} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4.5, px: 3.5 }}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    bgcolor: card.iconBg,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1.5, color: card.titleColor }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                  {card.description}
                </Typography>
                <Typography variant="caption" sx={{ color: card.taglineColor, fontWeight: 500 }}>
                  {card.tagline}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
