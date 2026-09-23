import api from '@/plugins/axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'

export const usePayoutStore = defineStore('payout', () => {
  const isLoading = ref(false)
  const error = ref('')
  const currentPayoutId = ref(null)
  const currentPayoutStatus = ref('')

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
    method: '',

    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',

    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',

    termsAccepted: false,
  })

  const amount = ref('')

  const getPayoutId = computed(() => currentPayoutId.value)
  const getPayoutStatus = computed(() => currentPayoutStatus.value)

  const resetFormData = () => {
    amount.value = ''
    error.value = ''
    currentPayoutId.value = null
    currentPayoutStatus.value = ''

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
      method: '',
      cardHolderName: '',
      cardNumber: '',
      expirationDate: '',
      accountHolderFirstName: '',
      accountHolderLastName: '',
      iban: '',
      termsAccepted: false,
    }
  }

  const setAmount = value => {
    amount.value = value
  }

  const updateContactInfo = data => {
    contactInfo.value = { ...contactInfo.value, ...data }
  }

  const updatePaymentInfo = data => {
    paymentInfo.value = { ...paymentInfo.value, ...data }
  }

  const setPaymentMethod = method => {
    paymentInfo.value.method = method
  }

  const buildPayload = () => {
    const payload = {
      amount: Number(amount.value) || 0,
      name: contactInfo.value.firstName,
      surname: contactInfo.value.lastName,
      email: contactInfo.value.email,
      phone: contactInfo.value.phone,
      country: String(contactInfo.value.country || ''),
      city: contactInfo.value.city,
      postCode: contactInfo.value.postCode,
      address: contactInfo.value.address,
      withdrawType: paymentInfo.value.method,
    }

    if (paymentInfo.value.method === 'card-direct') {
      const [expireMonth = '', expireYear = ''] = String(
        paymentInfo.value.expirationDate || '',
      )
        .split('/')
        .map(v => v.trim())

      return {
        ...payload,
        card_holder_name: paymentInfo.value.cardHolderName,
        card_number: String(paymentInfo.value.cardNumber || '').replace(
          /\s/g,
          '',
        ),
        expire_month: expireMonth,
        expire_year: expireYear,
      }
    }

    if (paymentInfo.value.method === 'sepa-manual') {
      return {
        ...payload,
        first_name: paymentInfo.value.accountHolderFirstName,
        last_name: paymentInfo.value.accountHolderLastName,
        account_number: String(paymentInfo.value.iban || '').replace(/\s/g, ''),
      }
    }

    return payload
  }

  const createPayout = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const payload = buildPayload()
      const { data } = await api.post('/payouts', payload)

      if (data?.status !== 'OK') {
        throw new Error(data?.message || 'Failed to create payout')
      }

      currentPayoutId.value = data?.payout_id || data?.id || null
      currentPayoutStatus.value = data?.payout_status || ''

      if (data?.redirect_url) {
        window.location.href = data.redirect_url
        return { success: true, redirect: true, data }
      }

      toast.success(data?.message || 'Payout request submitted')
      return { success: true, data }
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create payout'

      return {
        success: false,
        error: error.value,
        validationErrors: err?.response?.data?.errors || {},
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchPayoutStatus = async payoutId => {
    try {
      isLoading.value = true
      error.value = ''

      const { data } = await api.get('/payouts/status', {
        params: { payout_id: payoutId },
      })

      if (data?.status !== 'OK') {
        throw new Error(data?.message || 'Failed to fetch payout status')
      }

      currentPayoutStatus.value = data?.payout_status || ''
      return { success: true, status: currentPayoutStatus.value }
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch payout status'

      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    amount,
    contactInfo,
    paymentInfo,
    currentPayoutId,
    currentPayoutStatus,

    getPayoutId,
    getPayoutStatus,

    resetFormData,
    setAmount,
    setPaymentMethod,
    updateContactInfo,
    updatePaymentInfo,
    buildPayload,
    createPayout,
    fetchPayoutStatus,
  }
})
