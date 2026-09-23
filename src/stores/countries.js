// stores/countries.js
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useCountriesStore = defineStore('countries', {
  state: () => ({
    countries: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCountries() {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.get('/countries')
        if (response.data.status === 'OK') {
          this.countries = response.data.payload
        }
      } catch (error) {
        this.error = 'Failed to load countries'
        console.error('Error fetching countries:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
