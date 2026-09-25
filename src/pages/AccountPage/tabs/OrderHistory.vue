<template>
  <div class="orders">
    <OrderGameFilter v-if="false" v-model="selectedGame" />

    <ProfileTableLayout
      show-skin-name
      show-data-column
      show-coin-amount
      hide-skin-name-label
      :show-price="false"
      :total-as-currency="false"
      :show-order-image="SHOW_ORDER_IMAGES"
      :rows="paginatedRows"
      :is-loading="isLoading"
      :empty-text="$t('No orders found')"
      :loading-text="`${$t('Loading')}...`"
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="onPageChange"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

import { usePurchaseStore } from '@/stores/purchase'

import OrderGameFilter from '../components/OrderGameFilter.vue'

const { t } = useI18n()

const purchaseStore = usePurchaseStore()

const { purchaseHistory, isHistoryLoading } = storeToRefs(purchaseStore)

const SHOW_ORDER_IMAGES = true

const ITEMS_PER_PAGE = 6

const currentPage = ref(1)
const selectedGame = ref('all')

const staticDomain = String(import.meta.env.VITE_STATIC_DOMAIN || '').replace(
  /\/+$/,
  '',
)

const isLoading = computed(() => {
  return isHistoryLoading.value
})

const normalizeImageUrl = path => {
  if (!path) {
    return ''
  }

  const value = String(path)

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (!staticDomain) {
    return value
  }

  return `${staticDomain}/${value.replace(/^\/+/, '')}`
}

const normalizeOrderStatus = raw => {
  const status = String(raw || '')
    .toLowerCase()
    .trim()

  if (
    status.includes('completed') ||
    status.includes('accepted') ||
    status.includes('sold') ||
    status.includes('success')
  ) {
    return t('Successful')
  }

  if (
    status.includes('denied') ||
    status.includes('deleted') ||
    status.includes('client refused') ||
    status.includes('payment error') ||
    status.includes('canceled') ||
    status.includes('cancelled') ||
    status.includes('error')
  ) {
    return t('Canceled')
  }

  return t('Pending')
}

const normalizeItemTitle = title => {
  return String(title || '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getOrderId = (item, index) => {
  return String(item?.order_id ?? item?.purchase_id ?? item?.id ?? index)
}

const mapPurchaseItem = (item, index) => {
  return {
    _key: item?._key || `purchase-item-${item?.item_id ?? index}`,

    orderId: String(
      item?.order_id ??
        item?.purchase_id ??
        item?.transaction_id ??
        item?.id ??
        index,
    ),

    itemId: String(item?.item_id ?? index),

    createdAt: Number(item?.createdAt ?? 0),

    status: item?.status || 'pending',

    title: normalizeItemTitle(item?.title || ''),

    category: String(item?.category || '').toLowerCase(),

    quality: item?.item_quality || item?.quality || '',

    type: item?.item_type || item?.type || '',

    fiatAmount: Number(item?.fiat_sum ?? item?.sum ?? item?.fiat_price ?? 0),

    internalAmount: Number(item?.internal_sum ?? item?.internal_price ?? 0),

    image: SHOW_ORDER_IMAGES
      ? normalizeImageUrl(item?.imageUrl || item?.img_url || item?.image_url)
      : '',

    currency: item?.fiat_currency || item?.currency || '',

    internalCurrency: item?.internal_currency || '',
  }
}

const filteredPurchaseItems = computed(() => {
  const items = purchaseHistory.value.map(mapPurchaseItem)

  if (selectedGame.value === 'all') {
    return items
  }

  return items.filter(item => item.category === selectedGame.value)
})

const groupedOrders = computed(() => {
  const orders = new Map()

  filteredPurchaseItems.value.forEach((item, index) => {
    const orderId = String(
      item.orderId || item.purchaseId || item.transactionId || item.id || index,
    )

    if (!orders.has(orderId)) {
      orders.set(orderId, {
        id: orderId,
        createdAt: item.createdAt || 0,
        status: item.status || 'pending',
        skinItems: [],
        quantity: 0,
        totalFiat: 0,
        totalInternal: 0,
        currency: item.currency || '',
        internalCurrency: item.internalCurrency || 'Credits',
      })
    }

    const order = orders.get(orderId)

    order.skinItems.push({
      id: item.itemId,
      title: item.title || '—',
      image: item.image || '',
      quality: item.quality || '',
      type: item.type || '',
      category: item.category || '',
    })

    order.quantity += 1

    order.totalFiat += Number(item.fiatAmount || 0)

    order.totalInternal += Number(item.internalAmount || 0)

    if (item.createdAt > order.createdAt) {
      order.createdAt = item.createdAt
    }

    const currentStatus = normalizeOrderStatus(order.status)
    const nextStatus = normalizeOrderStatus(item.status)

    const statusRank = status => {
      if (status === t('Canceled')) {
        return 3
      }

      if (status === t('Pending')) {
        return 2
      }

      return 1
    }

    if (statusRank(nextStatus) > statusRank(currentStatus)) {
      order.status = item.status
    }
  })

  return Array.from(orders.values()).sort((a, b) => b.createdAt - a.createdAt)
})

const allRows = computed(() => {
  return groupedOrders.value.map(order => ({
    _key: `order-${order.id}`,

    id: order.id,

    createdAt: order.createdAt,

    skinItems: order.skinItems,

    quantity: order.quantity,

    status: normalizeOrderStatus(order.status),

    amount: Number(order.totalFiat || 0),

    fiatAmount: Number(order.totalFiat || 0),

    currency: order.currency,

    internalCurrency: order.internalCurrency,
  }))
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(allRows.value.length / ITEMS_PER_PAGE))
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE

  return allRows.value.slice(start, start + ITEMS_PER_PAGE)
})

const onPageChange = page => {
  currentPage.value = page
}

watch(selectedGame, () => {
  currentPage.value = 1
})

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

onMounted(async () => {
  try {
    await purchaseStore.fetchPurchaseHistory()
  } catch {
    return
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.orders {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  width: 100%;
  min-width: 0;
}
</style>
