<template>
  <footer class="footer">
    <div class="footer__main _cnt">
      <div class="footer__brand">
        <RouterLink :to="{ name: 'HomePage' }" class="footer__logo">
          <img src="@/assets/img/logo-full.svg" alt="OchraSkins" />
        </RouterLink>

        <p class="footer__description">
          {{ $t('A marketplace for Counter-Strike 2 items.') }}
          <br />
          {{ $t('Not affiliated with Valve Corporation.') }}
        </p>
      </div>

      <div class="footer__column">
        <div class="footer__title">
          {{ $t('Market') }}
        </div>

        <div class="footer__links">
          <template v-if="isHomePage">
            <RouterLink
              :to="{
                name: 'ProductListPage',
                query: {
                  category: 'cs2',
                },
              }"
              class="footer__link"
            >
              {{ $t('All items') }}
            </RouterLink>

            <button
              type="button"
              class="footer__link"
              @click="goToHomeSection('categories')"
            >
              {{ $t('Categories') }}
            </button>

            <button
              type="button"
              class="footer__link"
              @click="goToHomeSection('weekly-drops')"
            >
              {{ $t('Weekly drops') }}
            </button>
          </template>

          <template v-else>
            <RouterLink
              :to="{
                name: 'ProductListPage',
                query: {
                  category: 'cs2',
                },
              }"
              class="footer__link"
            >
              {{ $t('Buy skins') }}
            </RouterLink>

            <button
              v-if="isOfferEnabled"
              type="button"
              class="footer__link"
              @click="openSellSkins"
            >
              {{ $t('Sell skins') }}
            </button>
          </template>
        </div>
      </div>

      <div class="footer__column">
        <div class="footer__title">
          {{ $t('Account') }}
        </div>

        <div class="footer__links">
          <template v-if="!isAuthenticated">
            <RouterLink :to="{ name: 'LoginPage' }" class="footer__link">
              {{ $t('Sign in') }}
            </RouterLink>

            <RouterLink
              v-if="settingsStore.isRegistrationEnabled"
              :to="{ name: 'RegisterPage' }"
              class="footer__link"
            >
              {{ $t('Create account') }}
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink :to="{ name: 'account-balance' }" class="footer__link">
              {{ $t('Top up') }}
            </RouterLink>

            <RouterLink :to="{ name: 'CartPage' }" class="footer__link">
              {{ $t('Cart') }}
            </RouterLink>

            <RouterLink
              :to="{ name: 'account-payment-history' }"
              class="footer__link"
            >
              {{ $t('Payment history') }}
            </RouterLink>
          </template>

          <button
            v-if="isOfferEnabled"
            type="button"
            class="footer__link"
            @click="openSellSkins"
          >
            {{ $t('Sell your skins') }}
          </button>
        </div>
      </div>

      <div class="footer__column">
        <div class="footer__title">
          {{ $t('Support') }}
        </div>

        <div class="footer__links">
          <RouterLink :to="{ name: 'FAQ' }" class="footer__link">
            {{ $t('Help centre') }}
          </RouterLink>

          <template v-for="page in sortedStaticPages" :key="page.id">
            <button
              v-if="isCookiePage(page)"
              type="button"
              class="footer__link"
              @click="openCookieSettings"
            >
              {{ page.title }}
            </button>

            <RouterLink
              v-else
              :to="getStaticPagePath(page)"
              class="footer__link"
            >
              {{ page.title }}
            </RouterLink>
          </template>

          <RouterLink :to="{ name: 'ContactPage' }" class="footer__link">
            {{ $t('Contact us') }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="footer__separator"></div>
    <div v-if="footerImages.length" class="footer__payments _cnt">
      <div class="footer__payments-label">
        {{ $t('Payment methods') }}
      </div>

      <div class="footer__payment-list">
        <div
          v-for="method in footerImages"
          :key="method.id"
          class="footer__payment"
        >
          <img :src="method.url" alt="" />
        </div>
      </div>
    </div>

    <div class="footer__bottom _cnt">
      <div v-if="formattedCopyright" class="footer__copy">
        {{ formattedCopyright }}
      </div>

      <div v-if="socialLinks.length" class="footer__socials">
        <a
          v-for="social in socialLinks"
          :key="social.id"
          :href="social.link"
          class="footer__social"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img :src="social.img" :alt="social.title || ''" />
        </a>
      </div>

      <a v-if="supportEmail" :href="supportEmailHref" class="footer__email">
        {{ supportEmail }}
      </a>
    </div>

    <div
      v-if="formattedRequisites"
      class="footer__requisites _cnt"
      v-html="formattedRequisites"
    />
  </footer>

  <SellSkinsModal
    v-if="SHOW_SELL_SKIN_MODAL && isSellSkinsOpen && isAuthenticated"
    v-model="isSellSkinsOpen"
    @close="isSellSkinsOpen = false"
  />
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'

const SHOW_SELL_SKIN_MODAL = false

const SECTION_OFFSET = 50

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()

const emit = defineEmits(['open-cookie-settings'])

const isSellSkinsOpen = ref(false)

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

const isHomePage = computed(() => {
  return route.name === 'HomePage'
})

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const pages = computed(() => {
  return staticStore.pages || []
})

const socialLinks = computed(() => {
  return staticStore.socialLinks || []
})

const footerImages = computed(() => {
  return settingsStore.settings?.footer_images || []
})

const supportEmail = computed(() => {
  return settingsStore.supportEmail || ''
})

const supportEmailHref = computed(() => {
  return supportEmail.value ? `mailto:${supportEmail.value}` : '#'
})

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
})

const formattedCopyright = computed(() => {
  const copyright = settingsStore.settings?.copyright

  if (!copyright) {
    return ''
  }

  const year = new Date().getFullYear()

  const text = copyright
    .replace(/^©\s*\d{4}\s*/, '')
    .replace(/^©\s*/, '')
    .replace(/^\d{4}\s*/, '')
    .trim()

  return `© ${year} ${text}`
})

const getSectionTop = element => {
  return element.getBoundingClientRect().top + window.scrollY
}

const scrollToSection = async sectionId => {
  await nextTick()

  const element = document.getElementById(sectionId)

  if (!element) {
    return false
  }

  const sectionTop = getSectionTop(element)

  window.scrollTo({
    top: Math.max(0, sectionTop - SECTION_OFFSET),

    left: 0,

    behavior: 'smooth',
  })

  return true
}

const waitForSection = async (sectionId, attempts = 60) => {
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
  const hash = `#${sectionId}`

  if (isHomePage.value) {
    if (route.hash !== hash) {
      window.history.replaceState(null, '', `${route.path}${hash}`)
    }

    await scrollToSection(sectionId)

    return
  }

  await router.push({
    name: 'HomePage',
    hash,
  })

  const element = await waitForSection(sectionId)

  if (!element) {
    return
  }

  await scrollToSection(sectionId)
}

const openSellSkins = () => {
  if (!isAuthenticated.value) {
    router.push({
      name: 'LoginPage',

      query: {
        redirect: route.fullPath,
      },
    })

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

const pageSlug = page => {
  if (page?.slug) {
    return page.slug
  }

  if (page?.is_terms) {
    return 'terms-and-conditions'
  }

  if (page?.is_privacy) {
    return 'privacy-policy'
  }

  if (page?.is_cookie) {
    return 'cookie-notice'
  }

  const title = String(page?.title || '').toLowerCase()

  if (title.includes('cookie')) {
    return 'cookie-notice'
  }

  return null
}

const getStaticPagePath = page => {
  const slug = pageSlug(page)

  return slug ? `/${slug}` : '/'
}

const isCookiePage = page => {
  return page?.is_cookie === 1 || pageSlug(page) === 'cookie-notice'
}

const openCookieSettings = () => {
  emit('open-cookie-settings')
}

const sortedStaticPages = computed(() => {
  const order = ['terms-and-conditions', 'privacy-policy', 'cookie-notice']

  return [...pages.value]
    .map(page => ({
      ...page,

      __slug: pageSlug(page),
    }))
    .filter(page => page.__slug)
    .sort((a, b) => {
      return order.indexOf(a.__slug) - order.indexOf(b.__slug)
    })
})

onMounted(async () => {
  await Promise.all([
    !pages.value.length ? staticStore.fetchPages() : Promise.resolve(),

    !settingsStore.settings ? settingsStore.fetchSettings() : Promise.resolve(),

    !socialLinks.value.length &&
    typeof staticStore.fetchSocialLinks === 'function'
      ? staticStore.fetchSocialLinks()
      : Promise.resolve(),
  ])

  await nextTick()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.footer {
  position: relative;

  @include adaptiveValue('padding-top', 56, 25);
  @include adaptiveValue('padding-bottom', 50, 25);

  background-color: var(--feta);
  border-style: solid;
  border-color: var(--kelp);
  @include adaptiveValue('border-top-width', 3, 1);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  &__main {
    display: grid;
    grid-template-columns:
      minmax(240px, 1.25fr)
      repeat(3, minmax(130px, 0.7fr));

    @include adaptiveValue('column-gap', 80, 30);
    @include adaptiveValue('row-gap', 40, 30);
  }

  &__brand {
    max-width: 310px;
  }

  &__logo {
    display: block;

    width: 145px;
    height: 32px;

    margin-bottom: 20px;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
      object-position: left center;
    }
  }

  &__description {
    margin: 0;

    font-size: 14px;
    line-height: 165%;

    color: var(--soya-bean);
  }

  &__title {
    margin-bottom: 12px;

    font-size: 14px;
    line-height: 130%;
    font-weight: 700;

    color: var(--cod-gray);
  }

  &__links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 3px;
  }

  &__link {
    display: block;

    width: fit-content;

    padding: 6px 0;

    border: 0;

    background: transparent;

    font: inherit;
    font-size: 14px;
    line-height: 140%;

    text-align: left;

    color: var(--soya-bean);

    cursor: pointer;

    transition: color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }

    &.router-link-active {
      color: var(--cod-gray);
    }
  }
  &__separator {
    border-style: solid;
    border-color: var(--kelp);
    @include adaptiveValue('border-top-width', 3, 1);
    @include adaptiveValue('margin-top', 25, 18);
    @include adaptiveValue('padding-top', 25, 18);
  }
  &__payments {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 25px;
  }

  &__payments-label {
    flex: 0 0 auto;

    font-size: 12px;
    font-weight: 700;

    color: var(--soya-bean);
  }

  &__payment-list {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;

    gap: 8px;
  }

  &__payment {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 52px;
    height: 34px;

    padding: 5px 8px;

    border: 1px solid var(--cod-gray-07);
    border-radius: 8px;

    background-color: rgba(255, 255, 255, 0.4);

    img {
      display: block;

      max-width: 46px;
      max-height: 22px;

      object-fit: contain;
    }
  }

  &__bottom {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;

    gap: 25px;

    @include adaptiveValue('margin-top', 25, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__copy {
    font-size: 12px;
    line-height: 150%;

    color: var(--soya-bean);
  }

  &__socials {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 10px;
  }

  &__social {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    border: 1px solid var(--cod-gray-07);
    border-radius: 50%;

    transition:
      transform 0.2s ease,
      border-color 0.2s ease;

    img {
      width: 17px;
      height: 17px;

      object-fit: contain;
    }

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-2px);

        border-color: var(--copper);
      }
    }
  }

  &__email {
    justify-self: end;

    font-size: 12px;

    color: var(--soya-bean);

    transition: color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }
  }

  &__requisites {
    max-width: 850px;

    margin: 20px auto 0;

    font-size: 11px;
    line-height: 160%;

    text-align: center;

    color: var(--makara);
  }
}

@media (max-width: $md2) {
  .footer {
    &__main {
      grid-template-columns: repeat(3, 1fr);
    }

    &__brand {
      grid-column: 1 / -1;

      max-width: 400px;
    }
  }
}

@media (max-width: $md3) {
  .footer {
    &__main {
      grid-template-columns: repeat(2, 1fr);
    }

    &__brand {
      grid-column: 1 / -1;
    }

    &__payments {
      align-items: flex-start;
      flex-direction: column;
    }

    &__payment-list {
      justify-content: flex-start;
    }

    &__bottom {
      grid-template-columns: 1fr auto;
    }

    &__socials {
      justify-content: flex-end;
    }

    &__email {
      grid-column: 1 / -1;

      justify-self: start;
    }
  }
}

@media (max-width: $md5) {
  .footer {
    &__main {
      grid-template-columns: 1fr 1fr;
    }

    &__brand {
      grid-column: 1 / -1;
    }

    &__bottom {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }

    &__socials {
      justify-content: flex-start;
    }

    &__email {
      justify-self: auto;
    }
  }
}
</style>
