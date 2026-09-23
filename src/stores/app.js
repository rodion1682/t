import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(true)
  const initializationError = ref(null)

  function setAppLoading(value) {
    isLoading.value = value
  }

  function setInitializationError(error) {
    initializationError.value = error
  }

  return {
    isLoading,
    initializationError,
    setAppLoading,
    setInitializationError,
  }
})
