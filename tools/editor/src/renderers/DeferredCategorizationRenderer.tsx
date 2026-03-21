import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  and,
  deriveLabelForUISchemaElement,
  isVisible,
  not,
  optionIs,
  rankWith,
  type Categorization,
  type Category,
  type RankedTester,
  type StatePropsOfLayout,
  type UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core'
import { withJsonFormsLayoutProps, withTranslateProps, type TranslateProps } from '@jsonforms/react'
import {
  MaterialLayoutRenderer,
  withAjvProps,
  type AjvProps,
  type MaterialLayoutRendererProps,
} from '@jsonforms/material-renderers'
import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material'

const isSingleLevelCategorization = and(
  uiTypeIs('Categorization'),
  (uischema: UISchemaElement): boolean => {
    const categorization = uischema as Categorization
    return categorization.elements?.every((element) => element.type === 'Category') ?? false
  },
)

export const deferredCategorizationTester: RankedTester = rankWith(
  3,
  and(isSingleLevelCategorization, not(optionIs('variant', 'stepper'))),
)

interface Props extends StatePropsOfLayout, AjvProps, TranslateProps {
  selected?: number
  data?: unknown
  onChange?: (selected: number, previous: number) => void
}

function DeferredCategorizationRendererComponent({
  data,
  path,
  renderers,
  cells,
  schema,
  uischema,
  visible,
  enabled,
  selected,
  onChange,
  config,
  ajv,
  t,
}: Props) {
  const categorization = uischema as Categorization
  const categories = useMemo(
    () =>
      categorization.elements.filter(
        (category): category is Category =>
          category.type === 'Category' && isVisible(category, data, undefined, ajv, config),
      ),
    [categorization, data, ajv, config],
  )
  const [selectedCategory, setSelectedCategory] = useState(selected ?? 0)
  const [renderedCategory, setRenderedCategory] = useState(selected ?? 0)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setSelectedCategory(selected ?? 0)
    setRenderedCategory(selected ?? 0)
  }, [categorization, selected])

  const safeSelected = selectedCategory >= categories.length ? 0 : selectedCategory
  const safeRendered = renderedCategory >= categories.length ? safeSelected : renderedCategory
  const isSwitching = safeSelected !== safeRendered

  useEffect(() => {
    if (safeSelected === safeRendered) return

    const timer = window.setTimeout(() => {
      startTransition(() => {
        setRenderedCategory(safeSelected)
      })
    }, 90)

    return () => window.clearTimeout(timer)
  }, [safeRendered, safeSelected, startTransition])

  const tabLabels = useMemo(
    () => categories.map((category) => deriveLabelForUISchemaElement(category, t)),
    [categories, t],
  )

  const childProps: MaterialLayoutRendererProps = {
    elements: categories[safeRendered]?.elements ?? [],
    schema,
    path,
    direction: 'column',
    enabled,
    visible,
    renderers,
    cells,
  }

  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    if (onChange) {
      onChange(value, safeSelected)
    }
    setSelectedCategory(value)
  }

  if (!visible || categories.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Tabs
          value={safeSelected}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {categories.map((_, index) => (
            <Tab key={tabLabels[index] ?? index} label={tabLabels[index]} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 1.5, minHeight: 180 }}>
        {isSwitching ? (
          <Box sx={{ px: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Loading section…
            </Typography>
            <Skeleton variant="rounded" height={72} sx={{ mt: 1 }} />
            <Skeleton variant="rounded" height={72} sx={{ mt: 1.5 }} />
            <Skeleton variant="rounded" height={120} sx={{ mt: 1.5 }} />
          </Box>
        ) : (
          <MaterialLayoutRenderer {...childProps} key={safeRendered} />
        )}
      </Box>
    </Box>
  )
}

export const DeferredCategorizationRenderer = withAjvProps(
  withTranslateProps(withJsonFormsLayoutProps(DeferredCategorizationRendererComponent)),
)
