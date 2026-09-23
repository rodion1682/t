import axios from '@/plugins/axios'
import { formatDate } from '@/utils/formatters'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.name || ''} ${user.value.surname || ''}`.trim()
  })
  const firstName = computed(() => user.value?.name || '')
  const lastName = computed(() => user.value?.surname || '')
  const joinDate = computed(() =>
    formatDate(user.value?.created_at, 'MMM D, YYYY'),
  )
  const userEmail = computed(() => user.value?.email)
  const userPhone = computed(() => user.value?.phone)
  const userBalance = computed(() => user.value?.balance)
  const userBalanceFiat = computed(() => user.value?.balance_fiat)
  const userAvatarUrl = computed(() => user.value?.avatarUrl)
  const userCountry = computed(() => user.value?.country?.name || '')
  const userCity = computed(() => user.value?.city || '')
  const userAddress = computed(() => user.value?.address || '')
  const userPostCode = computed(() => user.value?.post_code || '')
  const communityVisibilityDisplay = computed(
    () => user.value?.community_visibility_display || '',
  )
  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchProfile = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      user.value = null
      return
    }

    clearError()
    isLoading.value = true
    try {
      const response = await axios.get('/user/profile')
      user.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async profileData => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true

    try {
      await axios.put('/user/profile', profileData)
      fetchProfile()
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateSteamTradeLink = async url => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    clearError()
    isLoading.value = true

    try {
      await axios.put('/user/update-trade-link', { url })
      await fetchProfile()
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async passwordData => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true
    try {
      await axios.post('/user/change-password', passwordData)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async email => {
    clearError()
    isLoading.value = true
    try {
      await axios.post('/user/reset-password', { email })
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reset password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reset = async (token, email, password) => {
    clearError()
    isLoading.value = true
    try {
      await axios.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: password,
      })
    } catch (err) {
      error.value =
        err.response?.data?.message || 'Failed to reset the password'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const $reset = () => {
    user.value = null
    error.value = null
    isLoading.value = false
  }

  const blockAccount = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    clearError()
    isLoading.value = true

    try {
      await axios.post('/user/block')
      user.value = null
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to block account'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    clearError()
    isLoading.value = true

    try {
      await axios.delete('/user/delete')
      user.value = null
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete account'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    fullName,
    firstName,
    lastName,
    userEmail,
    userPhone,
    joinDate,
    userBalance,
    userBalanceFiat,
    userAvatarUrl,
    userCountry,
    userCity,
    userAddress,
    userPostCode,
    communityVisibilityDisplay,

    // Actions
    fetchProfile,
    updateProfile,
    updateSteamTradeLink,
    updatePassword,
    resetPassword,
    clearError,
    reset,
    $reset,
    blockAccount,
    deleteAccount,
  }
})
