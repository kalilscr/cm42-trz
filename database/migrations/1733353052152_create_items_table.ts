import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').index('items_id')

      table.string('name', 30).notNullable()
      table.integer('quantity').notNullable().index('items_quantity')
      table.integer('survivor_id').unsigned().references('survivors.id').onDelete('CASCADE') // delete post when user is deleted
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
