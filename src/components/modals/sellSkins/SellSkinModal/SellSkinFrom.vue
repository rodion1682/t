<template>
  <div class="sell-skins">
    <form class="sell-skins__form" @submit.prevent="submit">
      <div class="sell-skins__title _h2">
        {{ $t('Sell my Skins') }}
      </div>

      <div v-if="false" class="sell-skins__trade-info">
        <div class="sell-skins__trade-label">
          {{ $t('Your Steam Trade Link:') }}
        </div>

        <a
          class="sell-skins__trade-link"
          :href="'http://steamcommunity.com/my/tradeoffers/privacy'"
          target="_blank"
          rel="noopener noreferrer"
        >
          http://steamcommunity.com/my/tradeoffers/privacy
        </a>
      </div>
      <div class="sell-skins__subtitle _l">{{ $t('Steam trade link') }}</div>
      <div class="sell-skins__inputs">
        <BaseInput
          v-model="form.item_url"
          :placeholder="$t('Trade Link')"
          :error="errors.item_url"
          class="sell-skins__input sell-skins__input_space"
          :disabled="isLoading"
        />

        <BaseSelect
          v-model="form.type"
          :placeholder="$t('Choose game')"
          :options="gameOptions"
          optionLabel="label"
          optionValue="value"
          :error="errors.type"
          class="sell-skins__input"
          :disabled="isLoading"
        />

        <BaseInput
          ref="titleInputRef"
          v-model="form.title"
          :placeholder="$t('Enter skin name')"
          :error="errors.title"
          class="sell-skins__input"
          :disabled="isLoading"
        />
        <div class="sell-skins__item">
          <div class="sell-skins__label">{{ $t('Enter your price:') }}</div>

          <BaseInput
            v-model="form.price"
            :placeholder="$t('Price')"
            :error="errors.price"
            class="sell-skins__input sell-skins__input_small"
            :disabled="isLoading"
          >
            <template #prefix>
              {{ currencySymbol }}
            </template>
          </BaseInput>
        </div>
      </div>

      <div v-if="errors.general" class="sell-skins__error _text-error">
        {{ errors.general }}
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="sell-skins__submit"
        :disabled="isLoading"
      >
        <span v-if="isLoading">{{ $t('Submitting') }}...</span>
        <span v-else>{{ $t('Submit') }}</span>
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useAuthStore } from '@/stores/auth'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['success', 'cancel'])

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const { t } = useI18n()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const titleInputRef = ref(null)
const isLoading = ref(false)

const currency = computed(() => currencyStore.currentCurrency || {})
const currencySymbol = computed(() => {
  return currency.value?.symbol || currencyStore.currentCurrencySymbol || '€'
})

const gameOptions = [
  { label: 'CS2', value: 'cs2' },
  { label: 'Dota 2', value: 'dota2' },
]

const form = reactive({
  item_url: '',
  type: '',
  title: '',
  price: '',
})

const errors = reactive({
  item_url: '',
  type: '',
  title: '',
  price: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const getCheckoutStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutStorage = data => {
  const current = getCheckoutStorage()

  localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      ...current,
      ...data,
    }),
  )
}

const getUserTradeLink = user => {
  return user?.steam_trade_link || user?.tradeLink || user?.trade_url || ''
}

const prefill = user => {
  const storage = getCheckoutStorage()

  form.item_url = norm(getUserTradeLink(user)) || norm(storage.tradeLink) || ''
}

const focusTitle = async () => {
  await nextTick()

  const input =
    titleInputRef.value?.$el?.querySelector?.('input') ||
    titleInputRef.value?.$el?.querySelector?.('textarea') ||
    titleInputRef.value?.inputRef ||
    titleInputRef.value

  input?.focus?.({
    preventScroll: true,
  })
}

const clearErrors = () => {
  errors.item_url = ''
  errors.type = ''
  errors.title = ''
  errors.price = ''
  errors.general = ''
}

const validate = () => {
  clearErrors()

  let ok = true
  const priceNum = Number(String(form.price).replace(',', '.'))

  if (!norm(form.item_url)) {
    errors.item_url = t('Steam trade link is required')
    ok = false
  }

  if (!form.type) {
    errors.type = t('Game is required')
    ok = false
  }

  if (!norm(form.title)) {
    errors.title = t('Skin name is required')
    ok = false
  }

  if (!form.price) {
    errors.price = t('Price is required')
    ok = false
  } else if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errors.price = t('Price must be a positive number')
    ok = false
  }

  return ok
}

const reset = () => {
  form.type = ''
  form.title = ''
  form.price = ''

  clearErrors()

  prefill(authStore.isAuthenticated ? userStore.user : null)
}

const cancel = () => {
  reset()
  emit('cancel')
}

const submit = async () => {
  if (!validate()) return false

  isLoading.value = true
  errors.general = ''

  try {
    const payload = {
      title: norm(form.title),
      price: norm(form.price).replace(',', '.'),
      type: form.type,
      item_url: norm(form.item_url),
      quality: 1,
    }

    saveCheckoutStorage({
      tradeLink: norm(form.item_url),
    })

    const result = await offerFlowStore.createSellOrder(payload)

    if (result?.success) {
      modalStore.open('sellConfirmation')
      reset()
      emit('success')
      return true
    }

    if (result?.validationErrors) {
      Object.keys(result.validationErrors).forEach(key => {
        errors[key] =
          result.validationErrors[key]?.[0] ||
          String(result.validationErrors[key])
      })
    }

    if (result?.error) {
      errors.general = result.error
    }

    return false
  } catch (error) {
    const apiErrors = error?.response?.data?.errors
    const message = error?.response?.data?.message || error?.message

    if (apiErrors) {
      Object.keys(apiErrors).forEach(key => {
        errors[key] = apiErrors[key]?.[0] || String(apiErrors[key])
      })
    } else if (message) {
      errors.general = message
    } else {
      errors.general = t('Failed to create offer')
    }

    return false
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile?.()
    prefill(userStore.user)
  } else {
    prefill(null)
  }
})

watch(
  () => userStore.user,
  user => {
    if (!authStore.isAuthenticated) return
    prefill(user)
  },
  { deep: true },
)

watch(
  () => form.item_url,
  value => {
    saveCheckoutStorage({
      tradeLink: norm(value),
    })

    errors.item_url = ''
  },
)

watch(
  () => form.title,
  () => {
    errors.title = ''
  },
)

watch(
  () => form.price,
  () => {
    errors.price = ''
  },
)

watch(
  () => form.type,
  () => {
    errors.type = ''
  },
)

defineExpose({
  submit,
  reset,
  cancel,
  focusTitle,
  isLoading,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell-skins {
  width: 100%;

  &__form {
    width: 100%;
  }

  &__title {
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__trade-info {
    text-align: center;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__trade-label {
    color: var(--secondary-color);

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__trade-link {
    color: var(--primary-color);
    line-height: 150%;
    overflow-wrap: anywhere;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-color);
        border-bottom: 1px solid inherit;
      }
    }
  }
  &__subtitle {
    line-height: 30px;
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }
  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 20);
    }
  }
  &__item {
    @media (min-width: $md6) {
      display: flex;
      gap: 20px;
      align-items: center;
      justify-content: space-between;
    }
  }
  &__label {
    @media (max-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
  }
  &__input {
    &_space {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 34, 14);
      }
    }
    &_small {
      @media (min-width: $md6) {
        max-width: 285px;
      }
    }
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__error {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
    width: fit-content !important;
    min-width: 180px !important;
    min-height: 45px !important;
    margin: 0 auto;
  }
}
</style>
