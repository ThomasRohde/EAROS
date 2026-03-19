import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  alpha,
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
  colorKey: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

const ROWS: Array<{ label: string; cards: CardDef[] }> = [
  {
    label: 'For Governance Teams',
    cards: [
      {
        mode: 'create-rubric',
        icon: <AddCircleIcon sx={{ fontSize: 36 }} />,
        title: 'Create Rubric',
        description: 'Design new scoring criteria for an artifact type',
        subtitle: 'Build a new core rubric, profile, or overlay from scratch',
        colorKey: 'primary',
      },
      {
        mode: 'rubric',
        icon: <SettingsIcon sx={{ fontSize: 36 }} />,
        title: 'Edit Rubric',
        description: 'Modify existing scoring criteria',
        subtitle: 'Update dimensions, criteria, and scoring guides',
        colorKey: 'primary',
      },
    ],
  },
  {
    label: 'For Reviewers',
    cards: [
      {
        mode: 'new-assessment',
        icon: <PlaylistAddCheckIcon sx={{ fontSize: 36 }} />,
        title: 'New Assessment',
        description: 'Score an architecture document',
        subtitle: 'Start a new evaluation with guided setup',
        colorKey: 'success',
      },
      {
        mode: 'continue-assessment',
        icon: <FolderOpenIcon sx={{ fontSize: 36 }} />,
        title: 'Continue Assessment',
        description: 'Resume a saved evaluation',
        subtitle: 'Open and continue an existing evaluation record',
        colorKey: 'success',
      },
    ],
  },
  {
    label: 'For Architects',
    cards: [
      {
        mode: 'new-artifact',
        icon: <NoteAddIcon sx={{ fontSize: 36 }} />,
        title: 'Create Artifact',
        description: 'Write a new architecture document',
        subtitle: 'Start from a template with built-in EAROS guidance',
        colorKey: 'warning',
      },
      {
        mode: 'edit-artifact',
        icon: <EditNoteIcon sx={{ fontSize: 36 }} />,
        title: 'Edit Artifact',
        description: 'Improve an existing document',
        subtitle: 'Open an architecture document and see EAROS assessment guidance',
        colorKey: 'warning',
      },
    ],
  },
]

export default function HomeScreen({ onSelectMode }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: isDark 
          ? 'radial-gradient(ellipse at 15% 50%, rgba(6, 249, 249, 0.08), transparent 35%), radial-gradient(ellipse at 85% 30%, rgba(139, 92, 246, 0.08), transparent 35%)'
          : 'radial-gradient(ellipse at 15% 50%, rgba(2, 132, 199, 0.06), transparent 35%), radial-gradient(ellipse at 85% 30%, rgba(99, 102, 241, 0.06), transparent 35%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 7 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            mb: 1.5,
            background: isDark 
              ? 'linear-gradient(90deg, #06f9f9 0%, #8b5cf6 100%)' 
              : 'linear-gradient(90deg, #0284c7 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1.5px',
            textShadow: isDark ? '0 0 40px rgba(6, 249, 249, 0.2)' : '0 4px 20px rgba(2, 132, 199, 0.1)',
          }}
        >
          EAROS Editor
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Enterprise Architecture Rubric Operational Standard · v2.0
        </Typography>
      </Box>

      {/* Card grid */}
      <Box sx={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ROWS.map((row) => (
          <Box key={row.label}>
            {/* Section header */}
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                mb: 2.5,
                color: theme.palette.text.secondary,
                fontWeight: 700,
                letterSpacing: 2.5,
                fontSize: '0.75rem',
              }}
            >
              {row.label}
            </Typography>

            {/* Two-column row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3.5 }}>
              {row.cards.map((card) => {
                const mainColor = theme.palette[card.colorKey].main;
                
                return (
                  <Card
                    key={card.mode}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 12px 35px ${alpha(mainColor, isDark ? 0.25 : 0.18)}`,
                        borderColor: alpha(mainColor, 0.4),
                      },
                    }}
                  >
                    <CardActionArea onClick={() => onSelectMode(card.mode)} sx={{ height: '100%' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, p: 3.5 }}>
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: alpha(mainColor, isDark ? 0.1 : 0.08),
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: mainColor,
                            boxShadow: `inset 0 0 0 1px ${alpha(mainColor, 0.2)}`,
                          }}
                        >
                          {card.icon}
                        </Box>

                        {/* Text */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: mainColor, mb: 0.5, lineHeight: 1.2, letterSpacing: '-0.3px' }}
                          >
                            {card.title}
                          </Typography>
                          <Typography variant="body2" color="text.primary" sx={{ mb: 1.5, lineHeight: 1.5, fontWeight: 500 }}>
                            {card.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                            {card.subtitle}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
