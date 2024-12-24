import { inject } from '@adonisjs/core'
import ReportsService from '../services/reports_service.ts'

@inject()
export default class ReportsController {
  constructor(protected reportsService: ReportsService) {}

  async getInfectedSurvivors() {
    return await this.reportsService.percentageInfectedSurvivors()
  }

  async getNonInfectedSurvivors() {
    return await this.reportsService.percentageNonInfectedSurvivors()
  }

  async getAverageResourcesPerSurvivor() {
    return await this.reportsService.averageResourcesPerSurvivor()
  }

  async getLostPoints() {
    return await this.reportsService.infectedSurvivorLostPoints()
  }
}
