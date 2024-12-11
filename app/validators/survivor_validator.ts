import vine from '@vinejs/vine'
import { isLatitude } from './rules/latitude.ts'
import { isLongitude } from './rules/longitude.ts'

export const createSurvivorValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    age: vine.number().max(120),
    gender: vine.string().trim().in(['Male', 'Female']),
    lastLocation: vine.object({
      latitude: vine.string().trim().use(isLatitude({})),
      longitude: vine.string().trim().use(isLongitude({})),
    }),
    items: vine.array(
      vine.object({
        name: vine
          .string()
          .trim()
          .toUpperCase()
          .transform((name) => name.replace(/[^a-zA-Z0-9]/g, '_')),
        quantity: vine.number(),
      })
    ),
  })
)

export const updateLocationValidator = vine.compile(
  vine.object({
    latitude: vine.string().trim(),
    longitude: vine.string().trim(),
  })
)
