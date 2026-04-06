export type ETableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'UNAVAILABLE'

export type ETableShape = 'RECT' | 'CIRCLE' | 'SQUARE'

export interface Table {
  id: string
  name: string
  status: ETableStatus
  capacity: number
  shape: ETableShape
  areaId?: number
  areaName?: string
  floorId?: number
  floorName?: string
}
