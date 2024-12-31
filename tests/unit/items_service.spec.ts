import { test } from '@japa/runner'
import ItemService from '../../app/services/items_service.ts'
import Survivor from '../../app/models/survivors.ts'
import Item from '../../app/models/items.ts'
import ItemPoints from '../../app/models/items_points.ts'
import { ItemInterface } from '../../app/interfaces/item_interface.ts'

test.group('ItemService', (group) => {
  let itemService: ItemService

  group.each.setup(() => {
    itemService = new ItemService()
  })

  test('add - should add items to survivor inventory', async ({ assert }) => {
    const survivorId = 1
    const items: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Campbell Soup', quantity: 3 },
    ]

    const survivor = new Survivor()
    survivor.id = survivorId
    survivor.canAddItems = true

    survivor.merge = function () {
      return this
    }
    survivor.save = async () => survivor

    // Mock Item.createMany instead of spying
    let createManyWasCalled = false
    Item.createMany = async (manyItems) => {
      createManyWasCalled = true
      return manyItems as any
    }

    // Mock Survivor.findByOrFail
    Survivor.findByOrFail = async () => survivor

    await itemService.add(survivorId, items)

    assert.isTrue(createManyWasCalled)
    assert.isTrue(survivor.canAddItems)
  })

  test('add - should throw error if survivor cannot add items', async ({ assert }) => {
    const survivorId = 1
    const items: ItemInterface[] = [{ name: 'Fiji Water', quantity: 2 }]

    const survivor = new Survivor()
    survivor.id = survivorId
    survivor.canAddItems = false

    Survivor.findByOrFail = async () => survivor

    await assert.rejects(
      async () => await itemService.add(survivorId, items),
      'cant add new items, only trade allowed'
    )
  })

  // ... other tests ...

  test('validateItems - should return true for valid items', async ({ assert }) => {
    const itemsToValidate = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Campbell Soup', quantity: 3 },
    ]

    const itemPoints = [
      { name: 'Fiji Water', points: 14 },
      { name: 'Campbell Soup', points: 12 },
      { name: 'First Aid Pouch', points: 10 },
    ].map((item) => {
      const itemPoint = new ItemPoints()
      Object.assign(itemPoint, item)
      return itemPoint
    })

    ItemPoints.all = async () => itemPoints as any

    const result = await itemService.validateItems(itemsToValidate)
    assert.isTrue(result)
  })

  test('validateItems - should return false for invalid items', async ({ assert }) => {
    const itemsToValidate = [
      { name: 'Invalid Item', quantity: 2 },
      { name: 'Campbell Soup', quantity: 3 },
    ]

    const itemPoints = [
      { name: 'Fiji Water', points: 14 },
      { name: 'Campbell Soup', points: 12 },
    ].map((item) => {
      const itemPoint = new ItemPoints()
      Object.assign(itemPoint, item)
      return itemPoint
    })

    ItemPoints.all = async () => itemPoints as any

    const result = await itemService.validateItems(itemsToValidate)
    assert.isFalse(result)
  })

  test('hasUniqueItems - should return true for unique items', async ({ assert }) => {
    // Arrange
    const items: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Campbell Soup', quantity: 3 },
    ]

    // Act
    const result = await itemService.hasUniqueItems(items)

    // Assert
    assert.isTrue(result)
  })

  test('hasUniqueItems - should return false for duplicate items', async ({ assert }) => {
    // Arrange
    const items: ItemInterface[] = [
      { name: 'Fiji Water', quantity: 2 },
      { name: 'Fiji Water', quantity: 3 },
    ]

    // Act
    const result = await itemService.hasUniqueItems(items)

    // Assert
    assert.isFalse(result)
  })
})
