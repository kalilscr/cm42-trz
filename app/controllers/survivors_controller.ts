import type { HttpContext } from '@adonisjs/core/http'
import {
  createSurvivorValidator,
  updateLocationValidator,
} from '../validators/survivor_validator.ts'
import SurvivorsService from '../services/survivors_service.ts'
import { inject } from '@adonisjs/core'

@inject()
export default class SurvivorsController {
  constructor(protected survivorsService: SurvivorsService) {}

  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createSurvivorValidator)

    return await this.survivorsService.create(payload)
  }

  async updateLocation({ params, request }: HttpContext) {
    const lastLocation = await request.validateUsing(updateLocationValidator)
    console.log(params)

    await this.survivorsService.updateLocation(String(params), lastLocation)
  }

  async reportContamination({ request }: HttpContext) {
    const headers = request.headers()

    await this.survivorsService.reportContamination(Number(headers.id))
  }
}
