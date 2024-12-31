import { test } from '@japa/runner'
import SurvivorsService from '../../app/services/survivors_service.ts'
import ItemsService from '../../app/services/items_service.ts'
import Survivor from '../../app/models/survivors.ts'
import { ItemMessages } from '../../app/messages/item_message.ts'
import { UpdateLocationInterface } from '../../app/interfaces/survivor_interface.ts'

test.group('Survivor Service - Create', (group) => {
  // group.beforeEach(() => {
  //   // Setup before each test, if needed
  // })

  test('should create a survivor with unique items', async ({ assert }) => {
    const payload = {
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      lastLocation: { latitude: '10.1234', longitude: '-10.1234' },
      items: [
        {
          name: 'FIJI_WATER',
          quantity: 15,
        },
        {
          name: 'CAMPBELL_SOUP',
          quantity: 7,
        },
      ],
    }

    const itemService = new ItemsService()
    const survivorService = new SurvivorsService(itemService)

    // Mock the methods
    itemService.hasUniqueItems = async () => true
    itemService.validateItems = async () => true
    Survivor.findBy = async () => null
    Survivor.create = async (data: any) => data
    itemService.add = async () => {}

    await survivorService.create(payload)
    assert.isEmpty({})
  })

  test('should throw error for duplicated items', async ({ assert }) => {
    const payload = {
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      lastLocation: { latitude: '10.1234', longitude: '-10.1234' },
      items: [
        {
          name: 'fiji_water',
          quantity: 15,
        },
        {
          name: 'campbell soup',
          quantity: 7,
        },
      ],
    }

    const itemService = new ItemsService()
    const survivorService = new SurvivorsService(itemService)

    itemService.hasUniqueItems = async () => false

    await assert.rejects(() => survivorService.create(payload), 'Duplicated items not allowed')
  })

  test('should throw error if items are not valid', async ({ assert }) => {
    const payload = {
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      lastLocation: { latitude: '10.1234', longitude: '-10.1234' },
      items: [
        {
          name: 'fiji_water',
          quantity: 15,
        },
        {
          name: 'invalid_item',
          quantity: 7,
        },
      ],
    }

    const itemService = new ItemsService()
    const survivorService = new SurvivorsService(itemService)

    itemService.hasUniqueItems = async () => true
    itemService.validateItems = async () => false

    await assert.rejects(() => survivorService.create(payload), ItemMessages.ITEM_NOT_VALID)
  })

  test('should throw error if survivor already exists', async ({ assert }) => {
    const payload = {
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      lastLocation: { latitude: '10.1234', longitude: '-10.1234' },
      items: [
        {
          name: 'fiji_water',
          quantity: 15,
        },
        {
          name: 'campbell soup',
          quantity: 7,
        },
      ],
    }

    const itemService = new ItemsService()
    const survivorService = new SurvivorsService(itemService)

    itemService.hasUniqueItems = async () => true
    itemService.validateItems = async () => true
    Survivor.findBy = async () => payload

    await assert.rejects(() => survivorService.create(payload), 'survivor already exists')
  })
})

test.group('Survivor Service - Update Location', (group) => {
  let survivorService: SurvivorsService
  let itemService = new ItemsService()

  group.each.setup(() => {
    survivorService = new SurvivorsService(itemService)
  })

  test('updateLocation - should update survivor location', async ({ assert }) => {
    // Arrange
    const name = 'John Doe'
    const lastLocation: UpdateLocationInterface = {
      latitude: '40.7128',
      longitude: '-74.006',
    }

    const survivor = new Survivor()
    survivor.name = name
    survivor.lastLocation = { latitude: '0', longitude: '0' }

    let savedLocation: UpdateLocationInterface | null = null
    survivor.merge = function (data) {
      Object.assign(this, data)
      return this
    }
    survivor.save = async function () {
      savedLocation = this.lastLocation
      return this
    }

    Survivor.findByOrFail = async () => survivor

    // Act
    await survivorService.updateLocation(name, lastLocation)

    // Assert
    assert.deepEqual(savedLocation, lastLocation)
  })

  test('updateLocation - should throw error if survivor not found', async ({ assert }) => {
    // Arrange
    const name = 'Nonexistent'
    const lastLocation: UpdateLocationInterface = {
      latitude: '40.7128',
      longitude: '-74.0060',
    }

    Survivor.findByOrFail = async () => {
      throw new Error('Survivor not found')
    }

    // Act & Assert
    await assert.rejects(
      async () => await survivorService.updateLocation(name, lastLocation),
      'Survivor not found'
    )
  })
})

test.group('Survivor Service - Report Contamination', (group) => {
  let survivorService: SurvivorsService
  let itemService = new ItemsService()

  group.each.setup(() => {
    survivorService = new SurvivorsService(itemService)
  })
  test('reportContamination - should increment infection flag count', async ({ assert }) => {
    // Arrange
    const id = 1
    const survivor = new Survivor()
    survivor.id = id
    survivor.infectedFlagCount = 2
    survivor.isInfected = false

    let savedCount: number | null = null
    let savedInfectedStatus: boolean | null = null
    survivor.merge = function (data) {
      Object.assign(this, data)
      return this
    }
    survivor.save = async function () {
      savedCount = this.infectedFlagCount
      savedInfectedStatus = this.isInfected
      return this
    }

    Survivor.findByOrFail = async () => survivor

    // Act
    await survivorService.reportContamination(id)

    // Assert
    assert.equal(savedCount, 3)
    assert.isFalse(savedInfectedStatus)
  })

  test('reportContamination - should mark survivor as infected after 5 reports', async ({
    assert,
  }) => {
    // Arrange
    const id = 1
    const survivor = new Survivor()
    survivor.id = id
    survivor.infectedFlagCount = 4
    survivor.isInfected = false

    let savedCount: number | null = null
    let savedInfectedStatus: boolean | null = null
    survivor.merge = function (data) {
      Object.assign(this, data)
      return this
    }
    survivor.save = async function () {
      savedCount = this.infectedFlagCount
      savedInfectedStatus = this.isInfected
      return this
    }

    Survivor.findByOrFail = async () => survivor

    // Act
    await survivorService.reportContamination(id)

    // Assert
    assert.equal(savedCount, 5)
    assert.isTrue(savedInfectedStatus)
  })

  test('reportContamination - should not increment count beyond 5', async ({ assert }) => {
    // Arrange
    const id = 1
    const survivor = new Survivor()
    survivor.id = id
    survivor.infectedFlagCount = 5
    survivor.isInfected = true

    let savedCount: number | null = null
    survivor.merge = function (data) {
      Object.assign(this, data)
      return this
    }
    survivor.save = async function () {
      savedCount = this.infectedFlagCount
      return this
    }

    Survivor.findByOrFail = async () => survivor

    // Act
    await survivorService.reportContamination(id)

    // Assert
    assert.equal(savedCount, null) // save should not have been called
    assert.equal(survivor.infectedFlagCount, 5)
  })

  test('reportContamination - should throw error if survivor not found', async ({ assert }) => {
    // Arrange
    const id = 999

    Survivor.findByOrFail = async () => {
      throw new Error('Survivor not found')
    }

    // Act & Assert
    await assert.rejects(
      async () => await survivorService.reportContamination(id),
      'Survivor not found'
    )
  })
})
