<template>
  <BaseModal
    :show="show"
    @close="close"
    :wrapperClasses="['details-modal__inner']"
  >
    <div class="details">
      <LoadingSpinner v-if="isLoading" class="details__loading" />

      <div v-else-if="resultState && false" class="details__result result">
        <SvgIcon
          v-if="false"
          :icon="resultState === 'accepted' ? CheckIcon : CloseIcon"
          class="result__icon"
          :class="{
            'is-success': resultState === 'accepted',
            'is-danger': resultState === 'declined',
          }"
        />

        <div
          class="result__title _h4"
          :class="{
            'is-success': resultState === 'accepted',
            'is-danger': resultState === 'declined',
          }"
        >
          <template v-if="resultState === 'accepted'">
            {{ $t('Your request has been received successfully.') }}
          </template>
          <template v-else>
            {{ $t('We couldn’t submit your request.') }}
          </template>
        </div>

        <div class="result__text">
          <template v-if="resultState === 'accepted'">
            {{ $t('We’ll update you on its status within 3 business days.') }}
          </template>
          <template v-else>{{
            $t('Please try again or contact support if the issue continues.')
          }}</template>
        </div>
      </div>

      <div v-else-if="offer" class="details__content">
        <div class="details__title _h3">
          {{ $t('Offer Details') }}
          <div v-if="false" class="details__title-id">{{ offerId }}</div>
        </div>

        <div class="details__body">
          <div class="details__items">
            <div class="details__item">
              <div class="details__label">{{ $t('ID') }}</div>
              <div class="details__value">#{{ offerId }}</div>
            </div>

            <div class="details__item">
              <div class="details__label">{{ $t('Name') }}</div>
              <div class="details__value">{{ offerTitle }}</div>
            </div>

            <div v-if="offerGame && false" class="details__item">
              <div class="details__label">{{ $t('Game') }}</div>
              <div class="details__value details__value_bold">
                {{ offerGame }}
              </div>
            </div>
            <div class="details__item">
              <div class="details__label">{{ $t('Desired price') }}</div>
              <div class="details__value">
                {{ desiredPrice }}{{ offerCurrencySymbol }}
              </div>
            </div>
            <div v-if="offeredPrice > 0" class="details__item">
              <div class="details__label">{{ $t('Offer price') }}</div>
              <div class="details__value">
                {{ offeredPrice }} {{ offerCurrencySymbol }}
              </div>
            </div>
          </div>

          <div
            v-if="statusKey === 'awaiting_item' && companyTradeUrl"
            class="details__item details__item_link"
          >
            <div class="details__label">
              {{ $t('Send your item') }}
            </div>

            <a
              :href="companyTradeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="details__trade-link _link"
            >
              {{ companyTradeUrl }}
            </a>
          </div>

          <div v-if="false" class="details__summary">
            <div class="details__summary-label">
              {{ $t('Offered price') }}
            </div>

            <div class="details__summary-price">
              {{ offeredPrice }} {{ offerCurrencySymbol }}
            </div>
          </div>

          <div
            v-if="hasCounterOffer && statusKey === 'offer'"
            class="details__actions"
          >
            <BaseButton
              variant="primary"
              class="details__button"
              :disabled="isSubmitting"
              @click="handleOfferAccept"
            >
              {{ $t('Accept') }}
            </BaseButton>
            <BaseButton
              type="button"
              variant="gray"
              class="details__button"
              :disabled="isSubmitting"
              @click="handleOfferDecline"
            >
              {{ $t('Decline') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div v-else class="details__empty _h3">
        {{ $t('Offer details not found') }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { CheckIcon, CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useToast } from '@/composables/useToast'
import { useOfferFlowStore } from '@/stores/offerFlow'

const SHOW_RESULT_MODAL_AFTER_SUBMIT = true

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const toast = useToast()
const offerFlowStore = useOfferFlowStore()

const isSubmitting = ref(false)

const resultState = ref(null) // 'accepted', 'declined'
const closeTimer = ref(null)

const isLoading = computed(() => {
  if (resultState.value) return false
  return !!offerFlowStore.isLoading || !!offerFlowStore.loading
})

const offer = computed(() => {
  return (
    offerFlowStore.selectedOfferDetails ||
    offerFlowStore.offerDetails ||
    offerFlowStore.selectedOffer ||
    null
  )
})

const offerId = computed(() => {
  return offer.value?.order_nr || offer.value?.id || '—'
})

const statusKey = computed(() => {
  return String(offer.value?.status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
})

const companyTradeUrl = computed(() => {
  return offer.value?.company_trade_url || ''
})

const offerCurrency = computed(() => {
  return offer.value?.currency || offer.value?.fiat_currency || 'EUR'
})

const offerCurrencySymbol = computed(() => {
  if (offerCurrency.value === 'EUR') return '€'
  if (offerCurrency.value === 'USD') return '$'
  if (offerCurrency.value === 'GBP') return '£'

  return offerCurrency.value
})

const offerTitle = computed(() => {
  return String(offer.value?.title || '—')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
})

const offerGame = computed(() => {
  const type = String(
    offer.value?.type || offer.value?.game || offer.value?.category || '',
  ).toLowerCase()

  if (type === 'cs2') return t('CS2')
  if (type === 'dota2') return t('Dota 2')

  return ''
})

const desiredPrice = computed(() => {
  return Number(
    offer.value?.user_price ??
      offer.value?.user_fiat_price ??
      offer.value?.price ??
      0,
  ).toFixed(2)
})

const offeredPrice = computed(() => {
  return Number(
    offer.value?.service_price ??
      offer.value?.service_fiat_price ??
      offer.value?.fiat_price ??
      0,
  ).toFixed(2)
})

const hasCounterOffer = computed(() => {
  return Number(offeredPrice.value) > 0
})

const clearCloseTimer = () => {
  if (!closeTimer.value) return

  clearTimeout(closeTimer.value)
  closeTimer.value = null
}

const showResultAndClose = state => {
  resultState.value = state
  clearCloseTimer()

  closeTimer.value = setTimeout(() => {
    resultState.value = null
    emit('close')
  }, 4000)
}

const showToastAndClose = state => {
  const message =
    state === 'accepted'
      ? t('Offer was accepted successfully')
      : t('Offer was declined successfully')

  toast.success(message)
  emit('close')
}

const handleSubmitResult = state => {
  if (SHOW_RESULT_MODAL_AFTER_SUBMIT) {
    showResultAndClose(state)
    return
  }

  showToastAndClose(state)
}

const close = () => {
  if (isSubmitting.value) return

  clearCloseTimer()
  resultState.value = null
  emit('close')
}

const handleOfferAccept = async () => {
  if (!offer.value?.id || isSubmitting.value) return

  try {
    isSubmitting.value = true

    let success = false

    if (offerFlowStore.acceptOffer) {
      success = await offerFlowStore.acceptOffer(offer.value.id)
    } else if (offerFlowStore.acceptCounterOffer) {
      success = await offerFlowStore.acceptCounterOffer(offer.value.id)
    }

    if (!success) return

    await offerFlowStore.fetchOfferDetails(offer.value.id)

    toast.success(t('Offer was accepted successfully'))
  } catch (error) {
    toast.error(error?.message || t('Failed to accept offer'))
  } finally {
    isSubmitting.value = false
  }
}

const handleOfferDecline = async () => {
  if (!offer.value?.id || isSubmitting.value) return

  try {
    isSubmitting.value = true

    if (offerFlowStore.declineOffer) {
      await offerFlowStore.declineOffer(offer.value.id)
    } else if (offerFlowStore.declineCounterOffer) {
      await offerFlowStore.declineCounterOffer(offer.value.id)
    }

    handleSubmitResult('declined')
  } catch (error) {
    toast.error(error?.message || t('Failed to decline offer'))
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.show,
  value => {
    if (value) return

    clearCloseTimer()
    resultState.value = null
    isSubmitting.value = false
  },
)

onBeforeUnmount(() => {
  clearCloseTimer()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.details {
  width: 100%;

  &__loading,
  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    text-align: center;
  }

  &__content {
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__body {
  }

  &__items {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__item {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    @include adaptiveValue('padding', 20, 10);
    @include adaptiveValue('border-radius', 20, 10);
    &:nth-child(even) {
      background-color: var(--bg-secondary-color);
    }
    line-height: 120%;
    font-weight: 400 !important;
    &_link {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  &__label {
    color: var(--secondary-color);
  }

  &__value {
    color: var(--primary-color);
  }

  &__trade-link {
    display: inline;
    border: none;
    text-decoration: underline;
    color: var(--link-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__actions {
  }

  &__button {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 4);
    }
  }
}

.result {
  text-align: center;
  &__icon {
    min-width: 28px;
    height: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }

    &.is-success {
      color: #4cff7b;
    }

    &.is-danger {
      color: #ff4d4d;
    }
  }

  &__title {
    text-align: center;
    font-weight: 600;
    &.is-success {
      color: var(--success-color);
    }

    &.is-danger {
      color: var(--error-color);
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__text {
    text-align: center;
    font-size: 12px;
    line-height: 120%;
  }
}
</style>
