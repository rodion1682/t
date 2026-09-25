import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

import { useCartStore } from './cart'
import { usePromoCodeStore } from './promocode'
import { useUserStore } from './user'

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    isLoading: false,

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
        this.isLoading = true
        this.error = null

        const { data } = await axios.get('/purchase/history')

        if (data?.status === 'OK') {
          this.purchaseHistory = data.payload || []
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message || 'Failed to fetch purchase history'
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
