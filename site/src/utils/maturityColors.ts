import { sapphire } from '../theme'

/** Map a maturity level (0–5) to its primary accent colour. */
export function getLevelColor(level: number, isDark: boolean): string {
  switch (level) {
    case 1: return isDark ? sapphire.gray[400] : sapphire.gray[500]
    case 2: return isDark ? sapphire.green[400] : sapphire.green[500]
    case 3: return isDark ? sapphire.blue[400] : sapphire.blue[500]
    case 4: return isDark ? sapphire.yellow[300] : sapphire.yellow[500]
    case 5: return isDark ? sapphire.gold[3] : sapphire.gold[2]
    default: return isDark ? sapphire.gray[400] : sapphire.gray[500]
  }
}

/** Semi-transparent background tinted to the maturity level colour. */
export function getLevelBg(level: number, isDark: boolean): string {
  switch (level) {
    case 1: return isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50]
    case 2: return isDark ? 'hsl(122 39% 49% / 0.08)' : sapphire.green[50]
    case 3: return isDark ? 'hsl(216 100% 63% / 0.08)' : sapphire.blue[50]
    case 4: return isDark ? 'hsl(46 97% 65% / 0.08)' : sapphire.yellow[50]
    case 5: return isDark ? 'hsl(40 57% 62% / 0.08)' : 'hsl(40 57% 62% / 0.08)'
    default: return isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50]
  }
}

/** Subtle border tinted to the maturity level colour. */
export function getLevelBorder(level: number, isDark: boolean): string {
  switch (level) {
    case 1: return isDark ? 'hsl(211 19% 49% / 0.20)' : 'hsl(211 19% 49% / 0.13)'
    case 2: return isDark ? 'hsl(122 39% 49% / 0.20)' : 'hsl(122 39% 49% / 0.13)'
    case 3: return isDark ? 'hsl(216 100% 63% / 0.20)' : 'hsl(216 100% 63% / 0.13)'
    case 4: return isDark ? 'hsl(46 97% 65% / 0.20)' : 'hsl(46 97% 65% / 0.13)'
    case 5: return isDark ? 'hsl(40 57% 62% / 0.20)' : 'hsl(40 57% 62% / 0.13)'
    default: return isDark ? 'hsl(211 19% 49% / 0.20)' : 'hsl(211 19% 49% / 0.13)'
  }
}

/** Full color set for components that need bg, text, and dot colours. */
export function getLevelColors(level: number, isDark: boolean): { bg: string; text: string; dot: string } {
  switch (level) {
    case 0:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        text: isDark ? sapphire.gray[300] : sapphire.gray[700],
        dot: isDark ? sapphire.gray[400] : sapphire.gray[500],
      }
    case 2:
      return {
        bg: isDark ? 'hsl(122 39% 49% / 0.08)' : sapphire.green[50],
        text: isDark ? sapphire.green[100] : sapphire.green[700],
        dot: isDark ? sapphire.green[400] : sapphire.green[500],
      }
    case 3:
      return {
        bg: isDark ? 'hsl(216 100% 63% / 0.08)' : sapphire.blue[50],
        text: isDark ? sapphire.blue[100] : sapphire.blue[700],
        dot: isDark ? sapphire.blue[400] : sapphire.blue[500],
      }
    case 4:
      return {
        bg: isDark ? 'hsl(46 97% 65% / 0.08)' : sapphire.yellow[50],
        text: isDark ? sapphire.yellow[100] : sapphire.yellow[700],
        dot: isDark ? sapphire.yellow[300] : sapphire.yellow[500],
      }
    case 5:
      return {
        bg: isDark ? 'hsl(40 57% 62% / 0.08)' : 'hsl(40 57% 62% / 0.1)',
        text: isDark ? sapphire.gold[3] : sapphire.gold[1],
        dot: isDark ? sapphire.gold[3] : sapphire.gold[3],
      }
    default:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        text: isDark ? sapphire.gray[300] : sapphire.gray[700],
        dot: isDark ? sapphire.gray[400] : sapphire.gray[500],
      }
  }
}
