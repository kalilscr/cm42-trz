import { test } from '@japa/runner'
import TradeService from '../../app/services/trades_service.ts'
import ItemService from '../../app/services/items_service.ts'
import Item from '../../app/models/items.ts'
import ItemPoints from '../../app/models/items_points.ts'
import { ItemInterface } from '../../app/interfaces/item_interface.ts'
import { ItemMessages } from '../../app/messages/item_message.ts'
import db from '@adonisjs/lucid/services/db'

test.group('TradeService', (group) => {
  let tradeService: TradeService
  let itemService: ItemService

  group.each.setup(() => {
    itemService = new ItemService()
    tradeService = new TradeService(itemService)
  })

  test('performTrade - should successfully trade items between survivors', async ({ assert }) => {
    // Arrange
    const senderId = 1
    const receiverId = 2
    const senderItems: ItemInterface[] = [{ name: 'Fiji Water', quantity: 2 }]
    const receiverItems: ItemInterface[] = [{ name: 'Campbell Soup', quantity: 3 }]

    // Mock transaction
    db.transaction = async () =>
      ({
        commit: async () => {},
        rollback: async () => {},
      }) as any

    // Mock validateTradeItemsPoints
    tradeService.validateTradeItemsPoints = async () => true

    // Mock checkInventoryAvailability
    tradeService.checkInventoryAvailability = async () => true

    // Mock updateInventory
    let updateInventoryCalls: any[] = []
    tradeService.updateInventory = async (id, remove, add) => {
      updateInventoryCalls.push({ id, remove, add })
    }

    // Act
    await tradeService.performTrade(senderId, receiverId, senderItems, receiverItems)

    // Assert
    assert.equal(updateInventoryCalls.length, 2)
    assert.deepEqual(updateInventoryCalls[0], {
      id: senderId,
      remove: senderItems,
      add: receiverItems,
    })
    assert.deepEqual(updateInventoryCalls[1], {
      id: receiverId,
      remove: receiverItems,
      add: senderItems,
    })
  })

  test('performTrade - should throw error for invalid trade points', async ({ assert }) => {
    // Arrange
    const senderId = 1
    const receiverId = 2
    const senderItems: ItemInterface[] = [{ name: 'Fiji Water', quantity: 2 }]
    const receiverItems: ItemInterface[] = [{ name: 'Campbell Soup', quantity: 1 }]

    tradeService.validateTradeItemsPoints = async () => false

    // Act & Assert
    await assert.rejects(
      async () => await tradeService.performTrade(senderId, receiverId, senderItems, receiverItems),
      'Invalid trade, both trade sides should have the same amount of points'
    )
  })

  test('validateTradeItemsPoints - should validate items points correctly', async ({ assert }) => {
    // Arrange
    const senderItems: ItemInterface[] = [{ name: 'Fiji Water', quantity: 1 }]
    const receiverItems: ItemInterface[] = [{ name: 'Campbell Soup', quantity: 2 }]

    // Mock itemsService.validateItems
    itemService.validateItems = async () => true

    // Mock ItemPoints.all
    const itemPoints = [
      { name: 'Fiji Water', points: 14 },
      { name: 'Campbell Soup', points: 7 },
    ].map((item) => {
      const itemPoint = new ItemPoints()
      Object.assign(itemPoint, item)
      return itemPoint
    })
    ItemPoints.all = async () => itemPoints as any

    // Act
    const result = await tradeService.validateTradeItemsPoints(senderItems, receiverItems)

    // Assert
    assert.isTrue(result)
  })

  test('validateTradeItemsPoints - should throw error for invalid items', async ({ assert }) => {
    // Arrange
    const senderItems: ItemInterface[] = [{ name: 'Invalid Item', quantity: 1 }]
    const receiverItems: ItemInterface[] = [{ name: 'Campbell Soup', quantity: 1 }]

    itemService.validateItems = async () => false

    // Act & Assert
    await assert.rejects(
      async () => await tradeService.validateTradeItemsPoints(senderItems, receiverItems),
      ItemMessages.ITEM_NOT_VALID
    )
  })

  test('checkInventoryAvailability - should return true for available inventory', async ({
    assert,
  }) => {
    // Arrange
    const survivorId = 1
    const requestedItems: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Campbell Soup', quantity: 1 },
    ]

    const inventory = [
      { name: 'Fiji Water', quantity: 3, survivor_id: survivorId },
      { name: 'Campbell Soup', quantity: 2, survivor_id: survivorId },
    ].map((item) => {
      const inventoryItem = new Item()
      Object.assign(inventoryItem, item)
      return inventoryItem
    })

    Item.findManyBy = async () => inventory

    // Act
    const result = await tradeService.checkInventoryAvailability(survivorId, requestedItems)

    // Assert
    assert.isTrue(result)
  })

  test('checkInventoryAvailability - should return false for insufficient inventory', async ({
    assert,
  }) => {
    // Arrange
    const survivorId = 1
    const requestedItems: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 5 }, // More than available
      { name: 'Campbell Soup', quantity: 1 },
    ]

    const inventory = [
      { name: 'Fiji Water', quantity: 3, survivor_id: survivorId },
      { name: 'Campbell Soup', quantity: 2, survivor_id: survivorId },
    ].map((item) => {
      const inventoryItem = new Item()
      Object.assign(inventoryItem, item)
      return inventoryItem
    })

    Item.findManyBy = async () => inventory

    // Act
    const result = await tradeService.checkInventoryAvailability(survivorId, requestedItems)

    // Assert
    assert.isFalse(result)
  })

  test('updateInventory - should correctly update inventory after trade', async ({ assert }) => {
    // Arrange
    const survivorId = 1
    const itemsToRemove: ItemInterface[] = [{ name: 'Fiji Water', quantity: 2 }]
    const itemsToAdd: ItemInterface[] = [{ name: 'Campbell Soup', quantity: 3 }]

    const currentInventory = [
      { name: 'Fiji Water', quantity: 5, survivor_id: survivorId },
      { name: 'Campbell Soup', quantity: 1, survivor_id: survivorId },
    ].map((item) => {
      const inventoryItem = new Item()
      Object.assign(inventoryItem, item)
      return inventoryItem
    })

    let updatedItems: any[] = []
    Item.findManyBy = async () => currentInventory
    Item.updateOrCreateMany = async (_keys: any[], items: any[]) => {
      updatedItems = items
      return items
    }

    // Act
    await tradeService.updateInventory(survivorId, itemsToRemove, itemsToAdd)

    // Assert
    const expectedFijiWaterQuantity = 3 // 5 - 2
    const expectedCampbellSoupQuantity = 4 // 1 + 3

    const updatedFijiWater = updatedItems.find((item) => item.name === 'Fiji Water')
    const updatedCampbellSoup = updatedItems.find((item) => item.name === 'Campbell Soup')

    assert.equal(updatedFijiWater.quantity, expectedFijiWaterQuantity)
    assert.equal(updatedCampbellSoup.quantity, expectedCampbellSoupQuantity)
  })

  test('calculateTotalPoints - should calculate points correctly', ({ assert }) => {
    // Arrange
    const items: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Campbell Soup', quantity: 3 },
    ]

    const itemPointMap = new Map([
      ['Fiji Water', 14],
      ['Campbell Soup', 7],
    ])

    // Act
    const result = tradeService.calculateTotalPoints(items, itemPointMap)

    // Assert
    const expected = 2 * 14 + 3 * 7 // 49
    assert.equal(result, expected)
  })
})
