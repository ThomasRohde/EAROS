import yaml from 'js-yaml'

export function toJson(yamlStr: string): unknown {
  return yaml.load(yamlStr)
}

export function toYaml(obj: unknown): string {
  return yaml.dump(obj, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })
}
