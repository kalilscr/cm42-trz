import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

type Options = {}

async function latitude(value: unknown, options: Options, field: FieldContext) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  const lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/

  const result = lat.test(value)

  if (!result) {
    field.report('The {{ field }} is not a valid latitude', 'latitude', field)
  }
}

export const isLatitude = vine.createRule(latitude)
