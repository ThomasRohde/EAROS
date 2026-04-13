import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
})
