import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survivors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').index('survivors_id')

      table.string('name', 60).notNullable().unique()
      table.integer('age').notNullable()
      table.string('gender').notNullable()
      table.json('last_location').notNullable() // JSON para armazenar latitude e longitude
      table.integer('infected_flag_count').defaultTo(0).notNullable()
      table.boolean('is_infected').index('survivors_is_infected').defaultTo(false).notNullable()
      table.boolean('can_add_items').defaultTo(true).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
