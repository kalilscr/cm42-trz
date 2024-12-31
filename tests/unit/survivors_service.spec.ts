import { test } from '@japa/runner'
import SurvivorsService from '../../app/services/survivors_service.ts'
import ItemsService from '../../app/services/items_service.ts'
import Survivor from '../../app/models/survivors.ts'
import { ItemMessages } from '../../app/messages/item_message.ts'

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

    // Mock the methods
    itemService.hasUniqueItems = async () => true
    itemService.validateItems = async () => true
    Survivor.findBy = async () => null
    Survivor.create = async (data) => data
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

    Survivor.findBy = async () => payload

    await assert.rejects(() => survivorService.create(payload), 'survivor already exists')
  })
})

test.group('Survivor Service - Update Location', (group) => {
  // group.beforeEach(() => {
  //   // Setup before each test, if needed
  // })

  test('should update the last location of the survivor', async ({ assert }) => {
    const survivor = {
      name: 'John Doe',
      lastLocation: { latitude: '10.1234', longitude: '-10.1234' },
      save: async function () {
        /* mock save */
        {
        }
      },
      merge: function (data) {
        this.lastLocation = data.lastLocation
      },
    }

    Survivor.findByOrFail = async () => survivor

    const survivorService = new SurvivorsService(new ItemsService())
    const newLocation = { latitude: '20.5678', longitude: '-20.5678' }

    await survivorService.updateLocation('John Doe', newLocation)
    assert.deepEqual(survivor.lastLocation, newLocation)
  })
})

test.group('Survivor Service - Report Contamination', (group) => {
  // group.beforeEach(() => {
  //   // Setup before each test, if needed
  // })

  test('should increase the infectedFlagCount and mark as infected if over limit', async ({
    assert,
  }) => {
    const survivor = {
      id: 1,
      infectedFlagCount: 3,
      isInfected: false,
      save: async function () {
        /* mock save */
      },
      merge: function (data) {
        if (data.infectedFlagCount) this.infectedFlagCount = data.infectedFlagCount
        if (data.isInfected !== undefined) this.isInfected = data.isInfected
      },
    }

    Survivor.findByOrFail = async () => survivor

    const survivorService = new SurvivorsService(new ItemsService())
    await survivorService.reportContamination(1)

    assert.equal(survivor.infectedFlagCount, 4)
    assert.equal(survivor.isInfected, false)

    // Simulate another report
    await survivorService.reportContamination(1)
    assert.equal(survivor.infectedFlagCount, 5)
    assert.equal(survivor.isInfected, true)
  })
})
