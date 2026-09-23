<template>
  <BaseModal :show="show" @close="close" :wrapperClasses="['payment__inner']">
    <div class="payment">
      <div class="payment__title _l">{{ $t('CHOOSE METHOD') }}</div>

      <div class="payment__subtitle">{{ $t('Withdraw:') }}</div>

      <div class="payment__amount">
        {{ formattedAmount }}
      </div>

      <div v-if="error" class="payment__error _text-error">
        {{ error }}
      </div>

      <div class="payment__buttons">
        <BaseButton
          type="button"
          variant="hint"
          class="payment__btn"
          :disabled="isLoading"
          @click="handleCard"
        >
          {{ $t('Credit/Debit card') }}
        </BaseButton>

        <BaseButton
          type="button"
          variant="hint"
          class="payment__btn"
          :disabled="isLoading"
          @click="handleSepa"
        >
          {{ $t('SEPA') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()

const isLoading = ref(false)
const error = ref('')

const close = () => emit('close')

// ---- amount source (unchanged) ----
const modalPayload = computed(() => modalStore.getData?.('paymentMethod') || {})

const selectedOffer = computed(
  () => offerFlowStore.selectedOffer || offerFlowStore.getSelectedOffer || null,
)

const rawAmount = computed(() => {
  const fromModal = Number(modalPayload.value?.amount)
  if (Number.isFinite(fromModal) && fromModal > 0) return fromModal

  const o = selectedOffer.value
  const fromOffer = Number(o?.service_price ?? o?.user_price ?? 0)
  return Number.isFinite(fromOffer) ? fromOffer : 0
})

const currency = computed(() => {
  const fromModal = String(modalPayload.value?.currency || '').trim()
  if (fromModal) return fromModal
  return String(selectedOffer.value?.currency || '').trim()
})

const formattedAmount = computed(() => {
  const n = rawAmount.value || 0
  return `${n.toFixed(2)} ${currency.value}`.trim()
})

const handleCard = async () => {
  error.value = ''

  const offerId = selectedOffer.value?.id
  if (!offerId) {
    error.value = 'No offer selected'
    return
  }

  isLoading.value = true
  try {
    const result = await offerFlowStore.requestPayout(offerId, 'card-form')

    if (!result?.success) {
      // show ALL messages one after another
      const msgs = Array.isArray(result?.messages) ? result.messages : []

      error.value = msgs.length
        ? msgs.join('\n')
        : result?.message || 'Failed to start card payout'

      return
    }

    // success: requestPayout may redirect already
    close()
  } finally {
    isLoading.value = false
  }
}

const handleSepa = () => {
  error.value = ''
  close()

  modalStore.open('payment', {
    amount: rawAmount.value,
    currency: currency.value,
  })
}

watch(
  () => props.show,
  v => {
    if (v) error.value = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.payment {
  max-width: 410px;
  margin: 0 auto;
  text-align: center;

  &__title {
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__subtitle {
    opacity: 0.7;
    font-size: 16px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10, 8);
    }
  }

  &__amount {
    font-style: 18px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 16);
    }
  }

  &__error {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }

  &__buttons {
    display: flex;
    gap: 20px;
  }

  &__btn {
    flex: 0 1 50%;
  }
}
</style>
