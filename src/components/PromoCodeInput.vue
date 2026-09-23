<template>
  <div class="flex w-full items-end gap-[8px]">
    <BaseInput
      v-model="promocode"
      type="text"
      :placeholder="$t('Enter promocode')"
      :disabled="
        promoCodeStore.isLoading || promoCodeStore.hasActivePromo || disabled
      "
      :readonly="promoCodeStore.hasActivePromo"
      class="flex-grow"
      label="Enter promocode:"
      @keyup.enter="handleSubmit"
    >
      <template #suffix>
        <button
          v-if="promoCodeStore.hasActivePromo"
          class="relative p-1 hover:opacity-70"
          @click="handleRemove"
          aria-label="Remove promocode"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </template>
    </BaseInput>

    <BaseButton
      class="variant-secondary min-h-[44px] min-w-[136px] py-[8px]"
      :disabled="
        promoCodeStore.isLoading ||
        disabled ||
        (!promocode && !promoCodeStore.hasActivePromo)
      "
      @click="applyPromoCode"
    >
      {{ promoCodeStore.hasActivePromo ? $t('Applied') : $t('Submit') }}
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { usePromoCodeStore } from '@/stores/promocode'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const promoCodeStore = usePromoCodeStore()
const toast = useToast()

const promocode = ref('') // Local ref to hold input value when no promo is applied

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

watch(
  () => promoCodeStore.currentPromo,
  newPromo => {
    // Sync local input ref with store when promo is applied or cleared
    if (newPromo) {
      promocode.value = newPromo.code
    } else {
      promocode.value = ''
    }
  },
  { immediate: true },
)

let unsubscribeErrorWatcher
onMounted(() => {
  // Sync local ref initially if store has a promo
  if (promoCodeStore.currentPromo) {
    promocode.value = promoCodeStore.currentPromo.code
  }
})

onUnmounted(() => {})

const applyPromoCode = async () => {
  const codeToApply = promoCodeStore.hasActivePromo
    ? promoCodeStore.currentPromo.code
    : promocode.value
  if (
    !codeToApply ||
    promoCodeStore.isLoading ||
    promoCodeStore.hasActivePromo ||
    props.disabled
  )
    return

  try {
    const result = await promoCodeStore.validatePromoCode(codeToApply)
    // The store will handle setting loading and currentPromo based on the result

    if (result.success) {
      toast.success(t('Promo code applied successfully'))
    } else {
      toast.error(result.error || t('Invalid promo code'))
    }
  } catch (error) {
    console.error('Error applying promo code:', error)
    toast.error(t('Failed to apply promo code'))
  }
}

const handleSubmit = () => {
  applyPromoCode()
}

const handleRemove = () => {
  promoCodeStore.clearPromoCode()
  // The watch handler will clear the local promocode.value
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
