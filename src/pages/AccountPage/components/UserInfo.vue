<template>
  <div class="info">
    <div class="info__top">
      <div class="info__content">
        <div class="info__icon-box">
          <SvgIcon class="info__icon" :icon="UserIcon" />
        </div>

        <div class="info__about">
          <div class="info__name">
            {{ fullName }}
          </div>

          <div class="info__email">
            {{ userEmail }}
          </div>
        </div>
      </div>

      <BaseButton
        class="info__log-out"
        variant="transparent"
        @click="handleLogout"
      >
        {{ $t('Log Out') }}
      </BaseButton>
    </div>

    <div class="info__balance">
      <SvgIcon :icon="WalletIcon" class="info__balance-icon" />

      <PriceFormatter
        size="size-32"
        skip-conversion
        reverse
        :price="userBalance"
        class="info__balance-number"
      />
    </div>

    <BaseButton
      v-if="showActionButton"
      class="info__button"
      @click="handleAction"
    >
      {{ actionButtonText }}
    </BaseButton>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { UserIcon, WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
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

const emit = defineEmits(['password-change', 'withdraw'])

const router = useRouter()
const { t } = useI18n()
const toast = useToast()

const userStore = useUserStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const { userEmail, fullName, userBalance } = storeToRefs(userStore)

const isProfileSection = computed(() => {
  return props.activeSection === 'profile'
})

const sepaEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payout_methods?.sepa)
})

const showActionButton = computed(() => {
  if (isProfileSection.value) {
    return true
  }

  return props.offersEnabled && sepaEnabled.value
})

const actionButtonText = computed(() => {
  if (isProfileSection.value) {
    return t('Password Change')
  }

  return t('Withdraw')
})

const handleAction = () => {
  if (isProfileSection.value) {
    emit('password-change')
    return
  }

  if (!sepaEnabled.value) {
    return
  }

  emit('withdraw')
}

const handleLogout = async () => {
  try {
    await authStore.logout()

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    console.error(error)

    toast.error(t('Failed to logout'))
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.info {
  @include adaptiveValue('padding', 40, 10);

  background-color: var(--bg-primary-color);

  border: 1px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 20, 10);

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 20px;

    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 70, 20);
    }
  }

  &__content {
    display: flex;
    flex: 1 1 0;

    min-width: 0;

    @include adaptiveValue('gap', 20, 10);
  }

  &__icon-box {
    flex: 0 0 auto;

    @include adaptiveValue('width', 55, 40);
    @include adaptiveValue('height', 55, 40);
    @include adaptiveValue('border-radius', 22, 10);

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: var(--hint-primary-color);

    color: var(--primary-color);
  }

  &__icon {
    min-width: 15px;
    width: 15px;
    height: 15px;
  }

  &__about {
    flex: 1 1 0;

    min-width: 0;

    overflow: hidden;
  }

  &__name,
  &__email {
    display: block;

    width: 100%;
    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__name {
    @include adaptiveValue('font-size', 20, 18);

    line-height: 120%;

    color: var(--primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }

  &__email {
    color: var(--secondary-color);

    line-height: 120%;
  }

  &__log-out {
    flex: 0 0 auto;

    white-space: nowrap;
  }

  &__balance {
    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--primary-color);

    @include adaptiveValue('gap', 19, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 70, 20);
    }
  }

  &__balance-icon {
    @include adaptiveValue('min-width', 32, 20);
    @include adaptiveValue('height', 32, 20);
  }

  &__balance-number {
    min-width: 0;
  }

  &__button {
    width: 100%;

    @media (max-width: $md2) {
      max-width: 346px;
      margin: 0 auto;
    }
  }
}
</style>
