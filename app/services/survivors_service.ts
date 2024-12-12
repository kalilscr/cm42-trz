import { inject } from '@adonisjs/core'
import { SurvivorInterface, UpdateLocationInterface } from '../interfaces/survivor_interface.ts'
import Survivor from '../models/survivors.ts'
import ItemsService from './items_service.ts'
import ItemPoints from '../models/items_points.ts'

@inject()
export default class SurvivorsService {
  constructor(protected itemsService: ItemsService) {}

  async create(payload: SurvivorInterface) {
    /**
     * compare if the items received are different types of items points table
     */
    const itemsPoints = await ItemPoints.all()
    const isSubset = payload.items.every((item2) =>
      itemsPoints.some((item1) => item1['name'] === item2['name'])
    )
    if (!isSubset) {
      throw new Error('one of the items received is not included in the item points table')
    }

    const survivor = await Survivor.findBy({ name: payload.name })

    if (survivor) {
      throw new Error('survivor already exists')
    }

    const createdSurvivor = await Survivor.create(payload)

    await this.itemsService.add(createdSurvivor.id, payload.items)
  }

  async updateLocation(name: string, lastLocation: UpdateLocationInterface) {
    const survivor = await Survivor.findByOrFail({ name: name })

    await survivor.merge({ lastLocation }).save()
  }

  async reportContamination() {}
}
