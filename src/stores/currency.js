import axiosInstance from '@/plugins/axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSettingsStore } from './settings'

// Helper function to get decimal places for currencies (ISO 4217)
const getDecimalPlaces = currencyCode => {
  if (!currencyCode) return 2

  const zeroDecimal = [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ]

  const threeDecimal = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']
  const code = currencyCode.toUpperCase()

  if (zeroDecimal.includes(code)) return 0
  if (threeDecimal.includes(code)) return 3

  return 2
}

const DEBUG_PLACEHOLDER_CURRENCIES =
  String(import.meta.env.VITE_DEBUG_PLACEHOLDER_CURRENCIES || 'false') ===
  'true'

const PLACEHOLDER_CURRENCIES = [
  {
    code: 'EUR',
    value: 1,
    symbol: '€',
    available_for_withdraw: null,
    min_order_amount: null,
    default: 1,
  },
  {
    code: 'USD',
    value: 1.5,
    symbol: '$',
    available_for_withdraw: null,
    min_order_amount: null,
    default: 0,
  },
]

const FALLBACK_CURRENCY = {
  code: import.meta.env.VITE_FALLBACK_CURRENCY_CODE || 'EUR',
  value: Number(import.meta.env.VITE_FALLBACK_CURRENCY_VALUE) || 1,
  symbol: import.meta.env.VITE_FALLBACK_CURRENCY_SYMBOL || '€',
  default: 0,
}

export const useCurrencyStore = defineStore('currency', () => {
  const currencies = ref([])
  const currentCurrencyCode = ref(
    localStorage.getItem('currencyCode') || FALLBACK_CURRENCY.code,
  )
  const currentCurrencySymbol = ref(
    localStorage.getItem('currencySymbol') || FALLBACK_CURRENCY.symbol,
  )
  const isLoading = ref(false)
  const error = ref(null)

  const settingsStore = useSettingsStore()

  // --- GETTERS ---
  const currentCurrency = computed(
    () =>
      currencies.value.find(curr => curr.code === currentCurrencyCode.value) ||
      FALLBACK_CURRENCY,
  )

  const currencyOptions = computed(() =>
    currencies.value.map(curr => ({
      ...curr,
      label: curr.code,
      value: curr.code,
    })),
  )

  // --- INTERNAL CURRENCY GETTERS ---
  const isInternalCurrencyEnabled = computed(
    () => settingsStore.isInternalCurrencyEnabled,
  )

  const internalCurrency = computed(() => settingsStore.internalCurrency)

  const fiatPerInternalCredit = computed(() => {
    if (!isInternalCurrencyEnabled.value) return 1

    const internalRateEUR =
      settingsStore.internalCurrency?.exchange_rate_eur ?? 0
    const fiatRatePerEUR = currentCurrency.value?.value ?? 1

    return internalRateEUR * fiatRatePerEUR
  })

  // --- ACTIONS ---
  const getDefaultCurrencyCode = () => {
    const storedCurrencyCode = localStorage.getItem('currencyCode')

    if (
      storedCurrencyCode &&
      currencies.value.some(curr => curr.code === storedCurrencyCode)
    ) {
      return storedCurrencyCode
    }

    const defaultCurr = currencies.value.find(curr => curr.default === 1)

    return (
      defaultCurr?.code || currencies.value[0]?.code || FALLBACK_CURRENCY.code
    )
  }

  const changeCurrency = async code => {
    if (!code || code === currentCurrencyCode.value) return

    const selectedCurrency = currencies.value.find(curr => curr.code === code)

    if (selectedCurrency) {
      currentCurrencyCode.value = code
      currentCurrencySymbol.value = selectedCurrency.symbol

      localStorage.setItem('currencyCode', code)
      localStorage.setItem('currencySymbol', selectedCurrency.symbol)
    }
  }

  const applyCurrencies = async payload => {
    currencies.value = payload
    await changeCurrency(getDefaultCurrencyCode())
  }

  const fetchCurrencies = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (DEBUG_PLACEHOLDER_CURRENCIES) {
        await applyCurrencies(PLACEHOLDER_CURRENCIES)
        return
      }

      const { data } = await axiosInstance.get('currencies')

      if (data.status === 'OK' && Array.isArray(data.payload)) {
        await applyCurrencies(data.payload)
        return
      }

      throw new Error('Invalid currencies response')
    } catch (err) {
      error.value = 'Failed to load currencies'

      const fallbackList = DEBUG_PLACEHOLDER_CURRENCIES
        ? PLACEHOLDER_CURRENCIES
        : [FALLBACK_CURRENCY]

      await applyCurrencies(fallbackList)
    } finally {
      isLoading.value = false
    }
  }

  const initializeCurrencies = async () => {
    if (currencies.value.length === 0) {
      await fetchCurrencies()
    }
  }

  // --- CONVERSION & FORMATTING ---
  const creditsToFiat = credits => {
    if (!isInternalCurrencyEnabled.value) return Number(credits) || 0
    return (Number(credits) || 0) * fiatPerInternalCredit.value
  }

  const fiatToCredits = fiat => {
    if (!isInternalCurrencyEnabled.value || fiatPerInternalCredit.value === 0) {
      return Number(fiat) || 0
    }

    return (Number(fiat) || 0) / fiatPerInternalCredit.value
  }

  const formatFiat = (amount, currencyCode = currentCurrencyCode.value) => {
    const numAmount = Number(amount)

    if (isNaN(numAmount)) return '0'

    const decimals = getDecimalPlaces(currencyCode)
    return numAmount.toFixed(decimals)
  }

  return {
    // State & Getters
    currencies,
    currentCurrencyCode,
    currentCurrencySymbol,
    currentCurrency,
    currencyOptions,
    isLoading,
    error,
    isInternalCurrencyEnabled,
    internalCurrency,
    fiatPerInternalCredit,

    // Actions
    changeCurrency,
    fetchCurrencies,
    initializeCurrencies,

    // Helpers
    creditsToFiat,
    fiatToCredits,
    formatFiat,
  }
})
