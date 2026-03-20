import { create } from 'zustand'
import type { Favorite } from '@/types/favorite.type'
import favoritesApi from '@/apis/favorites.api'

interface FavoriteState {
  favorites: Favorite[]
  isLoading: boolean
  fetchFavorites: () => Promise<void>
  addFavoriteItem: (itemId: number) => Promise<void>
  removeFavoriteItem: (itemId: number) => Promise<void>
  addFavoriteCombo: (comboId: number) => Promise<void>
  removeFavoriteCombo: (comboId: number) => Promise<void>
  isFavoriteItem: (itemId: number) => boolean
  isFavoriteCombo: (comboId: number) => boolean
  clearFavorites: () => void
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true })
    try {
      const response = await favoritesApi.getMyFavorites()
      set({ favorites: response.data.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      set({ isLoading: false })
    }
  },

  addFavoriteItem: async (itemId: number) => {
    try {
      await favoritesApi.addFavoriteItem(itemId)
      await get().fetchFavorites()
    } catch (error) {
      console.error('Failed to add favorite item:', error)
    }
  },

  removeFavoriteItem: async (itemId: number) => {
    try {
      await favoritesApi.removeFavoriteItem(itemId)
      await get().fetchFavorites()
    } catch (error) {
      console.error('Failed to remove favorite item:', error)
    }
  },

  addFavoriteCombo: async (comboId: number) => {
    try {
      await favoritesApi.addFavoriteCombo(comboId)
      await get().fetchFavorites()
    } catch (error) {
      console.error('Failed to add favorite combo:', error)
    }
  },

  removeFavoriteCombo: async (comboId: number) => {
    try {
      await favoritesApi.removeFavoriteCombo(comboId)
      await get().fetchFavorites()
    } catch (error) {
      console.error('Failed to remove favorite combo:', error)
    }
  },

  isFavoriteItem: (itemId: number) => {
    return get().favorites.some((f) => f.item?.id === itemId)
  },

  isFavoriteCombo: (comboId: number) => {
    return get().favorites.some((f) => f.combo?.id === comboId)
  },

  clearFavorites: () => {
    set({ favorites: [] })
  }
}))
