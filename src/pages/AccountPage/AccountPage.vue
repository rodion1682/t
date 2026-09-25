<template>
  <div class="profile">
    <div class="profile__inner _cnt">
      <div class="profile__heading">
        <div class="profile__eyebrow">
          {{ $t('Market') }}
        </div>

        <h1 class="profile__title">
          {{ pageTitle }}
        </h1>
      </div>

      <div class="profile__nav">
        <BaseButton
          class="profile__button"
          :variant="activeSection === 'profile' ? 'primary' : 'white'"
          @click="toggleSection('profile')"
        >
          {{ $t('Profile settings') }}
        </BaseButton>

        <BaseButton
          class="profile__button"
          :variant="activeSection === 'order-history' ? 'primary' : 'white'"
          @click="toggleSection('order-history')"
        >
          {{ $t('Order history') }}
        </BaseButton>

        <BaseButton
          class="profile__button"
          :variant="activeSection === 'payment-history' ? 'primary' : 'white'"
          @click="toggleSection('payment-history')"
        >
          {{ $t('Transaction history') }}
        </BaseButton>

        <BaseButton
          v-if="isOfferEnabled"
          class="profile__button"
          :variant="activeSection === 'offers' ? 'primary' : 'white'"
          @click="toggleSection('offers')"
        >
          {{ $t('Offer history') }}
        </BaseButton>
      </div>

      <div class="profile__content">
        <UserInfo
          class="profile__info"
          :active-section="activeSection"
          :offers-enabled="isOfferEnabled"
          @password-change="openPasswordModal"
          @withdraw="openWithdrawModal"
          @delete-account="openDeleteModal"
        />

        <div class="profile__body">
          <PaymentHistory v-if="activeSection === 'payment-history'" />

          <OrderHistory v-else-if="activeSection === 'order-history'" />

          <MyOffers v-else-if="activeSection === 'offers' && isOfferEnabled" />

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

    <DeleteAccountModal
      v-model:show="isDeleteModalOpen"
      @close="closeDeleteModal"
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
import PaymentModal from '@/components/modals/sellSkins/PaymentModal.vue'

import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'

import UserInfo from './components/UserInfo.vue'
import DeleteAccountModal from './modals/DeleteAccountModal.vue'
import PasswordChangeModal from './modals/PasswordChangeModal.vue'

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

const isDeleteModalOpen = ref(false)

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const pageTitle = computed(() => {
  if (activeSection.value === 'order-history') {
    return t('Order history')
  }

  if (activeSection.value === 'payment-history') {
    return t('Transaction history')
  }

  if (activeSection.value === 'offers' && isOfferEnabled.value) {
    return t('Offer history')
  }

  return t('Profile')
})

const sectionRoutes = {
  profile: 'account-profile',

  'payment-history': 'account-payment-history',

  'order-history': 'account-order-history',

  offers: 'account-offers',
}

const closeAccountModals = () => {
  isPasswordModalOpen.value = false

  isWithdrawModalOpen.value = false

  isDeleteModalOpen.value = false
}

const toggleSection = section => {
  if (section === 'offers' && !isOfferEnabled.value) {
    return
  }

  const routeName = sectionRoutes[section]

  if (!routeName) {
    return
  }

  if (route.name === routeName) {
    return
  }

  router.push({
    name: routeName,
  })
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
      router.replace({
        name: 'account-profile',
      })
    }

    return
  }

  activeSection.value = 'profile'
}

const openPasswordModal = () => {
  closeAccountModals()

  isPasswordModalOpen.value = true
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}

const openWithdrawModal = () => {
  if (!isOfferEnabled.value) {
    return
  }

  closeAccountModals()

  isWithdrawModalOpen.value = true
}

const closeWithdrawModal = () => {
  isWithdrawModalOpen.value = false
}

const openDeleteModal = () => {
  closeAccountModals()

  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
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
    router.replace({
      name: 'account-profile',
    })
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  width: 100%;

  @include adaptiveValue('padding-top', 58, 28);
  @include adaptiveValue('padding-bottom', 140, 60);

  &__inner {
    width: 100%;
  }

  &__heading {
    margin-bottom: 28px;
  }

  &__eyebrow {
    margin-bottom: 12px;

    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
  }

  &__title {
    margin: 0;

    @include sg-40-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    gap: 10px;

    margin-bottom: 34px;
  }

  &__button {
    @include adaptiveValue('padding-top', 12, 6);
    @include adaptiveValue('padding-bottom', 12, 6);
    @include adaptiveValue('padding-left', 24, 15);
    @include adaptiveValue('padding-right', 24, 15);
    width: fit-content;
    @include adaptiveValue('min-height', 50, 40);
  }

  &__content {
    display: grid;
    grid-template-columns:
      minmax(250px, 310px)
      minmax(0, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 34, 10);
  }

  &__info {
    min-width: 0;
  }

  &__body {
    min-width: 0;
  }
}

@media (max-width: $md2) {
  .profile {
    &__content {
      grid-template-columns:
        260px
        minmax(0, 1fr);

      gap: 20px;
    }
  }
}

@media (max-width: $md3) {
  .profile {
    &__heading {
      margin-bottom: 22px;
    }

    &__nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      margin-bottom: 24px;
    }

    &__button {
      width: 100%;
      min-width: 0;
    }

    &__content {
      display: flex;
      flex-direction: column;

      gap: 20px;
    }

    &__info,
    &__body {
      width: 100%;
    }
  }
}

@media (max-width: $md5) {
  .profile {
    &__nav {
      grid-template-columns: 1fr;
    }
  }
}
</style>
