// stores/cart.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const toInt = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

const clampQty = q => Math.max(1, toInt(q, 1))

/**
 * Normalize backend cart row to always have numeric "count".
 * (Backend might send cnt/count/qty/quantity etc)
 */
const normalizeCartRow = row => {
  const count = clampQty(
    row?.count ?? row?.cnt ?? row?.qty ?? row?.quantity ?? 1,
  )
  return { ...row, count }
}

/**
 * Build payload for backend; sends multiple aliases for qty
 * to maximize compatibility with whatever backend expects.
 */
const buildCartAddPayload = (itemId, count) => ({
  id: itemId,
  count,
  qty: count,
  quantity: count,
})

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    unavailableItems: [],
    isLoading: false,
    itemsLoading: {},
    error: null,
    itemErrors: {},
    isUniqueItems: false,

    // UI qty source of truth (key: item_id, value: qty)
    uiQty: {},
  }),

  getters: {
    cartItemsCount: state => state.items.length,
    isEmpty: state => state.items.length === 0,
    hasError: state => !!state.error,

    /**
     * Always compute totals from UI qty (not server row.count)
     */
    cartTotal: state =>
      (state.items || []).reduce((total, row) => {
        const price = toInt(row?.item?.price, 0)
        const count = clampQty(state.uiQty?.[row.item_id] ?? row?.count ?? 1)
        return total + price * count
      }, 0),

    currencySymbol: () => '€',

    isItemInCart: state => itemId =>
      (state.items || []).some(item => item.item_id === itemId),

    isItemLoading: state => itemId => !!state.itemsLoading[itemId],

    getItemError: state => itemId => state.itemErrors[itemId] || null,

    /**
     * Get qty from UI source of truth (fallback to row.count if missing)
     */
    getQty:
      state =>
      (itemId, fallback = 1) => {
        const q = Number(state.uiQty?.[itemId])
        if (Number.isFinite(q) && q >= 1) return q
        return clampQty(fallback)
      },
  },

  actions: {
    // ---------------- UI QTY HELPERS ----------------
    setUiQty(itemId, qty) {
      if (!itemId) return
      const next = clampQty(qty)
      this.uiQty = { ...this.uiQty, [itemId]: next }
    },

    removeUiQty(itemId) {
      if (!itemId) return
      if (this.uiQty?.[itemId] == null) return
      const next = { ...this.uiQty }
      delete next[itemId]
      this.uiQty = next
    },

    /**
     * Apply uiQty onto items[].count so templates that use row.count
     * still show the correct qty (and never flicker).
     */
    applyUiQtyToItems() {
      if (!Array.isArray(this.items) || this.items.length === 0) return
      const next = this.items.map(r => {
        const normalized = normalizeCartRow(r)
        const ui = this.uiQty?.[normalized.item_id]
        if (ui != null) return { ...normalized, count: clampQty(ui) }
        return normalized
      })
      this.items = next
    },

    /**
     * Initialize uiQty for newly loaded items (does NOT overwrite existing uiQty)
     */
    initUiQtyFromItems(items = []) {
      const next = { ...this.uiQty }
      for (const row of items || []) {
        const id = row?.item_id
        if (!id) continue
        if (next[id] == null) next[id] = clampQty(row?.count ?? 1)
      }
      this.uiQty = next
    },

    // ---------------- LOAD CART ----------------
    async fetchCartContent() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.resetState()
        return { success: true }
      }

      try {
        this.error = null
        this.isLoading = true

        const response = await axios.get('/cart/contents')

        if (
          response?.data?.status === 'OK' &&
          Array.isArray(response.data.cart)
        ) {
          // normalize server rows
          const serverItems = (response.data.cart || []).map(normalizeCartRow)

          // keep any existing uiQty, only add missing keys
          this.items = serverItems
          this.initUiQtyFromItems(this.items)

          // force UI qty onto rows to avoid server "1" flicker
          this.applyUiQtyToItems()

          // remove uiQty for items no longer in cart
          const serverIds = new Set(this.items.map(r => r.item_id))
          const nextQty = { ...this.uiQty }
          for (const key of Object.keys(nextQty)) {
            const id = Number.isFinite(Number(key)) ? Number(key) : key
            if (!serverIds.has(id) && !serverIds.has(key)) {
              delete nextQty[key]
            }
          }
          this.uiQty = nextQty

          return { success: true }
        }

        this.items = []
        throw new Error(
          response?.data?.message || 'Invalid response format from server',
        )
      } catch (err) {
        console.error('Error fetching cart content:', err)
        this.items = []
        this.error =
          err?.response?.data?.message || err?.message || 'Failed to fetch cart'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // ---------------- ADD ----------------
    async addToCart(itemId, quantity = 1) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'please_login_to_add_to_cart',
          isUnauthorized: true,
        }
      }

      const addQty = this.isUniqueItems ? 1 : clampQty(quantity)

      const existingRow = (this.items || []).find(r => r.item_id === itemId)
      const currentQty = clampQty(
        this.uiQty?.[itemId] ?? existingRow?.count ?? 1,
      )

      // if item is already in cart -> increment, else set addQty
      const nextQty = this.isItemInCart(itemId) ? currentQty + addQty : addQty

      try {
        this.setItemLoading(itemId, true)

        // keep UI in sync
        this.setUiQty(itemId, nextQty)
        this.applyUiQtyToItems()

        const payload = buildCartAddPayload(itemId, nextQty)


        const response = await axios.post('/cart/add', payload)

        if (response?.data?.status === 'OK') {
          const serverItems = (response.data.cart || []).map(normalizeCartRow)
          this.items = serverItems

          // keep ui qty and enforce it (backend might still respond with 1)
          this.initUiQtyFromItems(this.items)
          this.setUiQty(itemId, nextQty)
          this.applyUiQtyToItems()

          return { success: true, isAlreadyInCart: false, message: 'OK' }
        }

        throw new Error(response?.data?.message || 'Failed to add item to cart')
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to add item'
        return { success: false, isAlreadyInCart: false, message: msg }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async updateQuantity(itemId, quantity) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return { success: false }

      const count = clampQty(quantity)

      // update UI source-of-truth first
      this.setUiQty(itemId, count)

      //  keep items[] in sync for rendering
      {
        const idx = this.items.findIndex(r => r.item_id === itemId)
        if (idx !== -1) {
          const next = [...this.items]
          next[idx] = { ...normalizeCartRow(next[idx]), count }
          this.items = next
        }
      }

      try {
        this.setItemLoading(itemId, true)

        const payload = buildCartAddPayload(itemId, count)
        // Debug if needed:
        // console.log('[cart] updateQuantity sending:', payload)

        const response = await axios.post('/cart/add', payload)

        if (response?.data?.status === 'OK') {
          // refresh items from server BUT do not trust counts
          const serverItems = (response.data.cart || []).map(normalizeCartRow)
          this.items = serverItems

          // make sure uiQty has keys for all items
          this.initUiQtyFromItems(this.items)

          // enforce UI qty on all items (prevents server resetting to 1)
          this.applyUiQtyToItems()

          this.setItemError(itemId, null)
          return { success: true }
        }

        throw new Error(response?.data?.message || 'Failed to update quantity')
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update quantity'
        this.setItemError(itemId, msg)
        return { success: false, error: msg }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    // ---------------- REMOVE ----------------
    async removeFromCart(itemId) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return { success: false }

      try {
        this.error = null
        this.setItemLoading(itemId, true)

        const response = await axios.post('/cart/remove', { id: itemId })

        if (response?.data?.status === 'OK') {
          const serverItems = (response.data.cart || []).map(normalizeCartRow)
          this.items = serverItems

          // remove ui qty for deleted item
          this.removeUiQty(itemId)

          // init missing + enforce ui qty
          this.initUiQtyFromItems(this.items)
          this.applyUiQtyToItems()

          this.setItemError(itemId, null)
          return { success: true }
        }

        throw new Error(response?.data?.message || 'Unknown error occurred')
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to remove item'
        this.error = msg
        this.setItemError(itemId, msg)
        return { success: false, error: msg }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    // ---------------- CLEAR ----------------
    async clearCart() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.resetState()
        return { success: true }
      }

      try {
        this.error = null
        this.isLoading = true

        await axios.post('/cart/clear')
        this.resetState()
        return { success: true }
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || 'Failed to clear cart'
        this.error = msg
        return { success: false, error: msg }
      } finally {
        this.isLoading = false
      }
    },

    // ---------------- HELPERS ----------------
    resetState() {
      this.items = []
      this.unavailableItems = []
      this.error = null
      this.itemErrors = {}
      this.itemsLoading = {}
      this.uiQty = {}
    },

    setItemLoading(itemId, status) {
      if (!itemId) return
      this.itemsLoading = { ...this.itemsLoading, [itemId]: status }
    },

    setItemError(itemId, errorMessage) {
      if (!itemId) return
      if (errorMessage) {
        this.itemErrors = { ...this.itemErrors, [itemId]: errorMessage }
      } else if (this.itemErrors[itemId]) {
        const next = { ...this.itemErrors }
        delete next[itemId]
        this.itemErrors = next
      }
    },
  },
})
