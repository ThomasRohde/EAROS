import { Box, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { sapphire } from '../theme'

export default function Layout() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? sapphire.gray[900] : sapphire.sand[50],
      }}
    >
      <Navbar />
      <Box sx={{ flex: 1, pt: '64px' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
