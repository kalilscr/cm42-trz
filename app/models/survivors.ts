import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Item from './items.ts'

export default class Survivor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare age: number

  @column()
  declare gender: string

  @column()
  declare lastLocation: {
    latitude: string
    longitude: string
  }

  // @column()
  // declare latitude: string

  // @column()
  // declare longitude: string

  @column()
  declare infectedFlagCount: number

  @column()
  declare isInfected: boolean

  @hasMany(() => Item)
  declare items: HasMany<typeof Item>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
