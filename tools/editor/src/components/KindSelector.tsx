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

export default function KindSelector({ kind, onChange }: Props) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel
        sx={{ color: 'rgba(255,255,255,0.8)', '&.Mui-focused': { color: 'white' } }}
      >
        Document Kind
      </InputLabel>
      <Select
        value={kind}
        label="Document Kind"
        onChange={(e) => onChange(e.target.value as Kind)}
        sx={{
          color: 'white',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'white' },
        }}
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
