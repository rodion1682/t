<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue'
import Header from '@/components/header/Header.vue'
import CookieModal from '@/components/modals/CookieModal.vue'

import { useStaticPages } from '@/composables/useStaticPages'

const router = useRouter()

const cookieModalRef = ref(null)

const { cookiePage, ensurePages, getPageUrl } = useStaticPages()

const openCookieSettings = async () => {
  await ensurePages()

  if (!cookiePage.value) {
    console.warn('Cookie static page was not found')
    return
  }

  const pageUrl = getPageUrl(cookiePage.value)

  if (!pageUrl) {
    console.warn('Cookie static page URL could not be resolved')
    return
  }

  await router.push(pageUrl)

  await nextTick()

  cookieModalRef.value?.showBanner?.()
}
</script>

<template>
  <div class="layout">
    <Header />

    <main class="layout__main">
      <slot />
    </main>

    <Footer @open-cookie-settings="openCookieSettings" />

    <CookieModal ref="cookieModalRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;

    width: 100%;
    max-width: 1440px;

    left: 50%;
    transform: translateX(-50%);

    background-image: url('@/assets/img/page-bg.png');
    background-position: top center;
    background-size: 1440px auto;
    background-repeat: repeat-y;

    pointer-events: none;
    z-index: -1;
  }

  &__main {
    @include header-indent;
    flex: 1 1 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
