import api from '@/plugins/axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTopUpStore = defineStore('topup', () => {
  const amount = ref(null)
  const paymentType = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const redirectUrl = ref('')
  const depositId = ref(null)
  const depositStatus = ref(null)
  const statusPollingInterval = ref(null)

  const checkoutFormData = ref({
    name: '',
    surname: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    postCode: '',
    email: '',
    termsAccepted: false,
  })

  const setAmount = value => {
    amount.value = value
    error.value = ''
  }

  const setPaymentType = value => {
    paymentType.value = value
  }

  const validateAmount = async () => {
    try {
      isLoading.value = true

      if (!amount.value || isNaN(amount.value) || amount.value <= 0) {
        error.value = 'Please enter a valid amount'
        return false
      }

      // Optional: Add amount validation endpoint
      // await api.post('/validate-amount', { amount: value })
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Invalid amount'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Add a setter for the checkout form data
  const setCheckoutFormData = data => {
    checkoutFormData.value = { ...checkoutFormData.value, ...data }
  }

  const checkout = async data => {
    try {
      isLoading.value = true
      error.value = ''

      const checkoutData = {
        ...data,
      }

      const response = await api.post('deposit/checkout', checkoutData)

      if (response.data.status === 'OK' && response.data.redirect_url) {
        redirectUrl.value = response.data.redirect_url

        // Extract deposit ID from the redirect URL if possible
        try {
          const urlParams = new URLSearchParams(
            new URL(redirectUrl.value).search,
          )
          const orderId = urlParams.get('order')
          if (orderId) {
            depositId.value = orderId
          }
        } catch (parseErr) {
          console.error('Error parsing redirect URL:', parseErr)
        } finally {
          // Clear checkout form data after successful checkout
          resetCheckoutFormData()
        }

        return response.data
      } else {
        // If status is not OK, throw an error with the message from the backend
        throw new Error(response.data.message || 'Checkout failed')
      }
    } catch (err) {
      // Prioritize the response message, then the general error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred during checkout.'
      error.value = errorMessage
      throw new Error(errorMessage) // Re-throw the specific error message
    } finally {
      isLoading.value = false
    }
  }

  const checkDepositStatus = async id => {
    try {
      if (!id && !depositId.value) {
        console.error('No deposit ID provided')
        return null
      }

      const response = await api.get(`deposit/status/${id || depositId.value}`)
      if (response.data && response.data.status) {
        depositStatus.value = response.data.status
        return response.data.status
      }
      return null
    } catch (err) {
      console.error('Failed to check deposit status:', err)
      return null
    }
  }

  const startStatusPolling = id => {
    if (id) depositId.value = id

    // Clear any existing interval
    if (statusPollingInterval.value) {
      clearInterval(statusPollingInterval.value)
    }

    // Start polling every 5 seconds
    statusPollingInterval.value = setInterval(async () => {
      const status = await checkDepositStatus()

      // If we have a final status, stop polling
      if (
        status === 'Success' ||
        status === 'Error' ||
        status === 'Cancelled'
      ) {
        stopStatusPolling()
      }
    }, 5000)
  }

  const stopStatusPolling = () => {
    if (statusPollingInterval.value) {
      clearInterval(statusPollingInterval.value)
      statusPollingInterval.value = null
    }
  }

  // Add a function to reset only the checkout form data
  const resetCheckoutFormData = () => {
    checkoutFormData.value = {
      name: '',
      surname: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      postCode: '',
      email: '',
      termsAccepted: false,
    }
  }

  const reset = () => {
    amount.value = null
    error.value = ''
    redirectUrl.value = ''
    depositId.value = null
    depositStatus.value = null
    paymentType.value = null
    stopStatusPolling()
    resetCheckoutFormData() // Also reset checkout form data on full reset
  }

  const clearError = () => {
    error.value = ''
  }

  // Add a function to prefill checkout form data from user profile
  const prefillCheckoutFormData = user => {
    checkoutFormData.value = {
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.phone || '',
      country: user?.country || '',
      city: user?.city || '',
      address: user?.address || '',
      postCode: user?.zip || '',
      email: user?.email || '',
      termsAccepted: false,
    }
  }

  return {
    amount,
    isLoading,
    error,
    redirectUrl,
    depositId,
    depositStatus,
    // Expose checkoutFormData and its setter
    checkoutFormData,
    setCheckoutFormData,
    paymentType,
    setAmount,
    setPaymentType,
    validateAmount,
    checkout,
    checkDepositStatus,
    startStatusPolling,
    stopStatusPolling,
    reset,
    clearError,
    resetCheckoutFormData,
    prefillCheckoutFormData,
  }
})
