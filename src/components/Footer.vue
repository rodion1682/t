<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <div class="footer__info">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="footer__logo _ibg-contain"
        >
          <img src="@/assets/img/logo-full.svg" />
        </RouterLink>
        <div
          v-if="formattedRequisites"
          class="footer__requisites"
          v-html="formattedRequisites"
        />
      </div>
      <div class="footer__links">
        <div class="footer__label">{{ $t('Market') }}</div>
        <template v-if="true">
          <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
            {{ $t('All items') }}
          </RouterLink>
          <button type="button" class="footer__link">
            {{ $t('Categories') }}
          </button>
          <button type="button" class="footer__link">
            {{ $t('Weekly drops') }}
          </button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
            {{ $t('Buy skins') }}
          </RouterLink>
          <button
            v-if="isOfferEnabled && false"
            type="button"
            class="footer__link"
            :class="{ active: isSellSkinActive }"
            @click="openSellSkins"
          >
            {{ $t('Sell Skins') }}
          </button>
        </template>

        <RouterLink v-if="false" :to="{ name: 'FAQ' }" class="footer__link">
          {{ $t('FAQ') }}
        </RouterLink>
        <RouterLink
          v-if="false"
          :to="{ name: 'ContactPage' }"
          class="footer__link"
        >
          {{ $t('Contact us') }}
        </RouterLink>
        <RouterLink
          v-if="false"
          :to="{ name: 'HomePage' }"
          class="footer__link"
        >
          {{ $t('Home') }}
        </RouterLink>
      </div>
      <div class="footer__links">
        <div class="footer__label">{{ $t('Account') }}</div>
        <template></template>
      </div>
      <div class="footer__top">
        <div v-if="sortedStaticPages.length" class="footer__links">
          <template v-for="page in sortedStaticPages" :key="page.id">
            <button
              v-if="isCookiePage(page)"
              type="button"
              class="footer__link footer__link_button"
              @click="openCookieSettings"
            >
              {{ page.title }}
            </button>
            <RouterLink
              v-else
              :to="getStaticPagePath(page)"
              class="footer__link"
              :class="{ active: isStaticPageActive(page) }"
            >
              {{ page.title }}
            </RouterLink>
          </template>
        </div>

        <div class="footer__about">
          <a :href="supportEmailHref" class="footer__email">
            <SvgIcon :icon="EmailIcon" class="footer__email-icon" />
            <span>{{ supportEmail }}</span>
          </a>
          <div v-if="socialLinks.length" class="footer__socials">
            <a
              v-for="social in socialLinks"
              :key="social.id"
              :href="social.link"
              class="footer__socials-link _ibg-contain"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img :src="social.img" />
            </a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <div v-if="formattedCopyright" class="footer__copy">
          {{ formattedCopyright }}
        </div>
        <div
          v-if="formattedRequisites"
          class="footer__requisites"
          v-html="formattedRequisites"
          data-da-id="footer-requisites"
          data-da=".footer__info,991.98"
        />
        <div v-if="footerImages.length" class="footer__methods">
          <div
            v-for="method in footerImages"
            :key="method.id"
            class="footer__method _ibg-contain"
          >
            <img :src="method.url" alt="" />
          </div>
        </div>
      </div>
    </div>
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

import { EmailIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const SHOW_SELL_SKIN_MODAL = false

const emit = defineEmits(['open-cookie-settings'])

const route = useRoute()
const router = useRouter()

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const isSellSkinsOpen = ref(false)

const pages = computed(() => {
  return staticStore.pages || []
})

const socialLinks = computed(() => {
  return staticStore.socialLinks || []
})

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const isSellSkinActive = computed(() => {
  if (SHOW_SELL_SKIN_MODAL) {
    return isSellSkinsOpen.value
  }

  return route.name === 'SellSkisnPage'
})

const supportEmail = computed(() => {
  return settingsStore.supportEmail || ''
})

const supportEmailHref = computed(() => {
  return supportEmail.value ? `mailto:${supportEmail.value}` : '#'
})

const footerImages = computed(() => {
  return settingsStore.settings?.footer_images || []
})

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
})

const formattedCopyright = computed(() => {
  const copyright = settingsStore.settings?.copyright

  if (!copyright) return ''

  const year = new Date().getFullYear()

  const text = copyright
    .replace(/^©\s*\d{4}\s*/, '')
    .replace(/^©\s*/, '')
    .replace(/^\d{4}\s*/, '')
    .trim()

  return `© ${year} ${text}`
})

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

/*
 * ==============================
 * STATIC PAGES
 * ==============================
 */

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

const isStaticPageActive = page => {
  const currentSlug = route.params.slug

  return typeof currentSlug === 'string' && currentSlug === pageSlug(page)
}

/*
 * Check if this static page is the Cookie Notice.
 */
const isCookiePage = page => {
  return page?.is_cookie === 1 || pageSlug(page) === 'cookie-notice'
}

/*
 * Instead of routing to Cookie Notice,
 * ask the parent/global layout to open
 * Cookie settings modal.
 */
const openCookieSettings = () => {
  emit('open-cookie-settings')
}

/*
 * Privacy -> Cookie -> Terms
 */
const sortedStaticPages = computed(() => {
  const order = ['privacy-policy', 'cookie-notice', 'terms-and-conditions']

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

/*
 * ==============================
 * INIT
 * ==============================
 */

onMounted(async () => {
  await Promise.all([
    !pages.value.length ? staticStore.fetchPages() : Promise.resolve(),

    !settingsStore.settings ? settingsStore.fetchSettings() : Promise.resolve(),

    typeof staticStore.fetchSocialLinks === 'function' &&
    !socialLinks.value.length
      ? staticStore.fetchSocialLinks()
      : Promise.resolve(),
  ])

  await nextTick()

  initDynamicAdapt('max')
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.footer {
  @include adaptiveValue('padding-top', 30, 25);
  @include adaptiveValue('padding-bottom', 20, 25);
  position: relative;
  background-color: var(--bg-primary-color);
  &__inner {
  }

  &__top {
    display: grid;
    column-gap: 20px;
    row-gap: 18px;
    grid-template-columns: 1fr 1fr auto 1fr 1fr;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
    @media (max-width: 1099.98px) {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    @media (max-width: $md2) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: $md4) {
      grid-column: 1 / -1;
      width: 100%;
    }
  }

  &__links {
    @media (min-width: $md2) {
      &:nth-child(1) {
        grid-column: 1;
      }

      &:nth-child(2) {
        grid-column: 2;
      }
    }
    @media (max-width: $md2) {
      &:nth-child(1) {
        order: 3;
      }

      &:nth-child(2) {
        order: 4;
      }
    }
  }

  &__link {
    background-color: transparent;
    color: var(--secondary-color);
    display: block;
    width: fit-content;
    @include adaptiveValue('padding-top', 10, 9);
    @include adaptiveValue('padding-bottom', 10, 9);
    transition: color 0.3s ease 0s;
    &.router-link-active {
      color: var(--primary-color);
      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
    &_button {
    }
  }

  &__info {
    @media (min-width: $md2) {
      grid-column: 3;
      justify-self: center;
    }
    @media (max-width: $md2) {
      order: 1;
    }
    @media (max-width: $md4) {
      grid-column: 1 / -1;
      width: 100%;
      justify-self: stretch;
    }
  }

  &__logo {
    display: block;
    min-width: 218px;
    height: 60px;
    width: fit-content;
    @media (max-width: $md2) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__about {
    grid-column: 5;
    justify-self: end;
    @media (max-width: 1099.98px) {
      grid-column: 4;
    }
    @media (max-width: $md2) {
      grid-column: 2;
      order: 1;
    }
    @media (max-width: $md4) {
      grid-column: 1 / -1;
      width: 100%;
      justify-self: stretch;
      order: 2;
    }
  }

  &__email {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
    font-weight: 700;
    transition: all 0.3s ease 0s;
    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
    &-icon {
      min-width: 30px;
      height: 24px;
    }
  }

  &__socials {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
    &-link {
      display: block;
      width: fit-content;
      @include adaptiveValue('min-width', 30, 40);
      @include adaptiveValue('height', 30, 40);
      transform: scale(1);
      transition: transform 0.3s ease 0s;
      @media (any-hover: hover) {
        &:hover {
          transform: scale(1.3);
        }
      }
    }
  }

  &__bottom {
    display: grid;
    align-items: end;
    column-gap: 20px;
    row-gap: 18px;
    grid-template-columns: 1fr auto 1fr;
    @media (max-width: $md2) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__copy {
    color: var(--third-color);
  }

  &__requisites {
    line-height: 170%;
    @media (min-width: $md2) {
      text-align: center;
      max-width: 566px;
    }
  }

  &__methods {
    justify-content: flex-end;

    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    @media (max-width: $md5) {
      justify-content: center;
    }
  }

  &__method {
    width: fit-content;
    min-width: 50px;
    height: 37px;
  }
}
</style>
