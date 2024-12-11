import vine from '@vinejs/vine'

export const createItemPointsValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .toUpperCase()
      .transform((name) => name.replace(/[^a-zA-Z0-9]/g, '_')), // replace all characters except the numbers and letters with underscore
    points: vine.number().max(120), //,
  })
)

export const updateItemPointsValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .transform((name) => name.replace(/[^a-zA-Z0-9]/g, '_')), // replace all characters except the numbers and letters with underscore
    points: vine.number().max(120).optional(), //,
  })
)
