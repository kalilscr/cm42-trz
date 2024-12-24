import type { HttpContext } from '@adonisjs/core/http'
import TradeService from '../services/trades_service.ts'
import { inject } from '@adonisjs/core'
import { createTradeValidator } from '../validators/trade_validator.ts'

@inject()
export default class TradeController {
  constructor(protected tradeService: TradeService) {}

  async performTrade({ request }: HttpContext) {
    const data = await request.validateUsing(createTradeValidator)
    await this.tradeService.performTrade(
      data.senderId,
      data.receiverId,
      data.senderItems,
      data.receiverItems
    )
  }
}
