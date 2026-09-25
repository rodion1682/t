import axios from '@/plugins/axios'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const error = ref(null)

  const fullName = computed(() => {
    if (!user.value) {
      return ''
    }

    return [user.value.name, user.value.surname]
      .filter(Boolean)
      .join(' ')
      .trim()
  })

  const firstName = computed(() => {
    return user.value?.name || ''
  })

  const lastName = computed(() => {
    return user.value?.surname || ''
  })

  const userEmail = computed(() => {
    return user.value?.email || ''
  })

  const userPhone = computed(() => {
    return user.value?.phone || ''
  })

  const userBalance = computed(() => {
    return Number(user.value?.balance || 0)
  })

  const userBalanceFiat = computed(() => {
    return Number(user.value?.balance_fiat ?? user.value?.balance ?? 0)
  })

  const userCountry = computed(() => {
    return user.value?.country || ''
  })

  const userCity = computed(() => {
    return user.value?.city || ''
  })

  const userAddress = computed(() => {
    return user.value?.address || ''
  })

  const userPostCode = computed(() => {
    return user.value?.zip || user.value?.post_code || ''
  })

  const userAvatarUrl = computed(() => {
    return user.value?.avatar_medium || user.value?.avatarUrl || ''
  })

  const communityVisibilityDisplay = computed(() => {
    return user.value?.community_visibility_display || ''
  })

  const clearError = () => {
    error.value = null
  }

  const fetchProfile = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      user.value = null

      return null
    }

    clearError()
    isLoading.value = true

    try {
      const { data } = await axios.get('/user/profile')

      if (data?.status === 'ERROR') {
        throw new Error(data?.message || 'Failed to fetch profile')
      }

      user.value = data

      return data
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch profile'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async profileData => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return null
    }

    clearError()
    isUpdating.value = true

    try {
      const { data } = await axios.put('/user/profile', profileData)

      if (data?.status && data.status !== 'OK') {
        throw new Error(data?.message || 'Failed to update profile')
      }

      await fetchProfile()

      return data
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile'

      throw err
    } finally {
      isUpdating.value = false
    }
  }

  const updateSteamTradeLink = async url => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return null
    }

    clearError()
    isUpdating.value = true

    try {
      const { data } = await axios.put('/user/update-trade-link', {
        url,
      })

      await fetchProfile()

      return data
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update trade link'

      throw err
    } finally {
      isUpdating.value = false
    }
  }

  const updatePassword = async passwordData => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return null
    }

    clearError()
    isUpdating.value = true

    try {
      const { data } = await axios.post('/user/change-password', passwordData)

      return data
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password'

      throw err
    } finally {
      isUpdating.value = false
    }
  }

  const resetPassword = async email => {
    clearError()
    isLoading.value = true

    try {
      const { data } = await axios.post('/user/reset-password', {
        email,
      })

      return data
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const blockAccount = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true

    try {
      await axios.post('/user/block')

      user.value = null
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to block account'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true

    try {
      await axios.delete('/user/delete')

      user.value = null
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete account'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const $reset = () => {
    user.value = null
    isLoading.value = false
    isUpdating.value = false
    error.value = null
  }

  return {
    user,
    isLoading,
    isUpdating,
    error,

    fullName,
    firstName,
    lastName,
    userEmail,
    userPhone,
    userBalance,
    userBalanceFiat,
    userCountry,
    userCity,
    userAddress,
    userPostCode,
    userAvatarUrl,
    communityVisibilityDisplay,

    fetchProfile,
    updateProfile,
    updateSteamTradeLink,
    updatePassword,
    resetPassword,
    blockAccount,
    deleteAccount,
    clearError,
    $reset,
  }
})
