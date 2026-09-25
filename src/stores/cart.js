import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

import { useAuthStore } from './auth'

const toNumber = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : fallback
}

const normalizeQuantity = value => {
  return Math.max(1, Math.trunc(toNumber(value, 1)))
}

const normalizeCartRow = row => {
  const itemId = row?.item_id ?? row?.item?.id ?? row?.id

  return {
    ...row,

    item_id: itemId,

    count: normalizeQuantity(
      row?.count ?? row?.cnt ?? row?.qty ?? row?.quantity ?? 1,
    ),
  }
}

const getRowPrice = row => {
  return toNumber(
    row?.item?.internal_price ??
      row?.item?.price ??
      row?.internal_price ??
      row?.price ??
      0,
  )
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],

    unavailableItems: [],

    isLoading: false,

    itemsLoading: {},

    error: null,

    itemErrors: {},

    uiQty: {},
  }),

  getters: {
    cartItemsCount: state => {
      return (state.items || []).reduce((total, row) => {
        const quantity = state.uiQty?.[row.item_id] ?? row.count ?? 1

        return total + normalizeQuantity(quantity)
      }, 0)
    },

    cartUniqueItemsCount: state => {
      return state.items.length
    },

    isEmpty: state => {
      return state.items.length === 0
    },

    hasError: state => {
      return Boolean(state.error)
    },

    cartTotal: state => {
      return (state.items || []).reduce((total, row) => {
        const quantity = normalizeQuantity(
          state.uiQty?.[row.item_id] ?? row.count ?? 1,
        )

        return total + getRowPrice(row) * quantity
      }, 0)
    },

    cartItemIds: state => {
      return (state.items || []).map(row => row.item_id).filter(Boolean)
    },

    isItemInCart: state => itemId => {
      return (state.items || []).some(
        row => String(row.item_id) === String(itemId),
      )
    },

    isItemLoading: state => itemId => {
      return Boolean(state.itemsLoading[itemId])
    },

    getItemError: state => itemId => {
      return state.itemErrors[itemId] || null
    },

    getQty:
      state =>
      (itemId, fallback = 1) => {
        const quantity = state.uiQty?.[itemId]

        if (quantity != null) {
          return normalizeQuantity(quantity)
        }

        return normalizeQuantity(fallback)
      },
  },

  actions: {
    setLoading(value) {
      this.isLoading = value
    },

    setItemLoading(itemId, value) {
      this.itemsLoading = {
        ...this.itemsLoading,

        [itemId]: value,
      }
    },

    setItemError(itemId, message) {
      const errors = {
        ...this.itemErrors,
      }

      if (message) {
        errors[itemId] = message
      } else {
        delete errors[itemId]
      }

      this.itemErrors = errors
    },

    setUiQty(itemId, quantity) {
      if (!itemId) {
        return
      }

      this.uiQty = {
        ...this.uiQty,

        [itemId]: normalizeQuantity(quantity),
      }
    },

    removeUiQty(itemId) {
      const next = {
        ...this.uiQty,
      }

      delete next[itemId]

      this.uiQty = next
    },

    applyCart(items = []) {
      const normalized = items.map(normalizeCartRow)

      const nextQty = {}

      normalized.forEach(row => {
        const existing = this.uiQty?.[row.item_id]

        nextQty[row.item_id] = normalizeQuantity(existing ?? row.count ?? 1)
      })

      this.uiQty = nextQty

      this.items = normalized.map(row => ({
        ...row,

        count: nextQty[row.item_id],
      }))
    },

    async fetchCartContent() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.resetState()

        return {
          success: true,
        }
      }

      try {
        this.error = null
        this.setLoading(true)

        const { data } = await axios.get('/cart/contents')

        if (data?.status !== 'OK' || !Array.isArray(data.cart)) {
          throw new Error(data?.message || 'Failed to load cart')
        }

        this.applyCart(data.cart)

        this.unavailableItems = Array.isArray(data.unavailable)
          ? data.unavailable
          : []

        return {
          success: true,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch cart'

        return {
          success: false,

          error: this.error,
        }
      } finally {
        this.setLoading(false)
      }
    },

    async addToCart(itemId, quantity = 1) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,

          isUnauthorized: true,

          message: 'please_login_to_add_to_cart',
        }
      }

      if (this.isItemInCart(itemId)) {
        return {
          success: false,

          isAlreadyInCart: true,

          message: 'Item is already in cart',
        }
      }

      const count = normalizeQuantity(quantity)

      try {
        this.error = null

        this.setItemLoading(itemId, true)

        const { data } = await axios.post('/cart/add', {
          id: itemId,
          count,
          qty: count,
          quantity: count,
        })

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Failed to add item')
        }

        if (Array.isArray(data.cart)) {
          this.applyCart(data.cart)
        } else {
          await this.fetchCartContent()
        }

        return {
          success: true,
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to add item'

        this.setItemError(itemId, message)

        return {
          success: false,
          message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async updateQuantity(itemId, quantity) {
      if (!itemId) {
        return {
          success: false,
        }
      }

      const count = normalizeQuantity(quantity)

      this.setUiQty(itemId, count)

      try {
        this.setItemLoading(itemId, true)

        this.setItemError(itemId, null)

        const { data } = await axios.post('/cart/add', {
          id: itemId,
          count,
          qty: count,
          quantity: count,
        })

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Failed to update quantity')
        }

        if (Array.isArray(data.cart)) {
          this.applyCart(data.cart)
        }

        return {
          success: true,
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update quantity'

        this.setItemError(itemId, message)

        return {
          success: false,
          error: message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async removeFromCart(itemId) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
        }
      }

      try {
        this.setItemLoading(itemId, true)

        this.setItemError(itemId, null)

        const { data } = await axios.post('/cart/remove', {
          id: itemId,
        })

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Failed to remove item')
        }

        this.removeUiQty(itemId)

        if (Array.isArray(data.cart)) {
          this.applyCart(data.cart)
        } else {
          this.items = this.items.filter(
            row => String(row.item_id) !== String(itemId),
          )
        }

        return {
          success: true,
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to remove item'

        this.setItemError(itemId, message)

        return {
          success: false,
          error: message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async clearCart() {
      try {
        this.setLoading(true)

        const { data } = await axios.post('/cart/clear')

        if (data?.status && data.status !== 'OK') {
          throw new Error(data.message || 'Failed to clear cart')
        }

        this.resetState()

        return {
          success: true,
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to clear cart'

        this.error = message

        return {
          success: false,
          error: message,
        }
      } finally {
        this.setLoading(false)
      }
    },

    resetState() {
      this.items = []
      this.unavailableItems = []
      this.isLoading = false
      this.itemsLoading = {}
      this.error = null
      this.itemErrors = {}
      this.uiQty = {}
    },
  },
})
