<template>
  <div ref="rootRef" class="balance-select">
    <button
      type="button"
      class="balance-select__trigger"
      :class="{ active: isDepositsActive }"
      :aria-current="isDepositsActive ? 'page' : null"
      @click="goToDeposits"
    >
      <div class="balance-select__label">
        <SvgIcon :icon="WalletIcon" class="balance-select__icon" />

        <div class="balance-select__text">
          <div class="balance-select__name">{{ $t('Balance') }}</div>
          <div class="balance-select__code">
            {{ formattedBalance }}
          </div>
        </div>
      </div>

      <!--<span class="balance-select__caret">
        <SvgIcon :icon="ChevronDownIcon" class="balance-select__caret-icon" />
      </span>-->
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useCurrencyStore } from '@/stores/currency'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()

const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const isDepositsActive = ref(false)

watch(
  () => route.fullPath,
  () => {
    isDepositsActive.value =
      route.name === 'account-deposits' ||
      String(route.path || '').includes('/account/deposits')
  },
  { immediate: true },
)

const currency = computed(() => currencyStore.currentCurrency || {})
const balance = computed(() => Number(userStore.userBalance) || 0)

const formattedBalance = computed(() => {
  const code = currency.value?.code || currencyStore.currentCurrencyCode
  return currencyStore.formatFiat(balance.value, code)
})

/**
 * CLICK => GO TO /account/deposits
 */
const goToDeposits = () => {
  if (isDepositsActive.value) return

  router.push({
    name: 'account-deposits',
    query: { mode: 'topup' },
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.balance-select {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include adaptiveValue('min-height', 40, 40, 1920);
    @include adaptiveValue('border-radius', 6, 6, 1920);
    @include adaptiveValue('padding-top', 5, 5, 1920);
    @include adaptiveValue('padding-bottom', 5, 5, 1920);
    @include adaptiveValue('padding-left', 10, 8, 1920);
    @include adaptiveValue('padding-right', 10, 8, 1920);
    font-family: var(--font-open-sans);
    border-style: solid;
    @include adaptiveValue('border-width', 1, 1, 1920);
    border-color: var(--bg-secondary-color);
    background: transparent;
    cursor: pointer;
    width: 100%;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-color);

        .balance-select__icon {
          color: var(--primary-color);
        }
      }
    }

    @media (any-hover: none) {
      background-color: var(--hint-color);
    }

    @media (min-width: $md5) {
      @include adaptiveValue('gap', 10, 10, 1920);
    }

    &.active {
      pointer-events: none;
      background-color: var(--hint-color);

      .balance-select__icon {
        color: var(--primary-color);
      }
    }
  }

  &__label {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 8, 8, 1920);
  }

  &__icon {
    @include adaptiveValue('min-width', 18, 18, 1920);
    @include adaptiveValue('height', 18, 18, 1920);
    align-self: center;

    @media (any-hover: hover) {
      color: var(--hint-color);
    }

    @media (any-hover: none) {
      color: var(--primary-color);
    }

    @media (max-width: $md5) {
      @include hide-item;
    }
  }

  &__name {
    @include adaptiveValue('font-size', 10, 10, 1920);
    font-weight: 400;
    color: var(--secondary-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    text-align: left;
    line-height: 1;
  }

  &__code {
    color: var(--primary-color);
    font-weight: 700;
    text-transform: uppercase;
    text-align: left;
    @include adaptiveValue('font-size', 14, 14, 1920);
  }

  &__caret {
    display: inline-flex;
    @include adaptiveValue('margin-left', 10, 10, 1920);
  }

  &__caret-icon {
    @include adaptiveValue('width', 10, 10, 1920);
    @include adaptiveValue('height', 10, 10, 1920);
    color: var(--primary-color);
  }
}
</style>
