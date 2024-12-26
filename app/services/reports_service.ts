import { inject } from '@adonisjs/core'
import ItemPoints from '../models/items_points.ts'
import Survivor from '../models/survivors.ts'
import TradeService from './trades_service.ts'

@inject()
export default class ReportsService {
  constructor(protected tradeService: TradeService) {}

  async percentageInfectedSurvivors() {
    const allSurvivors = await Survivor.all()

    let totalCount = 0
    let infectedCount = 0

    allSurvivors.forEach((survivor) => {
      totalCount++

      if (survivor.isInfected === true) {
        infectedCount++
      }
    })

    const infectedSurvivorsPercentage = (100 * infectedCount) / totalCount
    return `Infected survivors percentage is ${infectedSurvivorsPercentage}`
  }

  async percentageNonInfectedSurvivors() {
    const allSurvivors = await Survivor.all()

    let totalCount = 0
    let nonInfectedCount = 0

    allSurvivors.forEach((survivor) => {
      totalCount++

      if (survivor.isInfected === false) {
        nonInfectedCount++
      }
    })

    const nonInfectedSurvivorsPercentage = (100 * nonInfectedCount) / totalCount
    return `Not infected survivors percentage is ${nonInfectedSurvivorsPercentage}`
  }

  async averageResourcesPerSurvivor() {
    const allSurvivors = await Survivor.query().preload('items')

    // Sum up all resources
    const totalResources = allSurvivors.reduce(
      (acc, survivor) => {
        survivor.items.forEach((item) => {
          acc[item.name] = (acc[item.name] || 0) + item.quantity
        })
        return acc
      },
      {} as Record<string, number>
    )

    // Calculate averages
    const averages: Record<string, number> = {}
    Object.entries(totalResources).forEach(([itemName, total]) => {
      // Round to 2 decimal places
      averages[itemName] = Number((total / allSurvivors.length).toFixed(2))
    })

    return `Average amount of resources per survivor is: ${JSON.stringify(averages, null, 2)}`
  }

  async infectedSurvivorLostPoints() {
    const infected = await Survivor.query().preload('items').where('isInfected', 'true')

    if (!infected.length) {
      return `No infected survivors was found. Total points lost is: 0`
    }

    const itemsPoints = await ItemPoints.all()

    const itemPointMap = new Map(itemsPoints.map((item) => [item.name, item.points]))

    const pointsPerSurvivor = infected.map((survivor) => {
      return this.tradeService.calculateTotalPoints(survivor.items, itemPointMap)
    })

    const total = pointsPerSurvivor.reduce((totalCount, points) => {
      totalCount += points
      return totalCount
    })

    return `Total points lost because of infected survivors is: ${total}`
  }
}
