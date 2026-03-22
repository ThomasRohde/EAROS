// Canonical source: tools/editor/src/ThemeContext.ts

import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
})
