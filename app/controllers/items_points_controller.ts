import type { HttpContext } from '@adonisjs/core/http'
import { createItemPointsValidator, updateItemPointsValidator } from '../validators/item_points.ts'
import ItemsPointsService from '../services/items_points_service.ts'
import { inject } from '@adonisjs/core'

@inject()
export default class ItemsPointsController {
  constructor(protected itemsPointsService: ItemsPointsService) {}
  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createItemPointsValidator)

    await this.itemsPointsService.create(payload)
  }

  async update({ request }: HttpContext) {
    const payload = await request.validateUsing(updateItemPointsValidator)
    const header = request.headers()

    await this.itemsPointsService.update(Number(header.id), payload)
  }

  async list() {
    return await this.itemsPointsService.list()
  }

  async delete({ request }: HttpContext) {
    const header = request.headers()

    await this.itemsPointsService.delete(Number(header.id))
  }
}
