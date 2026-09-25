<template>
  <aside class="checkout">
    <h2 class="checkout__title">
      {{ $t('Confirm your order') }}
    </h2>

    <!-- ORDER -->
    <div class="checkout__order">
      <div
        v-for="row in cartStore.items"
        :key="row.item_id"
        class="checkout__order-item"
      >
        <div class="checkout__order-info">
          <div class="checkout__order-title">
            {{ getTitle(row.item) }}
          </div>

          <div v-if="getExterior(row.item)" class="checkout__order-exterior">
            {{ getExterior(row.item) }}
          </div>
        </div>

        <PriceFormatter
          :price="getPrice(row.item)"
          reverse
          skip-conversion
          is-currency
          class="checkout__order-price"
        />
      </div>
    </div>

    <!-- TOTAL -->
    <div class="checkout__summary">
      <div class="checkout__count">
        {{ cartStore.cartItemsCount }}
        {{ $t('items in the cart') }}
      </div>

      <div class="checkout__total">
        <span class="checkout__total-label">
          {{ $t('Total:') }}
        </span>

        <PriceFormatter
          :price="cartStore.cartTotal"
          reverse
          skip-conversion
          is-currency
          size="sg-32"
          class="checkout__total-price"
        />
      </div>
    </div>

    <div class="checkout__section">
      <div class="checkout__section-head">
        <div class="checkout__section-title">
          {{ $t('Steam Trade URL') }}
        </div>

        <span class="checkout__required">
          {{ $t('Required') }}
        </span>
      </div>

      <BaseInput
        v-model="tradeLink"
        class="checkout__trade"
        :error="tradeLinkError"
        :disabled="isSubmitting"
        :placeholder="$t('Paste your Steam trade link')"
        @blur="saveTradeLink"
        @input="clearTradeLinkError"
      />

      <p class="checkout__hint">
        {{ $t('We use this link to deliver your purchased skins.') }}
      </p>
    </div>

    <div v-if="!hasEnoughBalance" class="checkout__warning">
      <div class="checkout__warning-head">
        <span class="checkout__warning-icon"> ! </span>

        <strong>
          {{ $t('Not enough funds!') }}
        </strong>
      </div>

      <p class="checkout__warning-text">
        {{ $t('You need') }}

        <PriceFormatter
          :price="missingAmount"
          reverse
          skip-conversion
          is-currency
          class="checkout__warning-price"
        />

        {{ $t('more to pay for this order.') }}
      </p>

      <BaseButton
        type="button"
        class="checkout__topup"
        @click="emit('top-up-click')"
      >
        {{ $t('Top up balance') }}
      </BaseButton>
    </div>

    <!-- ERROR -->
    <div v-if="submitError" class="checkout__error _text-error">
      {{ submitError }}
    </div>

    <!-- PAY FROM BALANCE -->
    <BaseButton
      type="button"
      class="checkout__pay"
      :disabled="!canSubmit || isSubmitting"
      @click="submit"
    >
      <template v-if="isSubmitting">
        {{ $t('Processing...') }}
      </template>

      <template v-else>
        {{ $t('Pay from balance') }}
      </template>
    </BaseButton>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { usePurchaseStore } from '@/stores/purchase'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['top-up-click'])

const { t } = useI18n()

const router = useRouter()
const toast = useToast()

const authStore = useAuthStore()
const cartStore = useCartStore()
const purchaseStore = usePurchaseStore()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()

const { userBalance } = storeToRefs(userStore)

const isSubmitting = ref(false)

const tradeLink = ref('')
const tradeLinkError = ref('')
const submitError = ref('')

/* =========================
   BALANCE
========================= */

const balance = computed(() => {
  const value = Number(userBalance.value ?? 0)

  return Number.isFinite(value) ? value : 0
})

const total = computed(() => {
  const value = Number(cartStore.cartTotal ?? 0)

  return Number.isFinite(value) ? value : 0
})

const missingAmount = computed(() => {
  return Math.max(0, total.value - balance.value)
})

const hasEnoughBalance = computed(() => {
  return balance.value >= total.value
})

/* =========================
   CURRENCY
========================= */

const currencyCode = computed(() => {
  return (
    currencyStore.currentCurrency?.code || currencyStore.currency?.code || 'EUR'
  )
})

/* =========================
   PRODUCT HELPERS
========================= */

const getTitle = item => {
  return String(item?.title || item?.name || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getExterior = item => {
  const direct = item?.exterior_name || item?.exterior

  if (direct) {
    return direct
  }

  const match = String(item?.title || '').match(/\(([^)]+)\)\s*$/)

  return match?.[1] || item?.quality || ''
}

const getPrice = item => {
  const value = Number(item?.internal_price ?? item?.price ?? 0)

  return Number.isFinite(value) ? value : 0
}

/* =========================
   TRADE LINK
========================= */

const clearTradeLinkError = () => {
  if (tradeLinkError.value) {
    tradeLinkError.value = ''
  }
}

const validateTradeLink = () => {
  const value = tradeLink.value.trim()

  if (!value) {
    tradeLinkError.value = t('Steam Trade URL is required')

    return false
  }

  tradeLinkError.value = ''

  return true
}

const saveTradeLink = async () => {
  if (!authStore.isAuthenticated || !validateTradeLink()) {
    return false
  }

  const value = tradeLink.value.trim()

  if (value === userStore.user?.steam_trade_link) {
    return true
  }

  try {
    await userStore.updateSteamTradeLink(value)

    return true
  } catch (error) {
    tradeLinkError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to save Steam Trade URL')

    return false
  }
}

/* =========================
   CAN PAY
========================= */

const canSubmit = computed(() => {
  if (cartStore.isEmpty) {
    return false
  }

  if (!tradeLink.value.trim()) {
    return false
  }

  if (!hasEnoughBalance.value) {
    return false
  }

  return true
})

/* =========================
   PAYLOAD
========================= */

const buildPayload = () => {
  return {
    steamId: userStore.user?.steamid,

    tradeUrl: tradeLink.value.trim(),

    paymentMethod: 'balance',

    paymentType: 'balance',

    directPayment: false,

    currency: currencyCode.value,
  }
}

/* =========================
   SUBMIT
========================= */

const submit = async () => {
  if (isSubmitting.value || cartStore.isEmpty) {
    return
  }

  submitError.value = ''

  if (!validateTradeLink()) {
    return
  }

  if (!hasEnoughBalance.value) {
    return
  }

  try {
    isSubmitting.value = true

    const tradeLinkSaved = await saveTradeLink()

    if (!tradeLinkSaved) {
      return
    }

    const result = await purchaseStore.purchaseCartItems(buildPayload())

    if (!result.success) {
      throw new Error(result.error || t('An error occurred during checkout'))
    }

    if (result.redirect_url) {
      window.location.href = result.redirect_url

      return
    }

    await router.push({
      name: 'SuccessPaymentPage',
    })
  } catch (error) {
    const message = error?.message || t('An error occurred during checkout')

    submitError.value = message

    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

/* =========================
   USER
========================= */

const prefillUser = () => {
  const user = userStore.user

  if (!user) {
    return
  }

  if (!tradeLink.value && user.steam_trade_link) {
    tradeLink.value = user.steam_trade_link
  }
}

const init = async () => {
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile()
  }

  prefillUser()
}

onMounted(init)

watch(
  () => userStore.user,
  () => {
    prefillUser()
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.checkout {
  position: sticky;

  top: 90px;

  @include adaptiveValue('padding', 30, 15);

  @include adaptiveValue('border-radius', 38, 20);

  background: var(--double-spanish-white);

  &__title {
    @include ibm-16-700;
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }

  &__order {
    display: flex;
    flex-direction: column;

    gap: 18px;

    border-bottom: 2px solid var(--sisal);
    @include adaptiveValue('padding-bottom', 22, 18);
  }

  &__order-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 20px;
  }

  &__order-info {
    min-width: 0;
  }

  &__order-title {
    overflow: hidden;

    @include ibm-14-400;

    color: var(--cod-gray);

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__order-exterior {
    margin-top: 3px;

    @include ibm-13-700;

    color: var(--kelp);
    text-transform: capitalize;
  }

  &__order-price {
    flex: 0 0 auto;
    font-weight: 700;
    color: var(--cod-gray);
  }

  &__summary {
    @include adaptiveValue('padding-top', 22, 18);
    @include adaptiveValue('padding-bottom', 22, 18);

    border-bottom: 2px solid var(--sisal);
  }

  &__count {
    margin-bottom: 8px;

    @include ibm-12-400;

    color: var(--makara);
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;
  }

  &__total-label {
    @include ibm-13-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__total-price {
    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__section {
    @include adaptiveValue('padding-top', 22, 18);
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;

    margin-bottom: 10px;
  }

  &__section-title {
    @include ibm-12-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__required {
    @include ibm-11-700;

    color: var(--copper);
  }

  &__trade {
    width: 100%;
  }

  &__hint {
    margin: 8px 0 0;

    @include ibm-14-400;

    color: var(--makara);
  }

  &__balance {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    margin-top: 24px;

    padding: 18px;

    border: 1px solid var(--cod-gray-07);

    border-radius: 18px;

    background: var(--merino);
  }

  &__balance-info {
    display: flex;
    flex-direction: column;

    min-width: 0;

    gap: 4px;
  }

  &__balance-label {
    @include ibm-12-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__balance-hint {
    @include ibm-12-400;

    color: var(--makara);
  }

  &__balance-value {
    flex: 0 0 auto;

    @include sg-20-700;

    color: var(--cod-gray);
  }

  &__warning {
    @include adaptiveValue('margin-top', 22, 18);

    @include adaptiveValue('padding', 20, 15);

    border: 2px solid var(--tuscany);

    @include adaptiveValue('border-radius', 28, 20);

    background: rgba(255, 249, 242, 0.72);
  }

  &__warning-head {
    display: flex;
    align-items: center;

    gap: 10px;

    @include ibm-14-700;

    color: var(--hairy-heath);
  }

  &__warning-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 22px;

    width: 22px;
    height: 22px;

    border-radius: 50%;

    background: var(--rope);

    color: var(--janna);

    font-size: 14px;
    line-height: 1;
    font-weight: 700;
  }

  &__warning-text {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;

    gap: 4px;

    margin: 16px 0;

    @include ibm-13-700;
    font-weight: 400;

    color: var(--hairy-heath);
  }

  &__warning-price {
    font-weight: inherit;

    color: var(--hairy-heath);
  }

  &__topup {
    width: fit-content;
  }

  &__error {
    margin-top: 16px;
  }

  &__pay {
    width: 100%;

    margin-top: 20px;

    &:disabled {
      opacity: 0.5;

      cursor: default;
    }
  }
}

@media (max-width: $md2) {
  .checkout {
    padding: 22px;
  }
}

@media (max-width: $md3) {
  .checkout {
    position: static;

    padding: 24px;

    border-radius: 24px;
  }
}

@media (max-width: $md5) {
  .checkout {
    margin-right: -10px;
    margin-left: -10px;

    padding: 18px 14px;

    border-radius: 20px;

    &__balance {
      align-items: flex-start;
      flex-direction: column;

      gap: 12px;

      padding: 15px;

      border-radius: 16px;
    }

    &__warning {
      border-radius: 17px;
    }
  }
}
</style>
