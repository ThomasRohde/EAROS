/**
 * Custom array layout renderer for dimensions and criteria arrays.
 * Shows composite labels like "D1 — Stakeholder and purpose fit" instead of just "D1".
 * Uses unmountOnExit on collapsed accordions to avoid rendering thousands of hidden DOM nodes.
 */
import React, { useState, useCallback, useMemo } from 'react'
import {
  ArrayLayoutProps,
  ArrayTranslations,
  composePaths,
  computeLabel,
  createDefaultValue,
  findUISchema,
  Resolve,
  RankedTester,
  rankWith,
  and,
  or,
  isObjectArrayWithNesting,
  scopeEndIs,
} from '@jsonforms/core'
import {
  JsonFormsDispatch,
  withJsonFormsArrayLayoutProps,
  withTranslateProps,
  withArrayTranslationProps,
  useJsonForms,
} from '@jsonforms/react'
import {
  ArrayLayoutToolbar,
  ctxDispatchToExpandPanelProps,
} from '@jsonforms/material-renderers'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import { ExpandMore, Delete, ErrorOutline } from '@mui/icons-material'

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1) + '\u2026'
}

function computeCompositeLabel(data: any, childPath: string): string {
  const childData = Resolve.data(data, childPath)
  if (!childData) return ''

  const id = childData.id ?? ''
  const secondary = childData.name ?? (childData.question ? truncate(childData.question, 80) : '')

  if (!id && !secondary) return ''
  if (!secondary) return id
  if (!id) return secondary
  return `${id} \u2014 ${secondary}`
}

/**
 * Single accordion panel for a dimension or criterion.
 * Renders its own Accordion with slotProps.transition.unmountOnExit so collapsed
 * content is removed from the DOM entirely — avoiding 4000+ hidden nodes.
 */
function LabeledExpandPanel(props: {
  enabled: boolean
  index: number
  path: string
  uischema: any
  schema: any
  expanded: boolean
  renderers: any
  cells: any
  uischemas: any
  rootSchema: any
  enableMoveUp: boolean
  enableMoveDown: boolean
  config: any
  handleExpansion: (panel: string) => (event: any, expanded: boolean) => void
  translations: ArrayTranslations
  disableRemove?: boolean
}) {
  const {
    enabled, index, path, uischema, schema, expanded,
    renderers, cells, uischemas, rootSchema, config,
    handleExpansion, translations, disableRemove,
  } = props

  const ctx = useJsonForms()
  const { removeItems } = ctxDispatchToExpandPanelProps(ctx.dispatch)
  const childPath = composePaths(path, `${index}`)
  const childLabel = computeCompositeLabel(ctx.core?.data, childPath)
  // Detect validation errors whose instancePath falls within this accordion's
  // subtree so we can surface a badge on the collapsed summary row.
  const childErrorCount = useMemo(() => {
    if ((config as any)?.earosShowErrors !== true) return 0
    const errors: any[] = ctx.core?.errors ?? []
    if (!errors.length) return 0
    const needle = '/' + childPath.replace(/\./g, '/')
    return errors.filter((e: any) => {
      const ip = e?.instancePath
      if (typeof ip !== 'string') return false
      if (ip === needle || ip.startsWith(needle + '/')) return true
      // required errors report on the parent; fold missingProperty into the path.
      const miss = e?.params?.missingProperty
      if (typeof miss !== 'string' || !miss) return false
      const eff = ip === '' ? `/${miss}` : `${ip}/${miss}`
      return eff === needle || eff.startsWith(needle + '/')
    }).length
  }, [ctx.core?.errors, childPath])

  const foundUISchema = useMemo(
    () => findUISchema(uischemas, schema, uischema.scope, path, undefined, uischema, rootSchema),
    [uischemas, schema, uischema.scope, path, uischema, rootSchema],
  )

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpansion(childPath)}
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container sx={{ width: '100%' }} alignItems="center">
          <Grid size={{ xs: 7, md: 9 }}>
            <Grid container alignItems="center">
              <Grid size={{ xs: 2, md: 1 }}>
                <Avatar aria-label="Index">{index + 1}</Avatar>
              </Grid>
              <Grid size={{ xs: 10, md: 11 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{childLabel}</span>
                {childErrorCount > 0 && !expanded && (
                  <Tooltip title={`${childErrorCount} validation issue${childErrorCount === 1 ? '' : 's'} in this item`}>
                    <ErrorOutline sx={{ fontSize: 18, color: 'error.main' }} />
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 5, md: 3 }}>
            <Grid container justifyContent="flex-end">
              {enabled && !disableRemove && (
                <Tooltip title={translations.removeTooltip} placement="bottom">
                  <IconButton
                    onClick={removeItems(path, [index])}
                    style={{ float: 'right' }}
                    aria-label={translations.removeAriaLabel}
                    size="large"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <JsonFormsDispatch
          enabled={enabled}
          schema={schema}
          uischema={foundUISchema}
          path={childPath}
          key={childPath}
          renderers={renderers}
          cells={cells}
        />
      </AccordionDetails>
    </Accordion>
  )
}

const LabeledArrayLayoutComponent = ({
  visible,
  addItem,
  translations,
  ...props
}: ArrayLayoutProps & { translations: ArrayTranslations }) => {
  const [expanded, setExpanded] = useState<string | boolean>(false)

  const innerCreateDefaultValue = useCallback(
    () => createDefaultValue(props.schema, props.rootSchema),
    [props.schema, props.rootSchema],
  )

  const handleChange = useCallback(
    (panel: string) => (_event: any, expandedPanel: boolean) => {
      setExpanded(expandedPanel ? panel : false)
    },
    [],
  )

  const isExpanded = (index: number) =>
    expanded === composePaths(props.path, `${index}`)

  const {
    enabled, data, path, schema, uischema, errors,
    renderers, cells, label, required, rootSchema, config,
    uischemas, description, disableAdd, disableRemove,
  } = props

  const appliedUiSchemaOptions = { ...config, ...uischema.options }
  const doDisableAdd = disableAdd || appliedUiSchemaOptions.disableAdd
  const doDisableRemove = disableRemove || appliedUiSchemaOptions.disableRemove

  if (!visible) return null

  return (
    <div>
      <ArrayLayoutToolbar
        translations={translations}
        label={computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
        description={description}
        errors={errors}
        path={path}
        enabled={enabled}
        addItem={addItem}
        createDefault={innerCreateDefaultValue}
        disableAdd={doDisableAdd}
      />
      <div>
        {data > 0 ? (
          Array.from({ length: data }, (_, index) => (
            <LabeledExpandPanel
              key={index}
              enabled={enabled}
              index={index}
              expanded={isExpanded(index)}
              schema={schema}
              path={path}
              handleExpansion={handleChange}
              uischema={uischema}
              renderers={renderers}
              cells={cells}
              rootSchema={rootSchema}
              enableMoveUp={index !== 0}
              enableMoveDown={index < data - 1}
              config={config}
              uischemas={uischemas}
              translations={translations}
              disableRemove={doDisableRemove}
            />
          ))
        ) : (
          <p>{translations.noDataMessage}</p>
        )}
      </div>
    </div>
  )
}

export const labeledArrayTester: RankedTester = rankWith(
  5,
  and(
    isObjectArrayWithNesting,
    or(scopeEndIs('dimensions'), scopeEndIs('criteria')),
  ),
)

export const LabeledArrayRenderer = withJsonFormsArrayLayoutProps(
  withTranslateProps(withArrayTranslationProps(LabeledArrayLayoutComponent)),
)
