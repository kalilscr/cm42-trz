import Survivor from '../models/survivors.ts'

export default class ReportsService {
  constructor() {}

  async percentageInfectedSurvivors() {
    //const infected = await Survivor.findManyBy({ isInfected: true })
    // const infected: number = await db.rawQuery(
    //   'SELECT COUNT (is_infected) FROM survivors WHERE is_infected = true'
    // )

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
    return infectedSurvivorsPercentage //.toFixed(2)
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
    return nonInfectedSurvivorsPercentage
  }

  async averageResourcesBySurvivor() {}

  async infectedSurvivorLostPoints() {}
}
