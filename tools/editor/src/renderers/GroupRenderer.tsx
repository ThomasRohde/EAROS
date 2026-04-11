import {
  and,
  deriveLabelForUISchemaElement,
  rankWith,
  uiTypeIs,
  type GroupLayout,
  type LayoutProps,
  type RankedTester,
} from '@jsonforms/core'
import { withJsonFormsLayoutProps, withTranslateProps, type TranslateProps } from '@jsonforms/react'
import { MaterialLayoutRenderer, type MaterialLayoutRendererProps } from '@jsonforms/material-renderers'
import { Box, Typography } from '@mui/material'

/**
 * Compact Group layout — replaces the default material Group renderer (which
 * uses a big Typography h5 and generous padding). This renderer uses a small
 * subtitle-sized header and tight field spacing so authors don't waste half
 * the screen on whitespace around 3 short controls.
 *
 * Rank 4 beats the built-in material GroupLayoutRenderer (rank 1).
 */
export const groupLayoutTester: RankedTester = rankWith(4, and(uiTypeIs('Group')))

function GroupLayoutComponent({
  uischema,
  schema,
  path,
  visible,
  enabled,
  renderers,
  cells,
  direction = 'column',
  t,
}: LayoutProps & TranslateProps) {
  if (!visible) return null

  const group = uischema as GroupLayout
  const label = deriveLabelForUISchemaElement(group, t)

  const childProps: MaterialLayoutRendererProps = {
    elements: group.elements ?? [],
    schema,
    path,
    direction,
    visible,
    enabled,
    renderers,
    cells,
  }

  return (
    <Box
      sx={{
        mb: 2,
        pt: 1,
        // Tighten the vertical rhythm of every FormControl inside the group
        // so short inputs (version/status/owner) pack closely together.
        '& .MuiFormControl-root': { mt: 0.5, mb: 0.5 },
        '& .MuiFormControl-marginNormal': { mt: 0.5, mb: 0.5 },
      }}
    >
      {label && (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontWeight: 700,
            letterSpacing: 0.6,
            fontSize: '0.72rem',
            color: 'text.secondary',
            mb: 0.75,
            pb: 0.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {label}
        </Typography>
      )}
      <MaterialLayoutRenderer {...childProps} />
    </Box>
  )
}

export const GroupLayoutRenderer = withJsonFormsLayoutProps(
  withTranslateProps(GroupLayoutComponent),
)
