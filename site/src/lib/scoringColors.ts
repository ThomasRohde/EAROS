import { sapphire } from '../theme'
import type { GateSeverity } from '../content/demoData'
import type { Status } from './scoring'

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

export function getScoreColor(score: number, isDark: boolean): string {
  const colors: Record<number, string> = {
    0: isDark ? sapphire.red[500] : sapphire.red[700],
    1: isDark ? sapphire.red[500] : sapphire.red[500],
    2: isDark ? sapphire.yellow[300] : sapphire.yellow[700],
    3: isDark ? sapphire.green[400] : sapphire.green[600],
    4: isDark ? sapphire.green[400] : sapphire.green[500],
  }
  return colors[score] ?? (isDark ? sapphire.gray[400] : sapphire.gray[600])
}

export function getScoreBg(score: number, isDark: boolean): string {
  const bgs: Record<number, string> = {
    0: isDark ? 'hsl(0 65% 51% / 0.15)' : sapphire.red[50],
    1: isDark ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50],
    2: isDark ? 'hsl(41 95% 46% / 0.15)' : sapphire.yellow[50],
    3: isDark ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50],
    4: isDark ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50],
  }
  return bgs[score] ?? 'transparent'
}

export interface GateChipProps {
  bg: string
  color: string
  label: string
}

export function getGateChipProps(
  severity: GateSeverity,
  isDark: boolean,
): GateChipProps {
  switch (severity) {
    case 'critical':
      return {
        bg: isDark ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50],
        color: isDark ? sapphire.red[500] : sapphire.red[700],
        label: 'Critical gate',
      }
    case 'major':
      return {
        bg: isDark ? 'hsl(41 95% 46% / 0.12)' : sapphire.yellow[50],
        color: isDark ? sapphire.yellow[300] : sapphire.yellow[700],
        label: 'Major gate',
      }
    default:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        color: isDark ? sapphire.gray[400] : sapphire.gray[600],
        label: 'No gate',
      }
  }
}

export const STATUS_CONFIG: Record<
  Status,
  { label: string; colorFn: (isDark: boolean) => string; bgFn: (isDark: boolean) => string }
> = {
  pass: {
    label: 'Pass',
    colorFn: (d) => (d ? sapphire.green[400] : sapphire.green[700]),
    bgFn: (d) => (d ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50]),
  },
  conditional_pass: {
    label: 'Conditional Pass',
    colorFn: (d) => (d ? sapphire.yellow[300] : sapphire.yellow[700]),
    bgFn: (d) => (d ? 'hsl(41 95% 46% / 0.15)' : sapphire.yellow[50]),
  },
  rework_required: {
    label: 'Rework Required',
    colorFn: (d) => (d ? sapphire.red[500] : sapphire.red[700]),
    bgFn: (d) => (d ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50]),
  },
  reject: {
    label: 'Reject',
    colorFn: (d) => (d ? sapphire.red[500] : sapphire.red[700]),
    bgFn: (d) => (d ? 'hsl(0 65% 51% / 0.18)' : sapphire.red[100]),
  },
  not_reviewable: {
    label: 'Not Reviewable',
    colorFn: (d) => (d ? sapphire.gray[400] : sapphire.gray[600]),
    bgFn: (d) => (d ? 'hsl(211 19% 49% / 0.1)' : sapphire.gray[50]),
  },
}
