import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

import { useCartStore } from './cart'
import { usePromoCodeStore } from './promocode'
import { useUserStore } from './user'

const normalizeTimestamp = value => {
  const timestamp = Number(value ?? 0)

  if (!timestamp) {
    return 0
  }

  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
}

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    isLoading: false,
    isHistoryLoading: false,
    error: null,
    purchaseHistory: [],
    currentPurchase: null,
  }),

  actions: {
    async purchaseCartItems(purchaseData = {}) {
      const cartStore = useCartStore()
      const promoCodeStore = usePromoCodeStore()

      try {
        this.isLoading = true
        this.error = null

        const itemIds = cartStore.cartItemIds

        const payload = {
          ...purchaseData,
          itemIds,
          promocode:
            purchaseData.promocode ?? promoCodeStore.currentPromo?.code ?? null,
        }

        const { data } = await axios.post('/purchase/product', payload)

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Purchase failed')
        }

        this.currentPurchase = data

        if (!data.redirect_url) {
          const userStore = useUserStore()

          await Promise.all([
            userStore.fetchProfile(),
            cartStore.fetchCartContent(),
          ])
        }

        return {
          success: true,
          ...data,
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Purchase failed'

        this.error = message

        return {
          success: false,
          error: message,
          status: error?.response?.status,
          data: error?.response?.data,
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchPurchaseHistory() {
      try {
        this.isHistoryLoading = true
        this.error = null

        const { data } = await axios.get('/purchase/history')

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Failed to fetch purchase history')
        }

        const payload = Array.isArray(data?.payload) ? data.payload : []

        this.purchaseHistory = payload.map((purchase, index) => ({
          ...purchase,

          _key:
            purchase?._key ||
            `purchase-${purchase?.id ?? purchase?.item_id ?? index}`,

          createdAt: normalizeTimestamp(
            purchase?.created_at ?? purchase?.date_time,
          ),

          imageUrl: purchase?.img_url || purchase?.image_url || '',
        }))

        return this.purchaseHistory
      } catch (error) {
        this.purchaseHistory = []

        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch purchase history'

        throw error
      } finally {
        this.isHistoryLoading = false
      }
    },

    clearPurchaseHistory() {
      this.purchaseHistory = []
    },

    clearError() {
      this.error = null
    },
  },
})
