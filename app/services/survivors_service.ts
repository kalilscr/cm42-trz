import { inject } from '@adonisjs/core'
import { SurvivorInterface, UpdateLocationInterface } from '../interfaces/survivor_interface.ts'
import Survivor from '../models/survivors.ts'
import ItemsService from './items_service.ts'
import { ItemMessages } from '../messages/item_message.ts'

@inject()
export default class SurvivorsService {
  constructor(protected itemsService: ItemsService) {}

  async create(payload: SurvivorInterface) {
    // add transactions

    const hasUniqueItems = await this.itemsService.hasUniqueItems(payload.items)

    if (!hasUniqueItems) {
      throw new Error('Duplicated items not allowed')
    }

    const isSubset = await this.itemsService.validateItems(payload.items)

    if (!isSubset) {
      throw new Error(ItemMessages.ITEM_NOT_VALID)
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

  async reportContamination(id: number) {
    const survivor = await Survivor.findByOrFail({ id: id })

    const maxReportsCount = 5

    if (survivor.infectedFlagCount < maxReportsCount) {
      const count = survivor.infectedFlagCount + 1

      survivor.merge({ infectedFlagCount: count }).save()

      if (count >= maxReportsCount) {
        survivor.merge({ isInfected: true }).save()
      }
    }
  }

  async kill() {}

  async loot() {}
}
