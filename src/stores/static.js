import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useStaticStore = defineStore('static', {
  state: () => ({
    pages: [],
    currentPage: null,

    socialLinks: [], 
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPages() {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get('/static-pages')
        if (data.status === 'OK')
          this.pages = Array.isArray(data.payload) ? data.payload : []
      } catch (e) {
        this.error = 'Failed to fetch pages'
      } finally {
        this.loading = false
      }
    },

    async fetchPage({ slug }) {
      this.error = null
      this.loading = true
      this.currentPage = null

      // frontend-only mapping for "pretty URLs"
      const FALLBACK_SLUG_TO_ID_BY_FLAGS = (page, requestedSlug) => {
        // if backend slug exists, it must match requestedSlug
        if (page?.slug) return page.slug === requestedSlug

        // if backend slug is null, match by flags/title
        if (requestedSlug === 'terms-and-conditions') return !!page?.is_terms
        if (requestedSlug === 'privacy-policy') return !!page?.is_privacy

        // cookie flag is broken in your payload sometimes, so match by title
        if (requestedSlug === 'cookie-notice') {
          return (page?.title || '').toLowerCase().includes('cookie')
        }

        return false
      }

      try {
        if (!this.pages.length) {
          await this.fetchPages()
        }

        const page = this.pages.find(p => FALLBACK_SLUG_TO_ID_BY_FLAGS(p, slug))
        if (!page?.id) return null

        // ✅ Always request by ID (this works for both slug and no-slug pages)
        const { data } = await axios.get(`/static-pages/${page.id}`)
        if (data.status === 'OK') this.currentPage = data.payload

        return this.currentPage
      } catch (e) {
        this.error = 'Failed to fetch page'
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchSocialLinks() {
      // ✅ add
      this.error = null
      try {
        const { data } = await axios.get('/social-links')
        if (data.status === 'OK') {
          this.socialLinks = Array.isArray(data.payload) ? data.payload : []
        }
      } catch (e) {
        // don't hard-fail footer because socials died
        this.socialLinks = []
      }
    },
  },
})
