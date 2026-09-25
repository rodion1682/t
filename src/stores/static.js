import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

export const useStaticStore = defineStore('static', {
  state: () => ({
    pages: [],
    currentPage: null,
    socialLinks: [],

    pagesLoading: false,
    pageLoading: false,
    socialLinksLoading: false,

    pagesError: null,
    pageError: null,

    pagesLangId: null,
  }),

  getters: {
    loading: state => {
      return state.pagesLoading || state.pageLoading
    },

    error: state => {
      return state.pageError || state.pagesError
    },

    termsPage: state => {
      return state.pages.find(page => Number(page?.is_terms) === 1) || null
    },

    privacyPage: state => {
      return state.pages.find(page => Number(page?.is_privacy) === 1) || null
    },

    cookiePage: state => {
      return (
        state.pages.find(page => Number(page?.is_cookie) === 1) ||
        state.pages.find(page =>
          String(page?.title || '')
            .toLowerCase()
            .includes('cookie'),
        ) ||
        null
      )
    },
  },

  actions: {
    async fetchPages(langId = null, force = false) {
      const normalizedLangId = langId == null ? null : String(langId)

      if (
        !force &&
        this.pages.length &&
        this.pagesLangId === normalizedLangId
      ) {
        return this.pages
      }

      this.pagesLoading = true
      this.pagesError = null

      try {
        const { data } = await axios.get('/static-pages', {
          params: langId
            ? {
                lang_id: langId,
              }
            : {},
        })

        if (data?.status !== 'OK' || !Array.isArray(data?.payload)) {
          throw new Error(data?.message || 'Failed to fetch static pages')
        }

        this.pages = data.payload
        this.pagesLangId = normalizedLangId

        return this.pages
      } catch (error) {
        console.error('Static pages fetch error:', error)

        this.pages = []
        this.pagesLangId = null

        this.pagesError =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch static pages'

        return []
      } finally {
        this.pagesLoading = false
      }
    },

    async fetchPage({ slug, id, langId = null }) {
      const identifier = slug || id

      if (!identifier) {
        this.currentPage = null
        return null
      }

      this.pageLoading = true
      this.pageError = null
      this.currentPage = null

      try {
        /*
         * Backend StaticController accepts
         * either the content slug or static page ID.
         *
         * So there is no reason to first request
         * /static-pages just to resolve the ID.
         */
        const { data } = await axios.get(
          `/static-pages/${encodeURIComponent(identifier)}`,
          {
            params: langId
              ? {
                  lang_id: langId,
                }
              : {},
          },
        )

        if (data?.status !== 'OK' || !data?.payload) {
          throw new Error(data?.message || 'Static page was not found')
        }

        this.currentPage = data.payload

        return this.currentPage
      } catch (error) {
        console.error('Static page fetch error:', error)

        this.currentPage = null

        this.pageError =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch page'

        return null
      } finally {
        this.pageLoading = false
      }
    },

    async fetchSocialLinks(langId = null) {
      this.socialLinksLoading = true

      try {
        const { data } = await axios.get('/social-links', {
          params: langId
            ? {
                lang_id: langId,
              }
            : {},
        })

        this.socialLinks =
          data?.status === 'OK' && Array.isArray(data?.payload)
            ? data.payload
            : []

        return this.socialLinks
      } catch (error) {
        console.error('Social links fetch error:', error)

        this.socialLinks = []

        return []
      } finally {
        this.socialLinksLoading = false
      }
    },

    clearCurrentPage() {
      this.currentPage = null
      this.pageError = null
    },
  },
})
