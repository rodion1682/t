import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

const DOTA2_CATEGORY = 'cs2'
const DEFAULT_LIMIT = 20

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
    randomProducts: [],
    popularProducts: [],
    saleProducts: [],
    newProducts: [],
    error: null,
  }),

  actions: {
    async fetchProductDetails(productId) {
      try {
        const { data } = await axios.get(`/items/${productId}`)

        if (data?.status === 'OK') {
          this.currentProduct = data.payload
          this.error = null
          return data.payload
        }

        throw new Error(data?.message || 'Failed to fetch product details')
      } catch (error) {
        console.error('Error fetching product details:', error)
        this.error = error?.message || 'Failed to fetch product details'
        throw error
      }
    },

    async fetchRandomProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/list', {
          params: {
            random: true,
            limit: DEFAULT_LIMIT,
            category: DOTA2_CATEGORY,
            ...params,
          },
        })

        if (data?.status === 'OK') {
          this.randomProducts = data.payload || []
          return this.randomProducts
        }

        this.randomProducts = []
        return []
      } catch (error) {
        console.error('Error fetching random products:', error)
        this.randomProducts = []
        return []
      }
    },

    async fetchPopularProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/recommended', {
          params: {
            category: DOTA2_CATEGORY,
            limit: DEFAULT_LIMIT,
            ...params,
          },
        })

        if (data?.status === 'OK') {
          this.popularProducts = data.payload || []
          return this.popularProducts
        }

        this.popularProducts = []
        return []
      } catch (error) {
        console.error('Error fetching popular products:', error)
        this.popularProducts = []
        return []
      }
    },

    async fetchSaleProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/list', {
          params: {
            sale: true,
            limit: DEFAULT_LIMIT,
            category: DOTA2_CATEGORY,
            ...params,
          },
        })

        if (data?.status === 'OK') {
          this.saleProducts = data.payload || []
          return this.saleProducts
        }

        this.saleProducts = []
        return []
      } catch (error) {
        console.error('Error fetching sale products:', error)
        this.saleProducts = []
        return []
      }
    },

    async fetchNewProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/list', {
          params: {
            new: true,
            limit: DEFAULT_LIMIT,
            category: DOTA2_CATEGORY,
            ...params,
          },
        })

        if (data?.status === 'OK') {
          this.newProducts = data.payload || []
          return this.newProducts
        }

        this.newProducts = []
        return []
      } catch (error) {
        console.error('Error fetching new products:', error)
        this.newProducts = []
        return []
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null
      this.error = null
    },

    clearCollections() {
      this.randomProducts = []
      this.popularProducts = []
      this.saleProducts = []
      this.newProducts = []
    },
  },
})
