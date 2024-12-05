import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items_points'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').index('items_points_id')

      table.string('name', 30).notNullable()
      table.integer('points').notNullable().index('items_points_points')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
