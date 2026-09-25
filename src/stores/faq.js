import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

const sortFaqs = items => {
  if (!Array.isArray(items)) {
    return []
  }

  return [...items].sort(
    (a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0),
  )
}

export const useFaqStore = defineStore('faq', {
  state: () => ({
    faq: [],
    popularFaq: [],
    categories: [],

    isLoading: false,
    isPopularLoading: false,
    isCategoriesLoading: false,

    error: null,

    loadedLangId: null,
    loadedPopularLangId: null,
    loadedCategoriesLangId: null,
  }),

  getters: {
    hasFaq: state => {
      return state.faq.length > 0
    },

    hasPopularFaq: state => {
      return state.popularFaq.length > 0
    },

    allQuestions: state => {
      return state.faq
    },
  },

  actions: {
    async fetchFaq(langId, force = false) {
      if (!langId) {
        this.faq = []
        return []
      }

      const normalizedLangId = String(langId)

      if (!force && this.loadedLangId === normalizedLangId && this.faq.length) {
        return this.faq
      }

      try {
        this.isLoading = true
        this.error = null

        const { data } = await axios.get('/faqs', {
          params: {
            lang_id: langId,
          },
        })

        if (data?.status !== 'OK' || !Array.isArray(data?.payload)) {
          throw new Error(data?.message || 'Failed to load FAQ')
        }

        this.faq = sortFaqs(data.payload)

        this.loadedLangId = normalizedLangId

        return this.faq
      } catch (error) {
        console.error('FAQ fetch error:', error)

        this.faq = []

        this.loadedLangId = null

        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load FAQ'

        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchPopularFaq(langId, force = false) {
      if (!langId) {
        this.popularFaq = []
        return []
      }

      const normalizedLangId = String(langId)

      if (
        !force &&
        this.loadedPopularLangId === normalizedLangId &&
        this.popularFaq.length
      ) {
        return this.popularFaq
      }

      try {
        this.isPopularLoading = true

        const { data } = await axios.get('/faqs/popular', {
          params: {
            lang_id: langId,
          },
        })

        if (data?.status !== 'OK' || !Array.isArray(data?.payload)) {
          throw new Error(data?.message || 'Failed to load popular FAQ')
        }

        this.popularFaq = sortFaqs(data.payload)

        this.loadedPopularLangId = normalizedLangId

        return this.popularFaq
      } catch (error) {
        console.error('Popular FAQ fetch error:', error)

        this.popularFaq = []
        this.loadedPopularLangId = null

        return []
      } finally {
        this.isPopularLoading = false
      }
    },

    async fetchFaqCategories(langId, force = false) {
      if (!langId) {
        this.categories = []
        return []
      }

      const normalizedLangId = String(langId)

      if (
        !force &&
        this.loadedCategoriesLangId === normalizedLangId &&
        this.categories.length
      ) {
        return this.categories
      }

      try {
        this.isCategoriesLoading = true

        const { data } = await axios.get('/faqs', {
          params: {
            lang_id: langId,
            include_categories: 1,
          },
        })

        if (data?.status !== 'OK' || !Array.isArray(data?.payload)) {
          throw new Error(data?.message || 'Failed to load FAQ categories')
        }

        this.categories = data.payload

        this.loadedCategoriesLangId = normalizedLangId

        return this.categories
      } catch (error) {
        console.error('FAQ categories fetch error:', error)

        this.categories = []
        this.loadedCategoriesLangId = null

        return []
      } finally {
        this.isCategoriesLoading = false
      }
    },

    async fetchCategory(categoryId, langId) {
      if (!categoryId || !langId) {
        return null
      }

      try {
        const { data } = await axios.get(`/faqs/category/${categoryId}`, {
          params: {
            lang_id: langId,
          },
        })

        if (data?.status !== 'OK') {
          throw new Error(data?.message || 'Failed to load FAQ category')
        }

        return data.payload || null
      } catch (error) {
        console.error('FAQ category fetch error:', error)

        return null
      }
    },

    reset() {
      this.faq = []
      this.popularFaq = []
      this.categories = []

      this.error = null

      this.loadedLangId = null
      this.loadedPopularLangId = null
      this.loadedCategoriesLangId = null
    },
  },
})
