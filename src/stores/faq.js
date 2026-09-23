import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useFaqStore = defineStore('faq', {
  state: () => ({
    faq: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchFaq(langId) {
      try {
        this.isLoading = true
        this.error = null

        const res = await axios.get('/faq', {
          params: { lang_id: langId },
        })

        if (res.data.status === 'OK') {
          this.faq = res.data.payload || []
        } else {
          this.faq = []
        }
      } catch (e) {
        this.error = 'Failed to load FAQ'
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },
  },
})
