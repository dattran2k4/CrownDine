import type { Combo } from './combo.type'
import type { Item } from './item.type'

export interface Favorite {
  id: number
  item?: Item
  combo?: Combo
}

export interface FavoriteListResponse {
  status: number
  message: string
  data: Favorite[]
}
