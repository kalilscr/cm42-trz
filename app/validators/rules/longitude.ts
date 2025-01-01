import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

type Options = {}

async function longitude(value: unknown, _options: Options, field: FieldContext) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  const long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/

  const result = long.test(value)

  if (!result) {
    field.report('The {{ field }} is not a valid longitude', 'longitude', field)
  }
}

export const isLongitude = vine.createRule(longitude)
