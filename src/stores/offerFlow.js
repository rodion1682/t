import api from '@/plugins/axios'
import { useUserStore } from '@/stores/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'

export const useOfferFlowStore = defineStore('offerFlow', () => {
  const userStore = useUserStore()

  // Current step and data storage
  const currentStep = ref(null)
  const selectedOffer = ref(null)
  const selectedPaymentMethod = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const offers = ref([])
  const submissionInProgress = ref(false)

  // Form data storage with initial values from user store
  const contactInfo = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
  })

  const paymentInfo = ref({
    // Card payment fields
    cardNumber: '',
    cardHolderName: '',
    expirationDate: '',
    // SEPA payment fields
    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',
    // Common fields
    termsAccepted: false,
  })

  // Computed properties
  const getOffers = computed(() => offers.value)
  const getSelectedOffer = computed(() => selectedOffer.value)

  // Reset form data
  const resetFormData = () => {
    contactInfo.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      postCode: '',
      address: '',
    }
    paymentInfo.value = {
      cardNumber: '',
      cardHolderName: '',
      expirationDate: '',
      accountHolderFirstName: '',
      accountHolderLastName: '',
      iban: '',
      termsAccepted: false,
    }
    selectedPaymentMethod.value = null
    currentStep.value = null
  }

  // Initialize contact info from user data
  const initContactInfoFromUser = () => {
    contactInfo.value = {
      firstName: userStore.firstName || '',
      lastName: userStore.lastName || '',
      email: userStore.userEmail || '',
      phone: userStore.userPhone || '',
      country: userStore.userCountry || '',
      city: userStore.userCity || '',
      postCode: userStore.userPostCode || '',
      address: userStore.userAddress || '',
    }
  }

  // Set current step
  const setStep = step => {
    if (step === 'contact') {
      initContactInfoFromUser()
    }
    currentStep.value = step
  }

  // Set selected offer
  const setSelectedOffer = offer => {
    selectedOffer.value = offer
  }

  // Update contact information
  const updateContactInfo = data => {
    contactInfo.value = { ...contactInfo.value, ...data }
  }

  // Set payment method
  const setPaymentMethod = method => {
    selectedPaymentMethod.value = method
  }

  // Update payment information
  const updatePaymentInfo = data => {
    paymentInfo.value = { ...paymentInfo.value, ...data }
  }

  // Format data for withdrawal request
  const formatWithdrawalData = () => {
    const baseData = {
      id: selectedOffer.value?.id,
      address: contactInfo.value.address,
      city: contactInfo.value.city,
      country: contactInfo.value.country,
      email: contactInfo.value.email,
      name: contactInfo.value.firstName,
      surname: contactInfo.value.lastName,
      phone: contactInfo.value.phone,
      postCode: contactInfo.value.postCode,
      withdrawType: selectedPaymentMethod.value,
    }

    if (selectedPaymentMethod.value === 'card') {
      const [month, year] = paymentInfo.value.expirationDate.split('/')
      return {
        ...baseData,
        card_holder_name: paymentInfo.value.cardHolderName,
        card_number: paymentInfo.value.cardNumber.replace(/\s/g, ''),
        expire_month: month,
        expire_year: year,
      }
    } else {
      return {
        ...baseData,
        first_name: paymentInfo.value.accountHolderFirstName,
        last_name: paymentInfo.value.accountHolderLastName,
        account_number: paymentInfo.value.iban.replace(/\s/g, ''),
      }
    }
  }

  // Submit the withdrawal request
  const submitWithdrawal = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const data = formatWithdrawalData()
      const response = await api.post(
        'offer/withdraw/' + selectedPaymentMethod.value,
        data,
      )

      if (response.data.status === 'OK') {
        resetFormData()
        return { success: true }
      }

      throw new Error(response.data.message || 'Failed to process withdrawal')
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return {
        error: error.value,
        validationErrors: err.response?.data?.errors,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Fetch user's offers
  const fetchOffers = async () => {
    try {
      isLoading.value = true
      const response = await api.get('offer/history')

      if (response.data.status === 'OK' && response.data.payload) {
        offers.value = response.data.payload
      } else {
        offers.value = []
        toast.error('Failed to fetch offers data')
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Failed to fetch offers. Please try again later.')
      offers.value = []
    } finally {
      isLoading.value = false
    }
  }

  const saveUserOfferData = async (offerId = selectedOffer.value?.id) => {
    try {
      isLoading.value = true
      error.value = ''

      if (!offerId) {
        throw new Error('No offer selected')
      }

      const payload = {
        id: offerId,
        address: contactInfo.value.address,
        city: contactInfo.value.city,
        country: String(contactInfo.value.country || ''),
        currency:
          selectedOffer.value?.fiat_currency || selectedOffer.value?.currency,
        email: contactInfo.value.email,
        name: contactInfo.value.firstName,
        surname: contactInfo.value.lastName,
        phone: contactInfo.value.phone,
        postCode: contactInfo.value.postCode,
      }

      const response = await api.post('offer/save', payload)
      const data = response?.data

      if (data?.status === 'OK') {
        return { success: true, data }
      }

      return {
        success: false,
        message: data?.message || 'Failed to save offer data',
        errors: data?.errors || {},
      }
    } catch (err) {
      const data = err?.response?.data

      const message =
        data?.message || err?.message || 'Failed to save offer data'

      console.error('Error saving offer data:', { message, data, err })

      return {
        success: false,
        message,
        errors: data?.errors || {},
        httpStatus: err?.response?.status,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Get details of a specific offer
  const fetchOfferDetails = async offerId => {
    try {
      const response = await api.get(`offer/${offerId}`)

      selectedOffer.value = response.data

      return response.data
    } catch (error) {
      console.error('Error fetching offer details:', error)
      return null
    }
  }

  // Create a new sell order
  const createSellOrder = async formData => {
    try {
      submissionInProgress.value = true
      const payload = {
        ...formData,
        currency: formData.currency || 'EUR',
      }

      const response = await api.post('offer/create', payload)

      if (response.data.status === 'OK') {
        await fetchOffers()
        return { success: true, id: response.data.id }
      } else {
        const errorMessage =
          response.data.message || 'Failed to submit sell order'
        toast.error(errorMessage)
        return {
          success: false,
          error: errorMessage,
          validationErrors: response.data.errors || {},
        }
      }
    } catch (error) {
      const validationErrors = error.response?.data?.errors || {}
      let errorMessage =
        'Failed to submit your sell order. Please try again later.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      if (Object.keys(validationErrors).length > 0) {
        const firstErrorKey = Object.keys(validationErrors)[0]
        if (firstErrorKey && validationErrors[firstErrorKey][0]) {
          errorMessage = validationErrors[firstErrorKey][0]
        }
      }

      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage,
        validationErrors: validationErrors,
      }
    } finally {
      submissionInProgress.value = false
    }
  }

  // Accept an offer
  const acceptOffer = async offerId => {
    try {
      isLoading.value = true
      const response = await api.post('offer/accept', { id: offerId })

      if (response.data.status === 'OK') {
        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'awaiting_item'
        }
        return true
      } else {
        toast.error(response.data.message || 'Failed to accept offer')
        return false
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      toast.error('Failed to accept offer. Please try again later.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const flattenErrors = errorsObj => {
    if (!errorsObj || typeof errorsObj !== 'object') return []
    const out = []

    for (const [field, messages] of Object.entries(errorsObj)) {
      if (Array.isArray(messages)) {
        for (const m of messages) {
          if (m) out.push(`${field}: ${m}`)
        }
      } else if (messages) {
        out.push(`${field}: ${String(messages)}`)
      }
    }

    return out
  }

  // Request a payout
  const requestPayout = async (offerId, withdrawType) => {
    isLoading.value = true

    try {
      const payload = {
        id: offerId,
        name: contactInfo.value.firstName,
        surname: contactInfo.value.lastName,
        email: contactInfo.value.email,
        phone: contactInfo.value.phone,
        country: String(contactInfo.value.country),
        city: contactInfo.value.city,
        address: contactInfo.value.address,
        postCode: contactInfo.value.postCode,
      }

      const response = await api.post(
        `offer/request-payout/${withdrawType}`,
        payload,
      )
      const data = response?.data

      if (data?.status === 'OK') {
        if (withdrawType === 'card-form' && data?.redirect_url) {
          return {
            success: true,
            redirect: true,
            redirectUrl: data.redirect_url,
            data,
          }
        }
        return { success: true, data }
      }

      // status !== OK but request didn't throw
      const errors = data?.errors || {}
      const messages = flattenErrors(errors)

      const message =
        data?.message ||
        data?.error ||
        messages[0] ||
        'Failed to request payout'

      toast.error(message)

      return {
        success: false,
        message,
        errors,
        messages,
        status: data?.status,
      }
    } catch (err) {
      const data = err?.response?.data
      const errors = data?.errors || {}
      const messages = flattenErrors(errors)

      const message =
        data?.message ||
        data?.error ||
        messages[0] ||
        err?.message ||
        'An unexpected error occurred during payout. Please try again later.'

      // log the full useful thing (not errors[0] bullshit)
      console.error('Error requesting payout:', { message, data, err })

      toast.error(message)

      return {
        success: false,
        message,
        errors,
        messages,
        status: data?.status,
        httpStatus: err?.response?.status,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Decline an offer
  const declineOffer = async offerId => {
    try {
      isLoading.value = true
      const response = await api.post('offer/decline', { id: offerId })

      if (response.data.status === 'OK') {
        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'declined_by_user'
        }
        return true
      } else {
        toast.error(response.data.message || 'Failed to decline offer')
        return false
      }
    } catch (error) {
      console.error('Error declining offer:', error)
      toast.error('Failed to decline offer. Please try again later.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Complete offer with payment
  const completeOffer = async ({ offerId, paymentMethod, payload }) => {
    try {
      isLoading.value = true

      const withdrawType =
        paymentMethod === 'sepa' ? 'sepa-manual' : 'card-form'

      const response = await api.post(
        `offer/request-payout/${withdrawType}`,
        payload,
      )

      if (response.data.status === 'OK') {
        if (withdrawType === 'card-form' && response.data.redirect_url) {
          window.location.href = response.data.redirect_url
          return { success: true, redirect: true }
        }

        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'payout_processing'
        }
        toast.success(
          response.data.message || 'Payout request submitted successfully!',
        )
        return { success: true }
      } else {
        let errorMessage = response.data.message || 'Failed to complete offer'

        if (response.data.errors) {
          const firstErrorKey = Object.keys(response.data.errors)[0]
          if (firstErrorKey && response.data.errors[firstErrorKey][0]) {
            errorMessage = response.data.errors[firstErrorKey][0]
          }
        }

        toast.error(errorMessage)
        return {
          success: false,
          error: errorMessage,
          validationErrors: response.data.errors || {},
        }
      }
    } catch (error) {
      console.error('Error completing offer:', error)

      let errorMessage = 'Failed to complete offer. Please try again later.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      const validationErrors = error.response?.data?.errors || {}
      if (Object.keys(validationErrors).length > 0) {
        const firstErrorKey = Object.keys(validationErrors)[0]
        if (firstErrorKey && validationErrors[firstErrorKey][0]) {
          errorMessage = validationErrors[firstErrorKey][0]
        }
      }

      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage,
        validationErrors: validationErrors,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Return store methods and properties
  return {
    // State
    currentStep,
    selectedOffer,
    selectedPaymentMethod,
    isLoading,
    error,
    offers,
    submissionInProgress,
    contactInfo,
    paymentInfo,

    // Getters
    getOffers,
    getSelectedOffer,

    // Actions
    resetFormData,
    initContactInfoFromUser,
    setStep,
    setSelectedOffer,
    saveUserOfferData,
    updateContactInfo,
    setPaymentMethod,
    updatePaymentInfo,
    fetchOffers,
    fetchOfferDetails,
    createSellOrder,
    acceptOffer,
    declineOffer,
    completeOffer,
    requestPayout,
  }
})
