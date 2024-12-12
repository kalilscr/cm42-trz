import { ItemInterface } from '../interfaces/item_interface.ts'
import Item from '../models/items.ts'
import Survivor from '../models/survivors.ts'

export default class ItemsService {
  constructor() {}

  async add(id: number, data: ItemInterface[]) {
    const survivor = await Survivor.findByOrFail({ id: id })

    if (!survivor.canAddItems) {
      throw new Error('cant add new items, only trade allowed')
    }

    const items = this.itemFactory(id, data)
    await Item.createMany(items)

    await survivor.merge({ canAddItems: false }).save()
  }

  itemFactory(id: number, data: ItemInterface[]) {
    const items = data.map((item) => {
      return { survivorId: id, ...item }
    })

    return items
  }
}
