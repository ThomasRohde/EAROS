import { useRef } from 'react'
import { Button, Tooltip } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'

interface Props {
  onImport: (content: string) => void
  onExport: () => void
}

export default function FileControls({ onImport, onExport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onImport(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = '' // allow re-importing same file
  }

  const btnSx = {
    color: 'white',
    borderColor: 'rgba(255,255,255,0.4)',
    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
    textTransform: 'none',
    fontWeight: 400,
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <Tooltip title="Import a YAML file from outside the repo">
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{ ...btnSx, mr: 1 }}
        >
          Import External
        </Button>
      </Tooltip>
      <Tooltip title="Export as YAML">
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          sx={btnSx}
        >
          Export
        </Button>
      </Tooltip>
    </>
  )
}
