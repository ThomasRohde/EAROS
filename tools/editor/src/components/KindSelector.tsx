import { FormControl, Select, MenuItem, InputLabel } from '@mui/material'

export type Kind = 'core_rubric' | 'profile' | 'overlay' | 'evaluation'

interface Props {
  kind: Kind
  onChange: (kind: Kind) => void
}

const OPTIONS: { value: Kind; label: string }[] = [
  { value: 'core_rubric', label: 'Core Rubric' },
  { value: 'profile', label: 'Profile' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'evaluation', label: 'Evaluation Record' },
]

function KindSelector({ kind, onChange }: Props) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Document Kind</InputLabel>
      <Select
        value={kind}
        label="Document Kind"
        onChange={(e) => onChange(e.target.value as Kind)}
      >
        {OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
