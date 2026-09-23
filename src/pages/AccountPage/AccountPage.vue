<template>
  <div class="profile">
    <div class="profile__inner _cnt">
      <div class="profile__title _h2">
        {{ pageTitle }}
      </div>

      <div class="profile__nav">
        <BaseButton
          class="profile__button"
          :variant="activeSection === 'profile' ? 'primary' : 'bordered'"
          :active="activeSection === 'profile'"
          @click="toggleSection('profile')"
        >
          {{ $t('Profile Settings') }}
        </BaseButton>

        <BaseButton
          class="profile__button"
          :variant="activeSection === 'balance' ? 'primary' : 'bordered'"
          :active="activeSection === 'balance'"
          @click="toggleSection('balance')"
        >
          {{ $t('My Balance') }}
        </BaseButton>

        <BaseButton
          class="profile__button"
          :variant="
            activeSection === 'payment-history' ? 'primary' : 'bordered'
          "
          :active="activeSection === 'payment-history'"
          @click="toggleSection('payment-history')"
        >
          {{ $t('Transaction History') }}
        </BaseButton>

        <BaseButton
          class="profile__button"
          :variant="activeSection === 'order-history' ? 'primary' : 'bordered'"
          :active="activeSection === 'order-history'"
          @click="toggleSection('order-history')"
        >
          {{ $t('Order History') }}
        </BaseButton>

        <BaseButton
          v-if="isOfferEnabled"
          class="profile__button"
          :variant="activeSection === 'offers' ? 'primary' : 'bordered'"
          :active="activeSection === 'offers'"
          @click="toggleSection('offers')"
        >
          {{ $t('Offer History') }}
        </BaseButton>
      </div>

      <div class="profile__content">
        <UserInfo
          class="profile__info"
          :active-section="activeSection"
          :offers-enabled="isOfferEnabled"
          @password-change="openPasswordModal"
          @withdraw="openWithdrawModal"
        />

        <div class="profile__body">
          <PaymentHistory v-if="activeSection === 'payment-history'" />

          <OrderHistory v-else-if="activeSection === 'order-history'" />

          <MyOffers v-else-if="activeSection === 'offers' && isOfferEnabled" />

          <MyBalance v-else-if="activeSection === 'balance'" />

          <PersonalInfo v-else />
        </div>
      </div>
    </div>

    <PasswordChangeModal
      v-model:show="isPasswordModalOpen"
      @close="closePasswordModal"
    />

    <ContactInfoModal
      v-model:show="isWithdrawModalOpen"
      mode="balance"
      @close="closeWithdrawModal"
    />

    <PaymentModal
      :show="modalStore.isOpen('payment')"
      :mode="modalStore.getData('payment')?.mode || 'offer'"
      :payment-method="modalStore.getData('payment')?.paymentMethod"
      :redirect-url="modalStore.getData('payment')?.redirectUrl"
      @close="modalStore.close('payment')"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'

import { useSettingsStore } from '@/stores/settings'

import UserInfo from './components/UserInfo.vue'

import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'
import { useModalStore } from '@/stores/modal'
import PasswordChangeModal from './modals/PasswordChangeModal.vue'
import MyBalance from './tabs/MyBalance.vue'
import MyOffers from './tabs/MyOffers.vue'
import OrderHistory from './tabs/OrderHistory.vue'
import PaymentHistory from './tabs/PaymentHistory.vue'
import PersonalInfo from './tabs/PersonalInfo.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const settingsStore = useSettingsStore()
const modalStore = useModalStore()
const activeSection = ref('profile')

const isPasswordModalOpen = ref(false)

const isWithdrawModalOpen = ref(false)

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const pageTitle = computed(() => {
  if (activeSection.value === 'profile') {
    return t('Profile Settings')
  }

  if (activeSection.value === 'balance') {
    return t('My Balance')
  }

  if (activeSection.value === 'payment-history') {
    return t('Transaction History')
  }

  if (activeSection.value === 'order-history') {
    return t('Order History')
  }

  if (activeSection.value === 'offers' && isOfferEnabled.value) {
    return t('Offer History')
  }

  return ''
})

const sectionPaths = {
  profile: '/account/profile',

  balance: '/account/balance',

  'payment-history': '/account/payment-history',

  'order-history': '/account/order-history',

  offers: '/account/offers',
}

const toggleSection = section => {
  if (section === 'offers' && !isOfferEnabled.value) {
    return
  }

  activeSection.value = section

  const path = sectionPaths[section]

  if (path && route.path !== path) {
    router.push(path)
  }
}

const syncActiveSection = path => {
  if (path.includes('/payment-history')) {
    activeSection.value = 'payment-history'

    return
  }

  if (path.includes('/order-history')) {
    activeSection.value = 'order-history'

    return
  }

  if (path.includes('/offers')) {
    if (isOfferEnabled.value) {
      activeSection.value = 'offers'
    } else {
      router.replace('/account/profile')
    }

    return
  }

  if (path.includes('/balance')) {
    activeSection.value = 'balance'

    return
  }

  activeSection.value = 'profile'
}

const openPasswordModal = () => {
  isWithdrawModalOpen.value = false

  isPasswordModalOpen.value = true
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}

const openWithdrawModal = () => {
  if (!isOfferEnabled.value) {
    return
  }

  isPasswordModalOpen.value = false

  isWithdrawModalOpen.value = true
}

const closeWithdrawModal = () => {
  isWithdrawModalOpen.value = false
}

watch(
  () => route.path,
  path => {
    syncActiveSection(path)
  },
  {
    immediate: true,
  },
)

watch(isOfferEnabled, enabled => {
  if (!enabled && activeSection.value === 'offers') {
    router.replace('/account/profile')
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile {
  position: relative;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  align-items: center;

  @include adaptiveValue('padding-top', 20, 25);

  @include adaptiveValue('padding-bottom', 130, 25);

  &__inner {
    width: 100%;

    align-self: center;

    margin-top: auto;
    margin-bottom: auto;
  }

  &__title {
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__nav {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 4);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }

    @media (max-width: $md2) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: $md4) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: $md7) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__button {
    min-width: 0;
  }

  &__content {
    width: 100%;

    @media (min-width: $md2) {
      display: flex;

      @include adaptiveValue('gap', 20, 10);
    }
  }

  &__info {
    height: fit-content;

    flex: 0 1 30%;
    min-width: 0;

    @media (max-width: $md2) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__body {
    display: flex;
    flex: 0 1 70%;
    flex-direction: column;

    min-width: 0;
  }
}
</style>
