<template>
  <div class="orders">
    <OrderGameFilter v-if="false" v-model="selectedGame" />

    <ProfileTableLayout
      showSkinName
      showDataColumn
      showCoinAmount
      hideSkinNameLabel
      :showPrice="false"
      :total-as-currency="false"
      :show-order-image="true"
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
import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'
import axios from '@/plugins/axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderGameFilter from '../components/OrderGameFilter.vue'

const { t } = useI18n()

const isLoading = ref(false)
const currentPage = ref(1)
const selectedGame = ref('all')
const itemsPerPage = 6

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const UI_STATUS = {
  ACCEPTED: t('Accepted'),
  PENDING: t('Pending'),
  CANCELED: t('Canceled'),
}

const GAME_LABELS = {
  cs2: t('CS2'),
  dota2: t('Dota 2'),
}

const getGameLabel = category => {
  return GAME_LABELS[String(category || '').toLowerCase()] || '—'
}

const getOrderGameLabel = skinItems => {
  const games = Array.from(
    new Set(
      skinItems
        .map(item => String(item.category || '').toLowerCase())
        .filter(Boolean),
    ),
  )

  if (games.length > 1) return t('CS2 / Dota2')

  return getGameLabel(games[0])
}

const purchases = ref([])

const normalizeOrderStatus = raw => {
  const s = String(raw || '')
    .toLowerCase()
    .trim()

  if (
    s.includes('completed') ||
    s.includes('accepted') ||
    s.includes('sold') ||
    s.includes('success')
  ) {
    return UI_STATUS.ACCEPTED
  }

  if (
    s.includes('denied') ||
    s.includes('deleted') ||
    s.includes('client refused') ||
    s.includes('payment error') ||
    s.includes('canceled') ||
    s.includes('cancelled') ||
    s.includes('error')
  ) {
    return UI_STATUS.CANCELED
  }

  return UI_STATUS.PENDING
}

const fetchOrders = async () => {
  isLoading.value = true

  try {
    const res = await axios.get('/purchase/history')
    purchases.value = Array.isArray(res?.data?.payload) ? res.data.payload : []
    currentPage.value = 1
  } catch (e) {
    console.error('OrderHistory fetch error:', e)
    purchases.value = []
  } finally {
    isLoading.value = false
  }
}

const normalizeTs = raw => {
  const n = Number(raw ?? 0)
  if (!n) return 0
  return n < 10_000_000_000 ? n * 1000 : n
}

const extractExteriorFromTitle = title => {
  const match = String(title || '').match(/\(([^)]+)\)\s*$/)
  return match ? match[1].trim() : ''
}

const normalizeItemTitle = title => {
  return String(title || '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const mapPurchaseItem = (it, idx) => {
  return {
    _key: `purchase-item-${it?.item_id ?? idx}`,
    orderId: String(it?.id ?? idx),
    itemId: String(it?.item_id ?? idx),
    createdAt: normalizeTs(it?.created_at ?? it?.date_time ?? 0),
    status: it?.status ?? 'pending',
    title: normalizeItemTitle(it?.title ?? ''),
    exterior: extractExteriorFromTitle(it?.title ?? ''),
    hero: it?.hero || '',
    category: String(it?.category || '').toLowerCase(),
    quality: it?.item_quality || '',
    type: it?.item_type || '',

    internalAmount: Number(it?.internal_sum ?? it?.internal_price ?? 0),

    fiatAmount: Number(it?.fiat_sum ?? it?.sum ?? 0),

    image: it?.img_url ? `${VITE_STATIC_DOMAIN}${it.img_url}` : '',

    currency: it?.fiat_currency || it?.currency || '',

    internalCurrency: it?.internal_currency || 'Credits',
  }
}

const filteredPurchaseItems = computed(() => {
  const items = purchases.value.map(mapPurchaseItem)

  if (selectedGame.value === 'all') {
    return items
  }

  return items.filter(item => item.category === selectedGame.value)
})

const groupedOrders = computed(() => {
  const map = new Map()

  filteredPurchaseItems.value.forEach(item => {
    const id = item.orderId

    if (!map.has(id)) {
      map.set(id, {
        id,
        createdAt: item.createdAt || Date.now(),
        status: item.status,
        skinItems: [],
        types: [],
        quantity: 0,
        totalInternal: 0,
        totalFiat: 0,
        currency: item.currency || '',
        internalCurrency: item.internalCurrency || 'Credits',
      })
    }

    const order = map.get(id)

    order.skinItems.push({
      title: item.title || '—',
      image: item.image || '',
      exterior: item.exterior || '',
      hero: item.hero || '',
      category: item.category || '',
      quality: item.quality || '',
      type: item.type || '',
    })

    order.types.push(item.type)
    order.quantity += 1
    order.totalInternal += Number(item.internalAmount ?? 0)
    order.totalFiat += Number(item.fiatAmount ?? 0)

    const nextUi = normalizeOrderStatus(item.status)
    const currUi = normalizeOrderStatus(order.status)
    const rank = s =>
      s === UI_STATUS.CANCELED ? 3 : s === UI_STATUS.PENDING ? 2 : 1

    if (rank(nextUi) > rank(currUi)) {
      order.status = item.status
    }

    if (item.createdAt && item.createdAt > order.createdAt) {
      order.createdAt = item.createdAt
    }
  })

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt)
})

const mapOrderRow = order => {
  const uniqueTypes = Array.from(new Set(order.types)).filter(Boolean)

  return {
    _key: `order-${order.id}-${selectedGame.value}`,
    id: order.id,
    createdAt: order.createdAt,
    type: uniqueTypes.join(', ') || '',
    skinItems: Array.isArray(order.skinItems) ? order.skinItems : [],
    gameLabel: getOrderGameLabel(order.skinItems || []),
    status: normalizeOrderStatus(order.status),

    amount: Number(order.totalInternal ?? 0),
    fiatAmount: Number(order.totalFiat ?? 0),

    quantity: order.quantity || 0,

    currency: order.currency,
    internalCurrency: order.internalCurrency,
  }
}
const allRows = computed(() => groupedOrders.value.map(mapOrderRow))

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(allRows.value.length / itemsPerPage))
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return allRows.value.slice(start, end)
})

const onPageChange = page => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(selectedGame, () => {
  currentPage.value = 1
})

onMounted(fetchOrders)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.orders {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
}
</style>
