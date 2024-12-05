import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survivors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('item_id').unsigned().references('items.id').onDelete('CASCADE') // delete item when user is deleted
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('item_id')
    })
  }
}
