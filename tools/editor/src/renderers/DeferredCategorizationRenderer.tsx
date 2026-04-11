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
import { useJsonForms, withJsonFormsLayoutProps, withTranslateProps, type TranslateProps } from '@jsonforms/react'
import {
  MaterialLayoutRenderer,
  withAjvProps,
  type AjvProps,
  type MaterialLayoutRendererProps,
} from '@jsonforms/material-renderers'
import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

/**
 * Convert a JSON-Forms scope pointer ("#/properties/sections/properties/scope")
 * into the instancePath prefix AJV emits in errors ("/sections/scope").
 */
function scopeToInstancePrefix(scope: string | undefined): string | null {
  if (typeof scope !== 'string' || !scope.startsWith('#/')) return null
  const cleaned = scope
    .slice(2)
    .split('/')
    .filter((seg) => seg !== 'properties')
  return '/' + cleaned.join('/')
}

function collectScopePrefixes(element: UISchemaElement | undefined): string[] {
  if (!element) return []
  const out: string[] = []
  const walk = (el: any) => {
    if (!el) return
    if (typeof el.scope === 'string') {
      const prefix = scopeToInstancePrefix(el.scope)
      if (prefix) out.push(prefix)
    }
    if (Array.isArray(el.elements)) el.elements.forEach(walk)
    if (el.detail) walk(el.detail)
  }
  walk(element)
  return out
}

const isSingleLevelCategorization = and(
  uiTypeIs('Categorization'),
  (uischema: UISchemaElement): boolean => {
    const categorization = uischema as Categorization
    return categorization.elements?.every((element) => element.type === 'Category') ?? false
  },
)

export const deferredCategorizationTester: RankedTester = rankWith(
  5,
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

  // Count validation errors whose instancePath falls under any scope inside
  // each category. Used to render an error badge on the tab header so authors
  // can see which tabs still need work without clicking through them.
  const jsonFormsCtx = useJsonForms()
  const showErrorBadges = (config as any)?.earosShowErrors === true
  const allErrors: any[] = showErrorBadges ? jsonFormsCtx.core?.errors ?? [] : []
  const categoryErrorCounts = useMemo(() => {
    if (!allErrors.length) return categories.map(() => 0)
    return categories.map((category) => {
      const prefixes = collectScopePrefixes(category)
      if (!prefixes.length) return 0
      let count = 0
      for (const err of allErrors) {
        const ip: string = err?.instancePath ?? ''
        if (typeof ip !== 'string') continue
        // AJV reports "required" errors on the parent object with
        // params.missingProperty naming the absent field. Treat the effective
        // path as parent + '/' + missingProperty so a scope that targets the
        // leaf field still catches the error.
        const missing = err?.params?.missingProperty
        const effective = typeof missing === 'string' && missing.length > 0
          ? (ip === '' ? `/${missing}` : `${ip}/${missing}`)
          : ip
        if (prefixes.some((p) => effective === p || effective.startsWith(p + '/') || ip === p || ip.startsWith(p + '/'))) count++
      }
      return count
    })
  }, [allErrors, categories])

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
          {categories.map((_, index) => {
            const errorCount = categoryErrorCounts[index] ?? 0
            return (
              <Tab
                key={tabLabels[index] ?? index}
                label={
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                    {errorCount > 0 && (
                      <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <span>{tabLabels[index]}</span>
                    {errorCount > 0 && (
                      <Box
                        component="span"
                        sx={{
                          bgcolor: 'error.main',
                          color: 'error.contrastText',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          lineHeight: 1,
                          minWidth: 16,
                          height: 16,
                          px: 0.5,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {errorCount > 99 ? '99+' : errorCount}
                      </Box>
                    )}
                  </Box>
                }
              />
            )
          })}
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
