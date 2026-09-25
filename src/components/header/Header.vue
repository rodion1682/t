<template>
  <header ref="headerRef" class="header" :class="{ scrolled: isScrolled }">
    <div class="header__inner">
      <RouterLink
        :to="{ name: 'HomePage' }"
        class="header__logo _ibg-contain"
        @click="closeMobileMenu"
      >
        <img
          class="header__logo-image_desk"
          src="@/assets/img/logo-full.svg"
          alt="OchraSkins"
        />

        <img
          class="header__logo-image_mob"
          src="@/assets/img/logo-small.svg"
          alt="OchraSkins"
        />
      </RouterLink>

      <div class="header__nav nav" :class="{ open: isMobileMenuVisible }">
        <template v-if="isHomePage">
          <RouterLink
            :to="marketRoute"
            class="nav__link"
            @click="closeMobileMenu"
          >
            {{ $t('Market') }}
          </RouterLink>

          <button
            type="button"
            class="nav__link"
            :class="{ active: activeSection === 'categories' }"
            @click="goToHomeSection('categories')"
          >
            {{ $t('Categories') }}
          </button>

          <button
            type="button"
            class="nav__link"
            :class="{ active: activeSection === 'weekly-drops' }"
            @click="goToHomeSection('weekly-drops')"
          >
            {{ $t('Drops') }}
          </button>

          <button
            type="button"
            class="nav__link"
            :class="{ active: activeSection === 'how-it-works' }"
            @click="goToHomeSection('how-it-works')"
          >
            {{ $t('How it works') }}
          </button>
        </template>

        <template v-else>
          <RouterLink
            :to="marketRoute"
            class="nav__link"
            @click="closeMobileMenu"
          >
            {{ $t('Buy skins') }}
          </RouterLink>

          <button
            v-if="isOfferEnabled && isAuthenticated"
            type="button"
            class="nav__link"
            :class="{ active: isSellSkinActive }"
            @click="openSellSkinsFromNav"
          >
            {{ $t('Sell skins') }}
          </button>
        </template>
      </div>

      <div class="header__auth">
        <LanguageSwitcher
          data-da-id="header-language"
          data-da=".header__nav,619.98,first"
          class="header__language"
        />

        <CurrencyDropdown
          data-da-id="header-currency"
          data-da=".header__nav,619.98,first"
          class="header__currency"
        />

        <template v-if="isAuthenticated">
          <RouterLink
            data-da=".header__nav,519.98,first"
            :to="{ name: 'account-balance' }"
            class="header__balance balance"
            @click="closeMobileMenu"
          >
            <PriceFormatter
              class="balance__balance"
              :price="userBalanceFiat"
              skip-conversion
              reverse
              is-currency
            />

            <div class="balance__plus">
              <SvgIcon :icon="PlusIcon" class="balance__plus-icon" />
            </div>
          </RouterLink>

          <RouterLink
            :to="{ name: 'account-profile' }"
            class="header__link link"
            @click="closeMobileMenu"
          >
            {{ $t('Profile') }}
          </RouterLink>

          <RouterLink
            :to="{ name: 'CartPage' }"
            class="header__link link"
            @click="closeMobileMenu"
          >
            <div>{{ $t('Cart') }}</div>

            <div>·</div>

            <span class="link__count">
              {{ cartCount }}
            </span>
          </RouterLink>
        </template>

        <template v-else>
          <BaseButton
            variant="transparent"
            class="header__reg-button header__reg-button_login"
            @click="goToLogin"
          >
            {{ $t('Sign in') }}
          </BaseButton>

          <BaseButton
            class="header__reg-button header__reg-button_signin"
            @click="goToRegister"
          >
            {{ $t('Sign up') }}
          </BaseButton>
        </template>
      </div>

      <button
        type="button"
        class="header__icon-menu icon-menu"
        :class="{ open: isMobileMenuVisible }"
        :aria-label="$t('Menu')"
        @click="toggleMobileMenu"
      >
        <span></span>
      </button>
    </div>
  </header>

  <SellSkinsModal
    v-if="SHOW_SELL_SKIN_MODAL && isSellSkinsOpen && isAuthenticated"
    v-model="isSellSkinsOpen"
    @close="isSellSkinsOpen = false"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/header/CurrencyDropdown.vue'
import LanguageSwitcher from '@/components/header/LanguageSwitcher.vue'
import { PlusIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import { useGame } from '@/composables/useGame'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'

defineOptions({
  name: 'AppHeader',
})

const SHOW_SELL_SKIN_MODAL = false

const HOME_SECTIONS = ['categories', 'weekly-drops', 'how-it-works']

const SECTION_OFFSET = 50

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()

const { userBalanceFiat } = storeToRefs(userStore)

const { marketRoute, syncGame } = useGame()

const isMobileMenuVisible = ref(false)

const isScrolled = ref(false)

const isSellSkinsOpen = ref(false)

const isCartOpen = ref(false)

const activeSection = ref(null)

let scrollFrame = null

const isHomePage = computed(() => {
  return route.name === 'HomePage'
})

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

const cartCount = computed(() => {
  return cartStore.cartItemsCount
})

const isSellSkinActive = computed(() => {
  if (SHOW_SELL_SKIN_MODAL) {
    return isSellSkinsOpen.value
  }

  return route.name === 'SellSkisnPage'
})

const closeMobileMenu = () => {
  isMobileMenuVisible.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value
}

const goToLogin = () => {
  closeMobileMenu()

  router.push({
    name: 'LoginPage',

    query: {
      redirect: route.fullPath,
    },
  })
}

const goToRegister = () => {
  closeMobileMenu()

  router.push({
    name: 'RegisterPage',

    query: {
      redirect: route.fullPath,
    },
  })
}

const getSectionTop = element => {
  return element.getBoundingClientRect().top + window.scrollY
}

const scrollToSection = async sectionId => {
  await nextTick()

  const element = document.getElementById(sectionId)

  if (!element) {
    return
  }

  const sectionTop = getSectionTop(element)

  window.scrollTo({
    top: Math.max(0, sectionTop - SECTION_OFFSET),

    left: 0,

    behavior: 'smooth',
  })
}

const waitForSection = async (sectionId, attempts = 30) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await nextTick()

    const element = document.getElementById(sectionId)

    if (element) {
      return element
    }

    await new Promise(resolve => {
      requestAnimationFrame(resolve)
    })
  }

  return null
}

const goToHomeSection = async sectionId => {
  closeMobileMenu()

  activeSection.value = sectionId

  if (!isHomePage.value) {
    await router.push({
      name: 'HomePage',

      hash: `#${sectionId}`,
    })

    const element = await waitForSection(sectionId)

    if (!element) {
      return
    }

    await scrollToSection(sectionId)

    return
  }

  if (route.hash !== `#${sectionId}`) {
    window.history.replaceState(null, '', `${route.path}#${sectionId}`)
  }

  await scrollToSection(sectionId)
}

const updateActiveSection = () => {
  if (!isHomePage.value) {
    activeSection.value = null

    return
  }

  const activationLine = SECTION_OFFSET

  let currentSection = null

  for (const sectionId of HOME_SECTIONS) {
    const element = document.getElementById(sectionId)

    if (!element) {
      continue
    }

    const rect = element.getBoundingClientRect()

    if (rect.top <= activationLine && rect.bottom > activationLine) {
      currentSection = sectionId

      break
    }
  }

  activeSection.value = currentSection
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0

  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
  }

  scrollFrame = requestAnimationFrame(() => {
    updateActiveSection()

    scrollFrame = null
  })
}

const handleResize = () => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
  }

  scrollFrame = requestAnimationFrame(() => {
    updateActiveSection()

    scrollFrame = null
  })
}

const openSellSkinsFromNav = () => {
  closeMobileMenu()

  if (!isAuthenticated.value) {
    return
  }

  if (SHOW_SELL_SKIN_MODAL) {
    isSellSkinsOpen.value = true

    return
  }

  router.push({
    name: 'SellSkisnPage',
  })
}

const lockBodyScroll = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth || 5

  document.documentElement.style.setProperty(
    '--scrollbar-compensation',
    `${scrollbarWidth}px`,
  )

  document.body.classList.add('scroll-locked')
}

const unlockBodyScroll = () => {
  document.body.classList.remove('scroll-locked')

  document.documentElement.style.removeProperty('--scrollbar-compensation')
}

watch(
  () => route.query.category,

  category => {
    syncGame(category)
  },

  {
    immediate: true,
  },
)

watch(
  () => route.fullPath,

  async () => {
    closeMobileMenu()

    await nextTick()

    updateActiveSection()
  },
)

watch(
  [isMobileMenuVisible, isSellSkinsOpen, isCartOpen],

  ([menuOpen, sellModalOpen, cartModalOpen]) => {
    if (menuOpen || sellModalOpen || cartModalOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
)

const refreshDynamicAdapt = async () => {
  await nextTick()

  initDynamicAdapt('max')
}

watch(
  isAuthenticated,

  async value => {
    if (value) {
      await refreshDynamicAdapt()
    } else {
      destroyDynamicAdapt()
    }
  },
)

onMounted(async () => {
  await refreshDynamicAdapt()

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })

  window.addEventListener('resize', handleResize, {
    passive: true,
  })

  if (isHomePage.value && route.hash) {
    const sectionId = route.hash.replace('#', '')

    if (HOME_SECTIONS.includes(sectionId)) {
      const element = await waitForSection(sectionId)

      if (element) {
        await scrollToSection(sectionId)
      }
    }
  }
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()

  unlockBodyScroll()

  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
  }

  window.removeEventListener('scroll', handleScroll)

  window.removeEventListener('resize', handleResize)
})
</script>
<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0px);
  max-width: 1360px;
  width: 100%;
  min-width: 320px;
  transition: all 0.3s linear 0s;
  z-index: var(--header-z-index);
  border-radius: 999px;
  background-color: var(--feta);
  border-style: solid;
  border-color: var(--kelp);
  @include adaptiveValue('border-width', 3, 1);
  @include adaptiveValue('top', 16, 0, 1296, 992, 1);
  @media (max-width: $md2) {
    border-radius: 20px;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
  }
  &.scrolled {
    top: 0;
    @media (min-width: $md3) {
      .header__inner {
        padding-top: 5px;
        padding-bottom: 5px;
        min-height: 50px;
      }
    }
  }
  &__inner {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    transition: min-height 0.3s ease 0s;
    @include adaptiveValue('padding-top', 10, 5);
    @include adaptiveValue('padding-bottom', 8, 5);
    @include adaptiveValue('min-height', 63, 50, 1296, 992, 1);
    @include adaptiveValue('padding-left', 24, 10);
    @include adaptiveValue('padding-right', 24, 10);
  }

  &__logo,
  &__nav,
  &__auth {
    position: relative;
    z-index: var(--header-z-index);
  }
  &__logo {
    display: block;
    width: fit-content;
    @include adaptiveValue('min-width', 155, 90);
    @include adaptiveValue('height', 34, 20);
    @media (max-width: $md2) {
      margin-right: auto;
    }
    @media (max-width: $md7) {
      min-width: 34px;
      height: 34px;
    }
    &-image {
      &_desk {
        @media (max-width: $md7) {
          @include hide-item;
        }
      }

      &_mob {
        @media (min-width: $md7) {
          @include hide-item;
        }
      }
    }
  }

  &__nav {
    margin-right: auto;
  }

  &__auth {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__language {
  }

  &__currency {
  }

  &__balance {
  }

  &__link {
  }

  &__reg-button {
    white-space: nowrap;
    &_login {
      min-width: 57px;
    }

    &_signin {
      min-width: 85px;
    }
  }

  &__icon-menu {
  }
}

.nav {
  @media (min-width: $md2) {
    display: flex;
    align-self: stretch;
  }
  @media (max-width: $md2) {
    position: fixed;
    top: 50px;
    left: -100%;
    width: 100%;
    height: calc(100dvh - 50px);
    min-height: calc(100dvh - 50px);
    display: block;
    z-index: var(--menu-z-index);
    padding: 25px 10px 30px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transition: left 0.3s ease 0s;
    background: var(--white-janna);
    border-top: 1px solid var(--kelp);
    margin-left: 0;

    &::before {
      content: '';
      position: fixed;
      z-index: var(--header-overlay-z-index);
      top: 0;
      left: -100%;
      width: 100%;
      height: 50px;
      background-color: var(--feta);
      transition: left 0.3s ease 0s;
    }

    &.open {
      left: 0;

      &::before {
        left: 0;
      }
    }
  }

  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: transparent;
    text-transform: capitalize;
    transition: color 0.3s ease 0s;
    border-bottom: 1px solid transparent;
    padding-top: 8px;
    padding-bottom: 8px;
    @include ibm-14-700;
    @include adaptiveValue('padding-left', 14, 10, 1296, 992, 1);
    @include adaptiveValue('padding-right', 14, 10, 1296, 992, 1);
    position: relative;
    z-index: 1;
    color: var(--makara);
    &.active,
    &.router-link-active {
      pointer-events: none;
      color: var(--cod-gray);
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--cod-gray);
      }
    }

    @media (max-width: $md2) {
      height: fit-content;
      width: 100%;
      min-height: 45px;
      border-radius: 999px;
      background-color: var(--bg-primary-color);
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}

.balance {
  display: flex;
  gap: 10px;
  min-height: 40px;

  padding: 6px 6px 6px 16px;
  border-radius: 999px;
  background-color: var(--merino);
  color: var(--cod-gray);
  border: 1px solid transparent;
  transition: all 0.3s ease 0s;
  @media (any-hover: hover) {
    &:hover {
      border-color: var(--cod-gray-16);
      background-color: var(--cod-gray-07);
    }
  }
  @media (min-width: $md5) {
    width: fit-content;
  }
  @media (max-width: $md5) {
    justify-content: center;
  }
  &__balance {
    align-self: center;
  }

  &__plus {
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease 0s;
    background-color: var(--hemlock);
    color: var(--janna);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--white-rock);
        color: var(--cod-gray);
      }
    }
    &-icon {
      min-width: 8px;
      height: 8px;
    }
  }
}

.link {
  @include adaptiveValue('min-height', 36, 40);
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 8px 15px;
  @include sg-14-700;
  background-color: transparent;
  border: 1px solid var(--cod-gray-16);
  transition: background-color 0.3s ease 0s;
  @media (any-hover: hover) {
    &:hover {
      background-color: var(--cod-gray-07);
    }
  }
  &__count {
  }
}

.icon-menu {
}

.icon-menu {
  @media (min-width: $md2) {
    @include hide-item;
  }

  @media (max-width: $md2) {
    align-self: center;
    position: relative;
    min-width: 30px;
    height: 30px;
    cursor: pointer;
    z-index: 12;
    background-color: transparent;

    span,
    &::before,
    &::after {
      content: '';
      transition: all 0.3s ease 0s;
      right: 0;
      position: absolute;
      width: 100%;
      height: 2px;
      background-color: var(--cod-gray);
    }

    &::before {
      top: 20%;
    }

    &::after {
      bottom: 20%;
    }

    span {
      top: calc(50% - 1px);
    }

    &.open {
      span {
        width: 0;
      }

      &::before {
        top: calc(50% - 1px);
        transform: rotate(-45deg);
      }

      &::after {
        bottom: calc(50% - 1px);
        transform: rotate(45deg);
      }
    }
  }
}
</style>
