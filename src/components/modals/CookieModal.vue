<template>
  <div v-if="showInitialBanner" class="cookie banner">
    <div class="banner__inner _cnt">
      <div class="banner__body">
        <div class="banner__title _h4">
          {{ $t('Cookies in Use') }}
        </div>

        <div class="banner__text">
          {{
            $t(
              'HighSkins uses essential cookies to help the site function properlyand protect your account. If you choose to allow them, we’ll also usenon-essential cookies to save your settings and gather usage insightsabout the site so we can improve performance and features. Non-essential cookies are turned off by default unless you switch them on inthe Cookie Settings options. To learn more (including how to changeyour choices later), please see our',
            )
          }}
          <RouterLink
            v-if="cookiePage"
            :to="cookiePageLink"
            @click="closeModal"
            class="cookie__desc-link"
          >
            {{ $t('Cookie Notice') }}
          </RouterLink>
          {{ $t('.') }}
        </div>

        <div class="banner__actions">
          <BaseButton
            variant="primary"
            @click="acceptAllCookies"
            class="banner__button"
          >
            {{ $t('Accept All') }}
          </BaseButton>

          <BaseButton
            @click="rejectNonEssentialCookies"
            variant="bordered"
            class="banner__button"
          >
            {{ $t('Reject All Nonessential Cookies') }}
          </BaseButton>

          <BaseButton
            @click="showDetailedModal = true"
            variant="bordered"
            class="banner__button"
          >
            {{ $t('Customize') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>

  <BaseModal
    :show="showDetailedModal"
    wrapper-classes="cookie__modal-wrap"
    @close="handleDetailedModalClose"
  >
    <div class="cookie__modal">
      <div v-if="false" class="cookie__top">
        <div class="cookie__title _h3">
          {{ $t('Manage your preferences below:') }}
        </div>

        <div class="cookie__desc _text-secondary">
          {{
            $t(
              'We use cookies to maintain the security of our Website, ensure the proper functioning of its core features, and analyze Website traffic. Strictly necessary cookies are active by default to facilitate these essential operations, while optional analytics and preference cookies are enabled only upon your explicit consent. You may customize or withdraw your choices at any time with future effect. Learn more in our',
            )
          }}
          <RouterLink
            v-if="cookiePage"
            :to="cookiePageLink"
            @click="closeModal"
            class="cookie__desc-link"
          >
            {{ cookiePage.title }}
          </RouterLink>
          {{ $t('.') }}
        </div>
      </div>

      <div class="cookie__list">
        <div class="cookie__item" @click="toggleCategory('essential')">
          <div class="cookie__info">
            <div class="cookie__subtitle">
              {{ $t('Essential Cookies (Always Active):') }}
            </div>
            <div class="cookie__text _text-secondary">
              {{
                $t(
                  'These cookies are technically required for our Website to operate securely and correctly. They enable core features like user login, page security, and privacy preferences, and cannot be turned off.',
                )
              }}
            </div>
          </div>

          <div class="cookie__control" @click.stop>
            <BaseCheckbox
              :modelValue="true"
              :disabled="true"
              class="cookie__checkbox cookie__checkbox_disabled"
            />
          </div>
        </div>

        <div class="cookie__item" @click="toggleCategory('functional')">
          <div class="cookie__info">
            <div class="cookie__subtitle">
              {{ $t('Functional (Preference) Cookies:') }}
            </div>
            <div class="cookie__text _text-secondary">
              {{
                $t(
                  'These cookies personalize your browsing experience by remembering your custom preferences, such as your preferred language and regional settings, so you do not have to re-enter them on future visits.',
                )
              }}
            </div>
          </div>

          <div class="cookie__control" @click.stop>
            <BaseCheckbox
              v-model="cookieCategories.functional"
              class="cookie__checkbox"
            />
          </div>
        </div>

        <div class="cookie__item" @click="toggleCategory('analytics')">
          <div class="cookie__info">
            <div class="cookie__subtitle">
              {{ $t('Performance (Analytics) Cookies:') }}
            </div>
            <div class="cookie__text _text-secondary">
              {{
                $t(
                  'These cookies collect anonymous, aggregated data to show us how visitors navigate our Website. We use this information to measure page performance, diagnose technical errors, and improve our services.',
                )
              }}
            </div>
          </div>

          <div class="cookie__control" @click.stop>
            <BaseCheckbox
              v-model="cookieCategories.analytics"
              class="cookie__checkbox"
            />
          </div>
        </div>

        <div class="cookie__item" @click="toggleCategory('advertising')">
          <div class="cookie__info">
            <div class="cookie__subtitle">
              {{ $t('Advertising/Targeting Cookies:') }}
            </div>
            <div class="cookie__text _text-secondary">
              {{
                $t(
                  'These cookies are used to deliver more relevant content or ads and to measure the effectiveness of campaigns.',
                )
              }}
            </div>
          </div>

          <div class="cookie__control" @click.stop>
            <BaseCheckbox
              v-model="cookieCategories.advertising"
              class="cookie__checkbox"
            />
          </div>
        </div>
      </div>

      <div class="cookie__actions">
        <div class="cookie__actions-row">
          <BaseButton
            @click="acceptSelectedCookies"
            variant="primary"
            class="cookie__button"
          >
            {{ $t('Save & Exit') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { computed, inject, onMounted, ref } from 'vue'

const $cookies = inject('$cookies', null)

const { cookiePage, ensurePages } = useStaticPages()

const CONSENT_KEY = 'cookie_consent'
const CATEGORIES_KEY = 'cookie_categories'
const CONSENT_LOG_KEY = 'cookie_consent_log'

const showInitialBanner = ref(false)
const showDetailedModal = ref(false)
const hasInitialConsent = ref(false)

const cookieCategories = ref({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const currentConsent = ref({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const consentLog = ref([])

const cookiePageLink = computed(() => {
  if (!cookiePage.value) return null
  if (!cookiePage.value.slug) return null

  return {
    name: 'StaticPageBySlug',
    params: {
      slug: cookiePage.value.slug,
    },
  }
})

const setCookieValue = (key, value, expires = null) => {
  if (!$cookies) return

  $cookies.set(key, JSON.stringify(value), expires || '1y')
}

const getCookieValue = key => {
  if (!$cookies || !$cookies.isKey(key)) {
    return null
  }

  try {
    return JSON.parse($cookies.get(key))
  } catch {
    return $cookies.get(key)
  }
}

const hasCookie = key => {
  if (!$cookies) return false

  return $cookies.isKey(key)
}

const loadConsent = () => {
  const consent = getCookieValue(CONSENT_KEY)
  const categories = getCookieValue(CATEGORIES_KEY)
  const log = getCookieValue(CONSENT_LOG_KEY) || []

  if (consent) {
    hasInitialConsent.value = true

    currentConsent.value = {
      ...cookieCategories.value,
      ...(categories || {}),
      essential: true,
    }

    cookieCategories.value = {
      ...currentConsent.value,
      essential: true,
    }
  }

  consentLog.value = Array.isArray(log) ? log : []
}

const logConsent = action => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    categories: {
      ...cookieCategories.value,
      essential: true,
    },
  }

  consentLog.value.unshift(logEntry)

  setCookieValue(CONSENT_LOG_KEY, consentLog.value)
}

const saveConsent = action => {
  cookieCategories.value.essential = true

  setCookieValue(CONSENT_KEY, true)

  setCookieValue(CATEGORIES_KEY, cookieCategories.value)

  currentConsent.value = {
    ...cookieCategories.value,
    essential: true,
  }

  logConsent(action)

  hasInitialConsent.value = true
  showInitialBanner.value = false
  showDetailedModal.value = false
}

const openCookieBanner = () => {
  loadConsent()

  showDetailedModal.value = false
  showInitialBanner.value = true
}

const acceptAllCookies = () => {
  cookieCategories.value = {
    essential: true,
    functional: true,
    analytics: true,
    advertising: true,
  }

  saveConsent('All cookies accepted')
}

const rejectNonEssentialCookies = () => {
  cookieCategories.value = {
    essential: true,
    functional: false,
    analytics: false,
    advertising: false,
  }

  saveConsent('All non-essential cookies rejected')
}

const acceptSelectedCookies = () => {
  cookieCategories.value.essential = true

  saveConsent('Selected cookies accepted')
}

const openCookieSettings = () => {
  loadConsent()

  cookieCategories.value = {
    ...currentConsent.value,
    essential: true,
  }

  showInitialBanner.value = false
  showDetailedModal.value = true
}

const handleDetailedModalClose = () => {
  showDetailedModal.value = false
}

const closeModal = () => {
  showDetailedModal.value = false
}

const toggleCategory = category => {
  if (category === 'essential') {
    return
  }

  if (!(category in cookieCategories.value)) {
    return
  }

  cookieCategories.value[category] = !cookieCategories.value[category]
}

onMounted(async () => {
  await ensurePages()

  loadConsent()

  if (!hasCookie(CONSENT_KEY)) {
    showInitialBanner.value = true
  }
})

defineExpose({
  showBanner: openCookieBanner,
  showSettings: openCookieSettings,
})
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cookie {
  &__modal-wrap {
    max-width: 710px;
    padding-top: 40px !important;
  }

  &__modal {
    width: 100%;
    text-align: left;
  }

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__title {
    color: var(--primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__desc {
    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__desc-link {
    display: inline;

    padding: 0;

    background: transparent;
    border: 0;

    color: var(--hint-primary-color);

    font: inherit;
    font-weight: 600;

    text-decoration: underline;
    text-underline-offset: 3px;

    cursor: pointer;

    transition:
      color 0.3s ease,
      opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }

    &_disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;

    gap: 10px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__item {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    width: 100%;

    @include adaptiveValue('padding', 18, 12);
    @include adaptiveValue('border-radius', 10, 4);

    background-color: var(--bg-primary-color);

    border: 1px solid var(--bg-third-color);

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md6) {
      align-items: flex-start;
      gap: 10px;
    }
  }

  &__info {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__subtitle {
    display: block;

    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 600;
    line-height: 120%;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__text {
    display: block;

    margin-left: 0;

    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__control {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    align-self: center;

    @media (max-width: $md6) {
      align-self: flex-start;
    }
  }

  &__checkbox {
    &_disabled {
      opacity: 0.5;
    }
  }

  &__actions {
    width: 100%;

    &-row {
      display: flex;
      justify-content: flex-end;

      width: 100%;

      gap: 10px;

      @media (max-width: $md6) {
        flex-direction: column;
      }
    }
  }

  &__button {
    width: fit-content;
    min-width: 180px;

    margin-left: auto;

    @media (max-width: $md6) {
      width: 100%;
      min-width: 0;
    }
  }
}

.banner {
  position: fixed;

  right: 50%;
  bottom: 0;

  z-index: var(--modal-z-index);

  transform: translateX(50%);

  width: calc(100% - 30px);
  max-width: 710px;

  background-color: var(--bg-secondary-color);

  border: 1px solid var(--bg-third-color);
  border-bottom: 0;

  @include adaptiveValue('padding-top', 25, 15);
  @include adaptiveValue('padding-bottom', 25, 15);
  @include adaptiveValue('border-radius', 20, 4);

  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  &__inner {
    width: 100%;
  }

  &__body {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 20, 15);
  }

  &__title {
    color: var(--primary-color);
  }

  &__text {
    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;

    @media (max-width: $md5) {
      text-align: center;
    }

    .cookie__desc-link {
      color: var(--hint-primary-color);
      border-bottom: 1px solid transparent;
      transition: border 0.3s ease 0s;
      @media (any-hover: hover) {
        &:hover {
          border-color: inherit;
        }
      }
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }

  &__button {
    min-height: 45px !important;

    flex: 0 1 calc(50% - 5px);

    &:first-child {
      flex: 1 1 100%;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }
}
</style>
