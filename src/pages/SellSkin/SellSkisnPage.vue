<template>
  <AuthLayout>
    <div class="sell">
      <div class="sell__top">
        <div class="sell__title _h3">
          {{ $t('Sell Your Skin') }}
        </div>
      </div>

      <div class="sell__form">
        <BaseInput
          v-model="formData.item_url"
          :label="$t('Steam trade link:')"
          :error="formErrors.item_url"
          class="sell__field"
        />

        <BaseInput
          v-model="formData.title"
          :label="$t('Skin name')"
          :error="formErrors.title"
          class="sell__field"
        />

        <BaseSelect
          v-if="SHOW_SELECT_GAME_OPTION"
          v-model="formData.game"
          :label="$t('Choose game')"
          :options="gameOptions"
          option-label="label"
          option-value="value"
          :error="formErrors.game"
          class="sell__field"
        />

        <BaseSelect
          v-if="SHOW_SKIN_QUALITY_INPUT_OPTION"
          v-model="formData.quality"
          :label="$t('Skin quality')"
          :options="qualityOptions"
          option-label="label"
          option-value="value"
          :disabled="SHOW_SELECT_GAME_OPTION && !formData.game"
          :error="formErrors.quality"
          class="sell__field"
        />

        <BaseInput
          v-model="formData.price"
          :label="$t('Price')"
          :error="formErrors.price"
          inputmode="decimal"
          class="sell__field"
        >
          <template #suffix>
            {{ currentCurrencySymbol }}
          </template>
        </BaseInput>

        <div class="sell__terms">
          <BaseCheckbox terms v-model="termsAccepted" class="sell__checkbox" />

          <div v-if="formErrors.terms" class="sell__terms-error _text-error">
            {{ formErrors.terms }}
          </div>
        </div>

        <div v-if="formErrors.general" class="sell__error _text-error">
          {{ formErrors.general }}
        </div>

        <BaseButton
          type="button"
          variant="primary"
          class="sell__submit"
          :disabled="isLoading || !isFormValid"
          @click="handleSubmit"
        >
          <span v-if="isLoading"> {{ $t('Creating') }}... </span>

          <span v-else>
            {{ $t('Create Offer') }}
          </span>
        </BaseButton>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useToast } from '@/composables/useToast'

import AuthLayout from '@/layouts/AuthLayout.vue'
import { useCurrencyStore } from '@/stores/currency'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useUserStore } from '@/stores/user'

const SHOW_SELECT_GAME_OPTION = false
const SHOW_SKIN_QUALITY_INPUT_OPTION = true

const DEFAULT_GAME = 'cs2'

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { currentCurrencySymbol } = storeToRefs(currencyStore)

const isLoading = ref(false)
const termsAccepted = ref(false)

const getInitialGame = () => {
  return SHOW_SELECT_GAME_OPTION ? '' : DEFAULT_GAME
}

const formData = ref({
  title: '',
  price: '',
  game: getInitialGame(),
  quality: '',
  item_url: '',
})

const formErrors = ref({
  title: '',
  price: '',
  game: '',
  quality: '',
  item_url: '',
  terms: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const gameOptions = [
  {
    label: 'CS2',
    value: 'cs2',
  },
  {
    label: 'Dota 2',
    value: 'dota2',
  },
]

const cs2QualityOptions = [
  {
    label: t('Field-Tested'),
    value: 'field_tested',
  },
  {
    label: t('Battle-Scarred'),
    value: 'battle_scarred',
  },
  {
    label: t('Minimal Wear'),
    value: 'minimal_wear',
  },
  {
    label: t('Well-Worn'),
    value: 'well_worn',
  },
  {
    label: t('Factory New'),
    value: 'factory_new',
  },
  {
    label: t('Not Painted'),
    value: 'not_painted',
  },
]

const dota2QualityOptions = [
  {
    label: t('Common'),
    value: 'common',
  },
  {
    label: t('Uncommon'),
    value: 'uncommon',
  },
  {
    label: t('Rare'),
    value: 'rare',
  },
  {
    label: t('Mythical'),
    value: 'mythical',
  },
  {
    label: t('Legendary'),
    value: 'legendary',
  },
  {
    label: t('Immortal'),
    value: 'immortal',
  },
  {
    label: t('Arcana'),
    value: 'arcana',
  },
]

const activeGame = computed(() => {
  if (SHOW_SELECT_GAME_OPTION) {
    return formData.value.game
  }

  return DEFAULT_GAME
})

const qualityOptions = computed(() => {
  if (activeGame.value === 'cs2') {
    return cs2QualityOptions
  }

  if (activeGame.value === 'dota2') {
    return dota2QualityOptions
  }

  return []
})

const isPriceValid = computed(() => {
  const price = Number(formData.value.price)

  return (
    norm(formData.value.price) !== '' && Number.isFinite(price) && price > 0
  )
})

const isGameValid = computed(() => {
  if (!SHOW_SELECT_GAME_OPTION) {
    return true
  }

  return Boolean(formData.value.game)
})

const isQualityValid = computed(() => {
  if (!SHOW_SKIN_QUALITY_INPUT_OPTION) {
    return true
  }

  return Boolean(formData.value.quality)
})

const isFormValid = computed(() => {
  return Boolean(
    norm(formData.value.item_url) &&
    norm(formData.value.title) &&
    isPriceValid.value &&
    isGameValid.value &&
    isQualityValid.value &&
    termsAccepted.value,
  )
})

const getSavedCheckoutData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutTradeLink = () => {
  const data = getSavedCheckoutData()

  localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      ...data,
      tradeLink: formData.value.item_url,
    }),
  )
}

const getProfileTradeLink = user => {
  if (!user) {
    return ''
  }

  return (
    user.steam_trade_link ||
    user.tradeLink ||
    user.trade_url ||
    user.tradeUrl ||
    ''
  )
}

const prefillTradeLink = async () => {
  await userStore.fetchProfile?.()

  const profileTradeLink = getProfileTradeLink(userStore.user)

  const savedData = getSavedCheckoutData()

  formData.value.item_url = norm(profileTradeLink)
    ? profileTradeLink
    : savedData.tradeLink || ''
}

const clearFormErrors = () => {
  formErrors.value = {
    title: '',
    price: '',
    game: '',
    quality: '',
    item_url: '',
    terms: '',
    general: '',
  }
}

const resetForm = () => {
  const currentTradeLink = formData.value.item_url

  formData.value = {
    title: '',
    price: '',
    game: getInitialGame(),
    quality: '',
    item_url: currentTradeLink,
  }

  termsAccepted.value = false

  clearFormErrors()
}

const validateForm = () => {
  const errors = {}

  if (!norm(formData.value.item_url)) {
    errors.item_url = t('Steam inventory link is required')
  }

  if (SHOW_SELECT_GAME_OPTION && !formData.value.game) {
    errors.game = t('Game is required')
  }

  if (SHOW_SKIN_QUALITY_INPUT_OPTION && !formData.value.quality) {
    errors.quality = t('Quality is required')
  }

  if (!norm(formData.value.title)) {
    errors.title = t('Skin name is required')
  }

  if (!norm(formData.value.price)) {
    errors.price = t('Price is required')
  } else if (!isPriceValid.value) {
    errors.price = t('Price must be a positive number')
  }

  if (!termsAccepted.value) {
    errors.terms = t(
      'You must agree to the Terms & Conditions and Privacy Policy',
    )
  }

  return errors
}

const createPayload = () => {
  return {
    title: norm(formData.value.title),

    price: Number(formData.value.price),

    item_url: norm(formData.value.item_url),

    ...(SHOW_SELECT_GAME_OPTION && {
      type: formData.value.game,
    }),

    ...(!SHOW_SELECT_GAME_OPTION &&
      SHOW_SKIN_QUALITY_INPUT_OPTION && {
        type: DEFAULT_GAME,
      }),

    ...(SHOW_SKIN_QUALITY_INPUT_OPTION && {
      quality: formData.value.quality,
    }),
  }
}

const handleSubmit = async () => {
  if (isLoading.value) {
    return
  }

  clearFormErrors()

  const errors = validateForm()

  if (Object.keys(errors).length) {
    formErrors.value = {
      ...formErrors.value,
      ...errors,
    }

    return
  }

  try {
    isLoading.value = true

    saveCheckoutTradeLink()

    const payload = createPayload()

    const result = await offerFlowStore.createSellOrder(payload)

    if (result?.success) {
      resetForm()

      toast.success(t('Offer created successfully'))

      await router.push({
        name: 'account-offers',
      })

      return
    }

    if (result?.validationErrors) {
      Object.entries(result.validationErrors).forEach(([key, messages]) => {
        if (key in formErrors.value) {
          formErrors.value[key] = messages?.[0] || ''
        }
      })
    }

    if (result?.error) {
      formErrors.value.general = result.error
    }
  } catch (error) {
    console.error('Error creating offer:', error)

    const apiErrors = error?.response?.data?.errors

    const apiMessage = error?.response?.data?.message

    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, messages]) => {
        if (key in formErrors.value) {
          formErrors.value[key] = messages?.[0] || ''
        }
      })

      return
    }

    formErrors.value.general =
      apiMessage || error?.message || t('Failed to create offer')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => formData.value.game,
  (newGame, oldGame) => {
    if (!SHOW_SELECT_GAME_OPTION) {
      return
    }

    if (newGame === oldGame) {
      return
    }

    formData.value.quality = ''
    formErrors.value.quality = ''
  },
)

watch(
  () => formData.value.item_url,
  () => {
    saveCheckoutTradeLink()
  },
)

watch(termsAccepted, value => {
  if (value) {
    formErrors.value.terms = ''
  }
})

onMounted(async () => {
  await prefillTradeLink()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell {
  position: relative;
  z-index: 3;

  width: 100%;
  max-width: 466px;

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 20);
    }
  }

  &__title {
    color: var(--primary-color);

    font-weight: 700;
    text-transform: uppercase;
  }

  &__form {
    width: 100%;
  }

  &__field {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__terms {
    width: 100%;

    @include adaptiveValue('margin-top', 5, 0);

    @include adaptiveValue('margin-bottom', 30, 20);
  }

  &__checkbox {
    align-items: flex-start;
  }

  &__terms-text {
    color: var(--secondary-color);

    font-size: 14px;
    line-height: 150%;
  }

  &__terms-link {
    color: var(--hint-primary-color);

    border-bottom: 1px solid transparent;

    transition: border-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: currentColor;
      }
    }
  }

  &__terms-error {
    margin-top: 6px;
  }

  &__error {
    margin-bottom: 8px;
  }

  &__submit {
    width: 100%;

    @include adaptiveValue('min-height', 50, 40);
  }
}
</style>
