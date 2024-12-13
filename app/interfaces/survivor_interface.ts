import { ItemInterface } from './item_interface.ts'

export interface SurvivorInterface {
  name: string
  age: number
  gender: string
  lastLocation: {
    latitude: string
    longitude: string
  }
  items: ItemInterface[]
}

export interface UpdateLocationInterface {
  latitude: string
  longitude: string
}
