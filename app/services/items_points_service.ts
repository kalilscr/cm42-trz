import ItemPoints from '../models/items_points.ts'
import {
  CreateItemPointsInterface,
  UpdateItemPointsInterface,
} from '../interfaces/item_point_interface.ts'

export default class ItemsPointsService {
  constructor() {}

  async create(payload: CreateItemPointsInterface) {
    const item = await ItemPoints.findBy({ name: payload.name })

    if (item) {
      throw new Error(`Item ${item.name} already exists`)
    }

    await ItemPoints.create(payload)
  }

  async update(id: number, payload: UpdateItemPointsInterface) {
    await ItemPoints.findByOrFail({ id: id })

    await ItemPoints.updateOrCreate({ id: id }, payload)
  }

  async list() {
    return await ItemPoints.all()
  }

  async delete(id: number) {
    const item = await ItemPoints.findOrFail(id)
    await item.delete()
  }
}
