import { ItemInterface } from '../interfaces/item_interface.ts'
import Item from '../models/items.ts'
import ItemPoints from '../models/items_points.ts'
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

  async validateItems(listToValidate: any[]) {
    /**
     * compare if the items received are different from the items on items_points table
     */
    const itemsPoints = await ItemPoints.all()

    const set = new Set(itemsPoints.map((item) => item['name']))

    const isSubset = listToValidate.every((item) => set.has(item['name']))

    return isSubset

    // const itemsPoints = await ItemPoints.all()
    // const isSubset = listToValidate.every((item2) =>
    //   itemsPoints.some((item1) => item1['name'] === item2['name'])
    // ) compare performance
  }

  async hasUniqueItems(items: ItemInterface[]) {
    const uniqueNames = new Set(items.map((item) => item.name))

    return uniqueNames.size === items.length
  }
}
