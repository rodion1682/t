<template>
  <div class="offers">
    <div v-if="false" class="offers__top">
      <BaseButton
        type="button"
        variant="primary"
        icon="chevron"
        class="offers__create"
        :disabled="!isOfferEnabled"
        @click="openSellOfferModal"
      >
        {{ $t('Sell my skins') }}
      </BaseButton>

      <OffersGameFilter v-model="selectedGame" class="offers__filter" />
    </div>

    <ProfileTableLayout
      show-skin-name
      show-action
      :rows="paginatedRows"
      :is-loading="isLoading"
      :empty-text="$t('No offers found')"
      :loading-text="`${$t('Loading')}...`"
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="onPageChange"
    >
      <template #action="{ row }">
        <BaseButton
          v-if="row.statusKey === 'offer'"
          class="offers__button offers__button_offer"
          variant="bordered"
          @click="openDetailsModal(row)"
        >
          {{ $t('Offer') }}
        </BaseButton>

        <BaseButton
          v-else-if="row.statusKey === 'awaiting_item' && row.companyTradeUrl"
          class="offers__button offers__button_offer"
          variant="white"
          @click="openDetailsModal(row)"
        >
          {{ $t('Send item') }}
        </BaseButton>

        <BaseButton
          v-else-if="row.statusKey === 'ready_for_payout'"
          class="offers__button offers__button_payout"
          variant="primary"
          @click="openPayout(row)"
        >
          {{ $t('Payout') }}
        </BaseButton>

        <BaseButton
          v-else
          class="offers__button offers__button_regular"
          variant="white-bordered"
          @click="openDetailsModal(row)"
        >
          {{ $t('Details') }}
        </BaseButton>
      </template>
    </ProfileTableLayout>

    <OfferDetailsModal :show="isDetailsModalOpen" @close="closeDetailsModal" />

    <SellSkinsModal v-model="isSellSkinsOpen" @close="handleSellSkinsClose" />

    <template v-if="isOfferEnabled">
      <ContactInfoModal
        :show="modalStore.isOpen('contactInfo')"
        @close="modalStore.close('contactInfo')"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import { ErrorIcon, PendingIcon, SuccessIcon } from '@/components/icons'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import OfferDetailsModal from '@/components/modals/sellSkins/OfferDetailsModal.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'
import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'
import OffersGameFilter from '../components/OffersGameFilter.vue'

const { t } = useI18n()
const toast = useToast()

const offerFlowStore = useOfferFlowStore()
const modalStore = useModalStore()
const settingsStore = useSettingsStore()

const isLoading = ref(true)
const isDetailsModalOpen = ref(false)
const isSellSkinsOpen = ref(false)

const selectedGame = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6

const isOfferEnabled = computed(() => {
  const value = settingsStore?.settings?.offer_enabled
  return value === undefined ? true : !!value
})

const offersList = computed(() => offerFlowStore.getOffers || [])

const UI_STATUS = {
  pending: t('Pending'),
  offer: t('Offer'),
  awaiting_item: t('Awaiting Item'),
  ready_for_payout: t('Ready for Payout'),
  payout_processing: t('Payout Processing'),
  approved: t('Approved'),
  declined_by_user: t('Declined'),
  declined_by_service: t('Declined'),
}

const normalizeStatusKey = raw => {
  const value = String(raw || '')
    .trim()
    .toLowerCase()

  const normalized = value.replace(/\s+/g, '_')

  if (!normalized) return 'pending'
  if (normalized === 'declined') return 'declined_by_user'

  return normalized
}

const normalizeOfferStatus = statusKey => {
  return UI_STATUS[statusKey] || UI_STATUS.pending
}

const statusClassByKey = statusKey => {
  const value = String(statusKey || '')
    .toLowerCase()
    .trim()

  if (value === 'approved') return 'is-success'
  if (value === 'offer') return 'is-success'
  if (value === 'ready_for_payout') return 'is-success'
  if (value.startsWith('declined')) return 'is-danger'

  return 'is-warn'
}

const statusIcon = statusKey => {
  const value = String(statusKey || '')
    .toLowerCase()
    .trim()

  if (value === 'approved') return SuccessIcon
  if (value.startsWith('declined')) return ErrorIcon

  return PendingIcon
}

const toMs = value => {
  const number = Number(value ?? 0)
  if (!number) return 0

  return number < 10_000_000_000 ? number * 1000 : number
}

const extractExteriorFromTitle = title => {
  const match = String(title || '').match(/\(([^)]+)\)\s*$/)
  return match ? match[1].trim() : ''
}

const normalizeGame = value => {
  const game = String(value || '')
    .toLowerCase()
    .trim()

  if (game === 'cs2') return 'cs2'
  if (game === 'dota2') return 'dota2'

  return ''
}

const formatGameLabel = value => {
  const game = normalizeGame(value)

  if (game === 'cs2') return t('CS2')
  if (game === 'dota2') return t('Dota 2')

  return '—'
}

const mapOffer = (offer, index) => {
  const statusKey = normalizeStatusKey(offer.status ?? offer.status_display)
  const game = normalizeGame(offer.type ?? offer.game ?? offer.category)

  return {
    _key: `offer-${offer.id ?? index}`,
    id: String(offer.order_nr ?? offer.id ?? '—'),
    createdAt: toMs(offer.date_time ?? offer.created_at ?? offer.createdAt),

    game,
    gameLabel: formatGameLabel(game),

    skinItems: [
      {
        title: offer.title ?? '—',
        image: offer.img_url || '',
        exterior: offer.exterior || extractExteriorFromTitle(offer.title),
        hero: offer.hero || '',
        category: game,
        quality: offer.item_quality || offer.quality || '',
        type: offer.item_type || offer.type || '',
      },
    ],

    quantity: Number(offer.qty ?? offer.quantity ?? 1),
    total: Number(offer.user_price ?? offer.price ?? 0),
    currency: offer.currency ?? 'EUR',
    companyTradeUrl: offer.company_trade_url,
    status: normalizeOfferStatus(statusKey),
    statusKey,
    statusClass: statusClassByKey(statusKey),
    statusIcon: statusIcon(statusKey),

    _source: offer,
  }
}

const allRows = computed(() => {
  const rows = offersList.value
    .map(mapOffer)
    .sort((a, b) => b.createdAt - a.createdAt)

  if (selectedGame.value === 'all') return rows

  return rows.filter(row => row.game === selectedGame.value)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(allRows.value.length / itemsPerPage))
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return allRows.value.slice(start, end)
})

const openSellOfferModal = () => {
  if (!isOfferEnabled.value) return
  isSellSkinsOpen.value = true
}

const setSelectedOfferSafe = row => {
  const payload = row._source || row

  if (offerFlowStore.setSelectedOffer) {
    offerFlowStore.setSelectedOffer(payload)
  } else {
    offerFlowStore.selectedOffer = payload
  }
}

const openDetailsModal = async row => {
  setSelectedOfferSafe(row)
  isDetailsModalOpen.value = true

  const offerId = row._source?.id
  if (!offerId || !offerFlowStore.fetchOfferDetails) return

  try {
    await offerFlowStore.fetchOfferDetails(offerId)
  } catch (error) {
    console.error('Failed to fetch offer details:', error)
    toast.error(t('Failed to fetch offer details'))
  }
}

const handleSellSkinsClose = async () => {
  isSellSkinsOpen.value = false

  try {
    await offerFlowStore.fetchOffers()
  } catch (error) {
    console.error(error)
  }
}

const closeDetailsModal = async () => {
  isDetailsModalOpen.value = false

  try {
    await offerFlowStore.fetchOffers()
  } catch (error) {
    console.error(error)
  }
}

const openPayout = row => {
  isDetailsModalOpen.value = false
  setSelectedOfferSafe(row)
  modalStore.open('contactInfo')
}

const onPageChange = page => {
  currentPage.value = page
  isDetailsModalOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  try {
    await offerFlowStore.fetchOffers()
  } catch (error) {
    console.error(error)
    toast.error(t('Failed to fetch offers'))
  } finally {
    isLoading.value = false
  }
})

watch([offersList, selectedGame], () => {
  currentPage.value = 1
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.offers {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  &__button {
    min-height: 32px;
    padding: 8px;
    font-size: 10px;
  }
}
</style>
