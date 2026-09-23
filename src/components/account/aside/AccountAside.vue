<template>
  <div class="aside" v-bind="rootAttrs">
    <div class="aside__inner">
      <div v-if="userStore.userEmail" class="aside__user">
        <SvgIcon class="aside__user-icon" :icon="UserIcon" />
        <div class="aside__user-wrapper">
          <div class="aside__user-title">{{ $t('My profile') }}</div>
          <div class="aside__user-email">{{ userStore.userEmail }}</div>
        </div>
      </div>
      <div class="aside__balance">
        <div class="aside__info">
          <div class="aside__subtitle _l">{{ $t('Balance') }}</div>
          <div class="aside__box">
            <SvgIcon class="aside__info-icon" :icon="WalletIcon" />
            <span class="aside__info-text">{{ $t('My balance') }}</span>
          </div>
        </div>
        <PriceFormatter :price="balance" class="aside__price" reverse />
      </div>
      <div class="aside__actions">
        <BaseButton
          class="aside__button"
          variant="secondary"
          :active="activeSection === 'balance'"
          @click="onBalanceClick"
        >
          {{ $t('Top up') }}
        </BaseButton>
        <BaseButton
          class="aside__button aside__button_logout"
          variant="logout"
          @click="handleLogout"
        >
          <SvgIcon class="aside__button-icon" :icon="LogoutIcon" />
          <span> {{ $t('Log out') }}</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { LogoutIcon, UserIcon, WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

import { useToast } from '@/composables/useToast'
import { computed, useAttrs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const emit = defineEmits(['activate-balance'])

const props = defineProps({
  rootClass: { type: [String, Array, Object], default: '' },
  activeSection: { type: String, default: 'profile' },
})
const attrs = useAttrs()
const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const userStore = useUserStore()
const authStore = useAuthStore()

const rootAttrs = computed(() => ({
  ...attrs,
  class: [attrs.class, props.rootClass],
}))

const onBalanceClick = () => {
  emit('activate-balance')
}

const balance = computed(() => Number(userStore.userBalance) || 0)

// ---------- actions ----------
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'HomePage' })
  } catch (e) {
    console.error(e)
    toast.error(t('Failed to logout'))
  }
}

watch(
  () => authStore.isAuthenticated,
  async isAuth => {
    if (isAuth) {
      await userStore.fetchProfile()
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.aside {
  @media (min-width: $md3) {
    background-color: var(--bg-secondary-color);
    @include adaptiveValue('border-radius', 12, 10);
    @include adaptiveValue('padding', 30, 10);
    display: flex;
    align-items: center;
    @include adaptiveValue('min-height', 207, 107);
  }
  &__inner {
    flex: 1 1 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include adaptiveValue('max-width', 1225);
    width: 100%;
    margin: 0 auto;
    @include adaptiveValue('gap', 20);
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
  }
  &__user {
    display: flex;
    @include adaptiveValue('gap', 20);
    height: fit-content;
    @media (max-width: $md4) {
      flex: 0 1 50%;
    }
    &-icon {
      color: var(--hint-color);
      @include adaptiveValue('min-width', 96, 46);
      @include adaptiveValue('height', 96, 46);
    }
    &-wrapper {
      align-self: center;
    }
    &-title {
      font-weight: 700;
      @include adaptiveValue('font-size', 20, 18);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 15, 10);
      }
    }
    &-email {
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      @include adaptiveValue('max-width', 200);
    }
  }
  &__balance {
    @media (min-width: $md3) {
      display: flex;
      @include adaptiveValue('gap', 20);
      justify-content: space-between;
      align-items: center;
      flex: 0 1 31%;
      background-color: #07080a;
      @include adaptiveValue('border-radius', 12);
      @include adaptiveValue('padding', 20, 10);
      @media (max-width: $md4) {
        flex: 0 1 50%;
      }
    }
  }

  &__subtitle {
    @include adaptiveValue('font-size', 20, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10);
    }
    @media (max-width: $md3) {
      @include hide-item;
    }
  }

  &__info {
    text-transform: capitalize;
    color: var(--hint-color);
    @include adaptiveValue('gap', 4);
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    &-icon {
      color: inherit;
      @include adaptiveValue('min-width', 20);
      @include adaptiveValue('height', 20);
    }
    &-text {
      font-weight: 600;
      color: var(--hint-color);
      white-space: nowrap;
    }
  }
  &__box {
    display: flex;
    @include adaptiveValue('gap', 4);
    align-items: center;
  }
  &__price {
    :deep(.price__icon) {
      @include adaptiveValue('min-width', 27, 25);
      @include adaptiveValue('height', 27, 25);
    }
    :deep(.price__value) {
      @include adaptiveValue('font-size', 33, 27);
      font-weight: 700;
    }
  }

  &__actions {
    @media (max-width: $md2) {
      flex: 1 1 100%;
      display: flex;
      @include adaptiveValue('gap', 10);
    }
  }

  &__button {
    @include adaptiveValue('min-width', 140);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10);
    }
    @media (max-width: $md2) {
      @include adaptiveValue('max-width', 160);
    }
    &-icon {
      @include adaptiveValue('min-width', 14);
      @include adaptiveValue('height', 21);
    }
    &_logout {
    }
  }
}
</style>
