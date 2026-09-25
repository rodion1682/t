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
    error.value = ''
  }

  const setCheckoutFormData = data => {
    checkoutFormData.value = {
      ...checkoutFormData.value,
      ...data,
    }
  }

  const clearError = () => {
    error.value = ''
  }

  const validateAmount = async () => {
    error.value = ''

    const value = Number(amount.value)

    if (!Number.isFinite(value) || value <= 0) {
      error.value = 'Please enter a valid amount'

      return false
    }

    return true
  }

  const extractDepositId = data => {
    const directId =
      data?.deposit_id ??
      data?.depositId ??
      data?.order_id ??
      data?.orderId ??
      data?.id

    if (directId) {
      return directId
    }

    const url = data?.redirect_url || data?.redirectUrl

    if (!url) {
      return null
    }

    try {
      const parsedUrl = new URL(url, window.location.origin)

      return (
        parsedUrl.searchParams.get('order') ||
        parsedUrl.searchParams.get('order_id') ||
        parsedUrl.searchParams.get('deposit_id') ||
        parsedUrl.searchParams.get('id') ||
        null
      )
    } catch (err) {
      console.error('Failed to extract deposit ID:', err)

      return null
    }
  }

  const checkout = async data => {
    try {
      isLoading.value = true
      error.value = ''

      const response = await api.post('/deposit/checkout', {
        ...data,
      })

      const responseData = response?.data

      if (responseData?.status !== 'OK') {
        throw new Error(responseData?.message || 'Checkout failed')
      }

      redirectUrl.value =
        responseData?.redirect_url || responseData?.redirectUrl || ''

      depositId.value = extractDepositId(responseData)

      resetCheckoutFormData()

      return responseData
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'An unknown error occurred during checkout.'

      error.value = message

      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const checkDepositStatus = async id => {
    const currentId = id || depositId.value

    if (!currentId) {
      return null
    }

    try {
      const response = await api.get('/deposit/status', {
        params: {
          id: currentId,
        },
      })

      const responseData = response?.data

      if (!responseData) {
        return null
      }

      const status = responseData.status || responseData.payload?.status || null

      if (!status) {
        return null
      }

      depositStatus.value = status

      return status
    } catch (err) {
      console.error('Failed to check deposit status:', err)

      return null
    }
  }

  const stopStatusPolling = () => {
    if (!statusPollingInterval.value) {
      return
    }

    clearInterval(statusPollingInterval.value)

    statusPollingInterval.value = null
  }

  const startStatusPolling = id => {
    if (id) {
      depositId.value = id
    }

    if (!depositId.value) {
      return
    }

    stopStatusPolling()

    statusPollingInterval.value = setInterval(async () => {
      const status = await checkDepositStatus()

      if (
        status === 'Success' ||
        status === 'Error' ||
        status === 'Cancelled'
      ) {
        stopStatusPolling()
      }
    }, 5000)
  }

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

  const prefillCheckoutFormData = user => {
    checkoutFormData.value = {
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.phone || '',
      country: user?.country || '',
      city: user?.city || '',
      address: user?.address || '',
      postCode: user?.zip || user?.postCode || '',
      email: user?.email || '',
      termsAccepted: false,
    }
  }

  const resetPaymentState = () => {
    redirectUrl.value = ''
    depositId.value = null
    depositStatus.value = null

    stopStatusPolling()
  }

  const reset = () => {
    amount.value = null
    paymentType.value = null

    isLoading.value = false
    error.value = ''

    resetPaymentState()
    resetCheckoutFormData()
  }

  return {
    amount,
    paymentType,

    isLoading,
    error,

    redirectUrl,
    depositId,
    depositStatus,

    checkoutFormData,

    setAmount,
    setPaymentType,
    setCheckoutFormData,

    validateAmount,

    checkout,

    checkDepositStatus,
    startStatusPolling,
    stopStatusPolling,

    prefillCheckoutFormData,
    resetCheckoutFormData,

    resetPaymentState,
    reset,
    clearError,
  }
})
