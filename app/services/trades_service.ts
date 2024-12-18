import db from '@adonisjs/lucid/services/db'
import { ItemInterface } from '../interfaces/item_interface.ts'
import ItemsService from './items_service.ts'
import { ItemMessages } from '../messages/item_message.ts'
import ItemPoints from '../models/items_points.ts'
import Item from '../models/items.ts'
import { inject } from '@adonisjs/core'

@inject()
export default class TradeService {
  constructor(protected itemsService: ItemsService) {}

  async performTrade(
    senderId: number,
    receiverId: number,
    senderItems: ItemInterface[],
    receiverItems: ItemInterface[]
  ) {
    const trx = await db.transaction()

    const isValidTrade = await this.validateTradeItemsPoints(senderItems, receiverItems)

    if (!isValidTrade) {
      throw new Error('Invalid trade, both trade sides should have the same amount of points')
    }

    const checkSenderInventoryAvailability = await this.checkInventoryAvailability(
      senderId,
      senderItems
    )

    if (!checkSenderInventoryAvailability) {
      throw new Error(`Survivor with id ${senderId}, inventory is insufficient`)
    }

    const checkReceiverInventoryAvailability = await this.checkInventoryAvailability(
      receiverId,
      receiverItems
    )

    if (!checkReceiverInventoryAvailability) {
      throw new Error(`Survivor with id ${receiverId}, inventory is insufficient`)
    }

    await this.updateInventory(senderId, senderItems, receiverItems)
    await this.updateInventory(receiverId, receiverItems, senderItems)
    // const trade1 = senderItems.map((item) => ({
    //   ...item,
    //   survivorId: receiverId,
    // }))

    // const trade2 = receiverItems.map((item) => ({
    //   ...item,
    //   survivorId: senderId,
    // }))

    await trx.commit()
    try {
    } catch (error) {
      await trx.rollback()
    }
  }

  async validateTradeItemsPoints(senderItems: ItemInterface[], receiverItems: ItemInterface[]) {
    const isSenderItemsValid = await this.itemsService.validateItems(senderItems)

    if (!isSenderItemsValid) {
      throw new Error(ItemMessages.ITEM_NOT_VALID)
    }

    const isReceiverItemsValid = await this.itemsService.validateItems(receiverItems)

    if (!isReceiverItemsValid) {
      throw new Error(ItemMessages.ITEM_NOT_VALID)
    }

    const itemsPoints = await ItemPoints.all()

    // lookup collection for item points
    const itemPointDictionaryMap = new Map(itemsPoints.map((item) => [item.name, item.points]))

    const senderTotalPoints = this.calculateTotalPoints(senderItems, itemPointDictionaryMap)
    const receiverTotalPoints = this.calculateTotalPoints(receiverItems, itemPointDictionaryMap)

    return senderTotalPoints === receiverTotalPoints
  }

  async checkInventoryAvailability(survivorId: number, survivorItemsRequest: ItemInterface[]) {
    const survivorInventory = await Item.findManyBy({ survivor_id: survivorId })

    const survivorInventoryMap = new Map(
      survivorInventory.map((item) => [item.name, item.quantity])
    )

    // Check if every requested item can be fulfilled
    return survivorItemsRequest.every((requestedItem) => {
      const availableQuantity = survivorInventoryMap.get(requestedItem.name) || 0
      return availableQuantity >= requestedItem.quantity
    })
  }

  async updateInventory(
    survivorId: number,
    itemsToRemove: ItemInterface[],
    itemsToAdd: ItemInterface[]
  ) {
    const survivorInventory = await Item.findManyBy({ survivor_id: survivorId })

    const updatedInventory = survivorInventory.map((item) => {
      return { name: item.name, quantity: item.quantity }
    })
    console.log(updatedInventory)

    // remove traded items
    itemsToRemove.forEach((tradeItem) => {
      const existingItemIndex = updatedInventory.findIndex((item) => item.name === tradeItem.name)

      if (existingItemIndex !== -1) {
        updatedInventory[existingItemIndex].quantity -= tradeItem.quantity

        // //remove item if quantity reaches 0
        // if (updatedInventory[existingItemIndex].quantity <= 0) {
        //   updatedInventory.splice(existingItemIndex, 1)
        // }
      }
    })
    console.log(updatedInventory)

    // add received items
    itemsToAdd.forEach((receivedItem) => {
      const existingItemIndex = updatedInventory.findIndex(
        (item) => item.name === receivedItem.name
      )

      if (existingItemIndex !== -1) {
        // update existing item quantity
        updatedInventory[existingItemIndex].quantity += receivedItem.quantity
      } else {
        // Add new item to inventory
        updatedInventory.push({ ...receivedItem })
      }

      return updatedInventory
    })
    console.log(updatedInventory)

    // name: itemName
    // await Item.query().where({ survivor_id: survivorId }).update({
    //   updatedInventory,
    // })
    const trade = updatedInventory.map((item) => ({
      ...item,
      survivorId: survivorId,
    }))
    console.log(trade)
    await Item.updateOrCreateMany(['survivorId', 'name'], trade)
  }

  // async updateReceiverInventory(
  //   receiverId: number,
  //   receiverItems: ItemInterface[],
  //   senderItems: ItemInterface[]
  // ) {}

  calculateTotalPoints(items: ItemInterface[], itemPointMap: Map<string, number>) {
    const total = items.reduce((totalPoints, item) => {
      const itemPoint = itemPointMap.get(item.name) || 0
      return totalPoints + itemPoint * item.quantity
    }, 0)

    return total
  }

  async validateSurvivors() {}
}

// await validate_trade(sender_items, receiver_items)

//         # Verify both parties have items before transfer
//         await check_inventory_availability(sender, sender_items)
//         await check_inventory_availability(receiver, receiver_items)

//         # Simultaneous inventory update
//         await update_sender_inventory(sender, sender_items, receiver_items)
//         await update_receiver_inventory(receiver, receiver_items, sender_items)
