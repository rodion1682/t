// stores/purchase.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { usePromoCodeStore } from './promocode'
import { useUserStore } from './user'

const clampQty = v => Math.max(1, Number(v || 1))

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    isLoading: false,
    error: null,
    purchaseHistory: [],
    currentPurchase: null,
  }),

  actions: {
    /**
     * purchaseData: your form fields (name, phone, paymentMethod etc)
     * We will ALSO attach `cart` with quantities.
     */
    async purchaseCartItems(purchaseData) {
      const promoCodeStore = usePromoCodeStore()
      const cartStore = useCartStore()

      try {
        this.isLoading = true
        this.error = null

        //  Force-sync DB cart quantities before purchase
        for (const row of cartStore.items || []) {
          const qty = clampQty(cartStore.getQty(row.item_id, row.count ?? 1))
          const res = await cartStore.updateQuantity(row.item_id, qty)
          if (!res?.success) {
            throw new Error(res?.error || 'Failed to sync cart quantities')
          }
        }

        //  Build payload (might be ignored by backend, but keep it)
        const cartPayload = (cartStore.items || []).map(row => {
          const qty = clampQty(cartStore.getQty(row.item_id, row.count ?? 1))
          return {
            item_id: row.item_id,
            product_id: row.product_id ?? row.item_id,
            qty,
            quantity: qty,
            count: qty,
            price: row.item?.price ?? row.price,
          }
        })

        const response = await axios.post('/purchase/product', {
          ...purchaseData,
          promocode: promoCodeStore.currentPromo?.code || null,
          cart: cartPayload,
        })

        if (response?.data?.status === 'OK') {
          if (!response.data.redirect_url) {
            const userStore = useUserStore()
            await Promise.all([
              userStore.fetchProfile(),
              cartStore.fetchCartContent(),
            ])
          }

          return {
            success: true,
            balance: response.data.balance,
            redirect_url: response.data.redirect_url,
          }
        }

        throw new Error(response?.data?.message || 'Purchase failed')
      } catch (error) {
        this.error =
          error?.response?.data?.message || error?.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async buyPack(packId) {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.post('/purchase/pack', { pack_id: packId })

        if (response?.data?.status === 'OK') {
          const userStore = useUserStore()
          await userStore.fetchProfile()
          return true
        }
        return false
      } catch (error) {
        this.error = error?.response?.data?.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async buyPrompt(promptId) {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.post('/purchase/prompt', {
          prompt_id: promptId,
        })

        if (response?.data?.status === 'OK') {
          const userStore = useUserStore()
          await userStore.fetchProfile()
          return true
        }
        return false
      } catch (error) {
        this.error = error?.response?.data?.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchPurchaseHistory() {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.get('/purchase/history')

        if (response?.data?.status === 'OK') {
          this.purchaseHistory = (response.data.payload || []).map(
            purchase => ({
              ...purchase,
              createdAt: new Date(purchase.created_at * 1000),
              imageUrl: purchase.image_url,
            }),
          )
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message || 'Failed to fetch purchase history'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },
  },

  getters: {
    formattedPurchaseHistory: state =>
      state.purchaseHistory.map(purchase => ({
        ...purchase,
        formattedDate: purchase.createdAt.toLocaleDateString(),
        formattedTime: purchase.createdAt.toLocaleTimeString(),
        formattedAmount: `${purchase.sum} EUR`,
      })),

    purchasesByDate: state => {
      const grouped = {}
      state.purchaseHistory.forEach(purchase => {
        const date = purchase.createdAt.toLocaleDateString()
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(purchase)
      })
      return grouped
    },
  },
})
