<template>
  <ProfileTableLayout
    show-type
    show-data-column
    :show-skin-name="false"
    :show-price="true"
    :show-coin-amount="false"
    :rows="paginatedRows"
    :is-loading="isLoading"
    :total-pages="totalPages"
    :current-page="currentPage"
    @update:current-page="onPageChange"
  />
</template>

<script>
let transactionsCache = null
let transactionsFetchPromise = null
</script>

<script setup>
import axios from '@/plugins/axios'
import { computed, onMounted, ref } from 'vue'

import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'
import { useCurrencyStore } from '@/stores/currency'

const currencyStore = useCurrencyStore()

const isLoading = ref(!transactionsCache)
const currentPage = ref(1)
const itemsPerPage = 6
const deposits = ref(transactionsCache || [])

const getCurrencyCode = item => {
  return (
    item.currency?.code ??
    item.currency_code ??
    item.currencyCode ??
    item.currency_name ??
    currencyStore.currentCurrencyCode
  )
}

const getCurrencyRate = currencyCode => {
  const code = String(currencyCode || '').toUpperCase()

  const currency = currencyStore.currencies.find(item => {
    return String(item.code || '').toUpperCase() === code
  })

  return Number(currency?.value) || 1
}

const formatTimestamp = value => {
  if (!value) return new Date().toISOString()

  const timestamp = Number(value)

  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp * 1000).toISOString()
  }

  return value
}

const capitalize = value => {
  const text = String(value || '').trim()

  if (!text) return ''

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const normalizeTransaction = (item, index) => {
  const currencyCode = getCurrencyCode(item)

  const originalAmount = Number(
    item.amount ?? item.sum ?? item.total ?? item.price ?? 0,
  )

  const currencySymbol =
    item.currency?.symbol ??
    currencyStore.currencies.find(
      c => c.code.toUpperCase() === currencyCode.toUpperCase(),
    )?.symbol

  return {
    _key: item.id ?? item.transaction_id ?? `transaction-${index}`,
    id: item.id ?? item.transaction_id ?? item.uuid ?? '',
    createdAt: formatTimestamp(
      item.createdAt ?? item.created_at ?? item.date ?? item.updated_at,
    ),
    type: capitalize(item.type),

    // leave amount exactly as it is now
    amount: currencyStore.formatFiat(
      originalAmount / getCurrencyRate(currencyCode),
      currencyCode,
    ),

    // NEW
    total: originalAmount,
    currencySymbol,

    currency: item.currency?.symbol ?? currencyCode,
    status: item.status ?? item.state ?? '',
  }
}

const getTransactionsPayload = data => {
  const possiblePayloads = [
    data?.payload,
    data?.transactions,
    data?.data,
    data?.items,
    data?.result,
  ]

  const payload = possiblePayloads.find(value => Array.isArray(value))

  return payload || []
}

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(deposits.value.length / itemsPerPage))
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return deposits.value
    .slice(start, end)
    .map((item, index) => normalizeTransaction(item, start + index))
})

const onPageChange = page => {
  currentPage.value = page
}

const fetchDeposits = async ({ force = false } = {}) => {
  if (transactionsCache && !force) {
    deposits.value = transactionsCache
    currentPage.value = 1
    return
  }

  isLoading.value = true

  try {
    await currencyStore.initializeCurrencies()

    if (transactionsFetchPromise) {
      deposits.value = await transactionsFetchPromise
      currentPage.value = 1
      return
    }

    transactionsFetchPromise = axios
      .get('/transactions')
      .then(res => {
        const payload = getTransactionsPayload(res?.data)

        transactionsCache = payload

        return payload
      })
      .catch(error => {
        console.error('PaymentHistory deposits fetch error:', error)

        transactionsCache = []

        return []
      })

    deposits.value = await transactionsFetchPromise
    currentPage.value = 1
  } finally {
    transactionsFetchPromise = null
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDeposits()
})
</script>
