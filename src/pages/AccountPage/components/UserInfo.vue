<template>
  <aside class="info">
    <div class="info__user">
      <div class="info__icon-box">
        <SvgIcon class="info__icon" :icon="UserIcon" />
      </div>

      <div class="info__about">
        <div class="info__name">
          {{ displayName }}
        </div>

        <div class="info__email">
          {{ userEmail }}
        </div>
      </div>
    </div>

    <div class="info__balance">
      <SvgIcon :icon="WalletIcon" class="info__balance-icon" />

      <PriceFormatter
        class="info__balance-number"
        size="sg-32"
        :price="userBalanceFiat"
        skip-conversion
        is-currency
        reverse
      />
    </div>

    <div class="info__actions">
      <BaseButton
        class="info__button info__button_top-up"
        variant="primary"
        @click="handleTopUp"
      >
        {{ $t('Top Up Balance') }}
      </BaseButton>

      <BaseButton
        v-if="canWithdraw"
        class="info__button info__button_withdraw"
        variant="bordered"
        @click="handleWithdraw"
      >
        {{ $t('Withdraw') }}
      </BaseButton>
    </div>

    <div class="info__footer">
      <button type="button" class="info__link" @click="handlePasswordChange">
        {{ $t('Change password') }}
      </button>

      <button type="button" class="info__link" @click="handleDeleteAccount">
        {{ $t('Delete account') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { UserIcon, WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  activeSection: {
    type: String,
    default: 'profile',
  },

  offersEnabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'top-up',
  'password-change',
  'withdraw',
  'delete-account',
])

const { t } = useI18n()

const userStore = useUserStore()
const settingsStore = useSettingsStore()

const { fullName, userEmail, userBalanceFiat } = storeToRefs(userStore)

const displayName = computed(() => {
  return fullName.value || t('Name Surname')
})

const sepaEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payout_methods?.sepa)
})

const canWithdraw = computed(() => {
  return props.offersEnabled && sepaEnabled.value
})

const handleTopUp = () => {
  emit('top-up')
}

const handleWithdraw = () => {
  if (!canWithdraw.value) {
    return
  }

  emit('withdraw')
}

const handlePasswordChange = () => {
  emit('password-change')
}

const handleDeleteAccount = () => {
  emit('delete-account')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.info {
  width: 100%;

  @include adaptiveValue('padding', 30, 15);
  @include adaptiveValue('border-radius', 39, 20);

  background: var(--double-spanish-white);

  &__user {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__icon-box {
    display: flex;
    align-items: center;
    justify-content: center;

    width: fit-content;

    @include adaptiveValue('min-width', 60, 45);
    @include adaptiveValue('height', 60, 45);

    margin-bottom: 16px;

    border-radius: 18px;

    background: var(--hemlock);

    color: var(--janna);
  }

  &__icon {
    @include adaptiveValue('min-width', 28, 20);
    @include adaptiveValue('height', 28, 20);
  }

  &__about {
    width: 100%;
    min-width: 0;
  }

  &__name {
    overflow: hidden;

    width: 100%;

    @include ibm-16-700;

    color: var(--cod-gray);

    white-space: nowrap;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 5, 3);
    }
  }

  &__email {
    overflow: hidden;

    width: 100%;

    @include ibm-14-400;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__balance {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 14px;

    @include adaptiveValue('margin-top', 24, 18);
    @include adaptiveValue('margin-bottom', 24, 18);

    color: var(--cod-gray);
  }

  &__balance-icon {
    flex: 0 0 auto;

    @include adaptiveValue('min-width', 32, 24);
    @include adaptiveValue('height', 32, 24);

    color: var(--makara);
  }

  &__balance-number {
    min-width: 0;

    color: var(--cod-gray);
  }

  &__actions {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 24, 10);
  }

  &__button {
    width: 100%;

    @include adaptiveValue('min-height', 50, 40);

    border-radius: 999px;

    text-transform: uppercase;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 16px;

    margin-top: 22px;
  }

  &__link {
    padding: 0;

    border: 0;

    background: transparent;

    @include ibm-11-700;

    color: var(--rope);

    cursor: pointer;

    transition:
      color 0.2s ease,
      opacity 0.2s ease;

    &:hover {
      color: var(--copper);
    }

    &:focus-visible {
      outline: 1px solid var(--copper);
      outline-offset: 4px;
    }
  }
}

@media (max-width: $md3) {
  .info {
    max-width: none;

    &__user {
      align-items: center;

      text-align: center;
    }

    &__about {
      max-width: 400px;
    }

    &__footer {
      justify-content: center;

      gap: 32px;
    }
  }
}

@media (max-width: $md5) {
  .info {
    border-radius: 24px;

    &__footer {
      align-items: flex-start;
      flex-direction: column;

      gap: 12px;
    }
  }
}
</style>
