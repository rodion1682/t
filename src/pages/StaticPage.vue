<template>
  <main class="static-page">
    <div class="static-page__container _cnt">
      <div v-if="loading" class="static-page__state">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="static-page__state">
        <div class="static-page__error _text-error">
          {{ error }}
        </div>

        <button type="button" class="static-page__retry" @click="fetchPage">
          {{ $t('Try again') }}
        </button>
      </div>

      <template v-else-if="currentPage">
        <header class="static-page__header">
          <RouterLink
            :to="{ name: 'HomePage' }"
            class="static-page__breadcrumb"
          >
            {{ $t('Home') }}
          </RouterLink>

          <h1 class="static-page__title">
            {{ currentPage.title }}
          </h1>

          <div v-if="pageHeader" class="static-page__updated">
            {{ pageHeader }}
          </div>
        </header>

        <article class="static-page__document">
          <div class="static-page__content" v-html="sanitizedContent" />
        </article>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useLanguageStore } from '@/stores/language'
import { useStaticStore } from '@/stores/static'

const route = useRoute()
const router = useRouter()

const staticStore = useStaticStore()

const languageStore = useLanguageStore()

const loading = computed(() => staticStore.pageLoading)

const error = computed(() => staticStore.pageError)

const currentPage = computed(() => staticStore.currentPage)

const pageHeader = computed(() => {
  return String(currentPage.value?.header || '').trim()
})

const sanitizedContent = computed(() => {
  if (!currentPage.value?.content) {
    return ''
  }

  let content = String(currentPage.value.content)

  content = content
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')

  content = content.replace(
    /<table([^>]*)>/gi,
    '<div class="static-table"><table$1>',
  )

  content = content.replace(/<\/table>/gi, '</table></div>')

  return content
})

const fetchPage = async () => {
  const slug = route.params.slug || route.params.id

  if (!slug) {
    await router.replace({
      name: 'NotFound',
    })

    return
  }

  if (!languageStore.currentLanguageId) {
    await languageStore.initializeLanguages()
  }

  const page = await staticStore.fetchPage({
    slug,
    langId: languageStore.currentLanguageId,
  })

  if (!page) {
    if (!staticStore.pageError) {
      await router.replace({
        name: 'NotFound',
      })
    }
  }
}

watch(
  [
    () => route.params.slug,
    () => route.params.id,
    () => languageStore.currentLanguageId,
  ],
  async ([slug, id, langId], [oldSlug, oldId, oldLangId] = []) => {
    if (slug === oldSlug && id === oldId && langId === oldLangId) {
      return
    }

    await fetchPage()
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.static-page {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;

  @include adaptiveValue('padding-top', 50, 25);

  @include adaptiveValue('padding-bottom', 100, 25);

  &__container {
    width: 100%;
  }

  &__header {
    width: 100%;
  }

  &__breadcrumb {
    display: block;

    width: fit-content;

    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }
  }

  &__title {
    margin: 11px 0 0;

    @include sg-44-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__updated {
    @include ibm-14-400;

    color: var(--makara);
  }

  &__document {
    width: 100%;

    margin-top: 30px;

    @include adaptiveValue('padding', 48, 15);

    @include adaptiveValue('border-radius', 39, 20);

    background: var(--double-spanish-white);

    box-shadow: 0 8px 30px var(--cod-gray-07);
  }

  &__content {
    max-width: 100%;

    @include ibm-15-400;

    color: var(--armadillo);

    :deep(*) {
      box-sizing: border-box;

      max-width: 100%;

      overflow-wrap: anywhere;
    }

    :deep(p) {
      margin: 0 0 10px;

      padding: 0;

      background: transparent !important;

      font-family: var(--font-ibm-plex) !important;

      font-size: 15px !important;
      font-weight: 400 !important;
      line-height: 1.65 !important;

      color: var(--armadillo) !important;

      text-align: left !important;
    }
    :deep(> p) {
      margin-bottom: 14px;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      padding: 0;

      font-family: var(--font-space-grotesk) !important;

      font-weight: 700 !important;

      color: var(--cod-gray) !important;

      text-align: left !important;
    }

    :deep(h1) {
      margin: 30px 0 12px;

      font-size: 22px !important;
      line-height: 1.25 !important;
    }

    :deep(h2) {
      margin: 30px 0 12px;

      font-size: 20px !important;
      line-height: 1.25 !important;
    }

    :deep(h3) {
      margin: 26px 0 10px;

      font-size: 18px !important;
      line-height: 1.3 !important;
    }

    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 22px 0 8px;

      font-size: 16px !important;
      line-height: 1.35 !important;
    }
    :deep(> h1:first-child),
    :deep(> h2:first-child),
    :deep(> h3:first-child) {
      margin-top: 0;
    }

    :deep(ul),
    :deep(ol) {
      display: flex;
      flex-direction: column;

      gap: 4px;

      margin: 0 0 12px;

      padding-left: 22px;

      font-family: var(--font-ibm-plex);

      font-size: 15px;
      font-weight: 400;
      line-height: 1.65;

      color: var(--armadillo);
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;

      padding: 0;

      color: var(--armadillo) !important;
    }

    :deep(li::marker) {
      color: var(--cod-gray);
    }

    :deep(span) {
      background: transparent !important;

      font-family: var(--font-ibm-plex) !important;

      color: inherit !important;
    }

    :deep(strong),
    :deep(b) {
      font-weight: 700 !important;

      color: var(--cod-gray) !important;
    }

    :deep(em),
    :deep(i) {
      font-style: italic;
    }

    :deep(a) {
      color: var(--copper) !important;

      border-bottom: 1px solid transparent;

      transition:
        color 0.3s ease,
        border-color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--rope) !important;

          border-color: currentColor;
        }
      }
    }

    :deep(hr) {
      margin: 28px 0;

      border: 0;

      border-top: 1px solid var(--cod-gray-16);
    }

    :deep(img) {
      display: block;

      max-width: 100%;
      height: auto;

      margin: 18px 0;

      border-radius: 16px;
    }

    :deep(.static-table) {
      width: 100%;

      margin: 20px 0;

      overflow-x: auto;

      border: 1px solid var(--cod-gray-16);

      border-radius: 14px;
    }

    :deep(table) {
      width: 100%;

      min-width: 600px;

      border-collapse: collapse;

      background: transparent;
    }

    :deep(th),
    :deep(td) {
      padding: 12px 14px;

      border: 1px solid var(--cod-gray-16);

      font-family: var(--font-ibm-plex);

      font-size: 14px;
      line-height: 1.5;

      color: var(--armadillo);

      text-align: left;
    }

    :deep(th) {
      font-weight: 700;

      color: var(--cod-gray);

      background: var(--merino);
    }

    :deep(blockquote) {
      margin: 20px 0;

      padding: 16px 20px;

      border-left: 3px solid var(--copper);

      border-radius: 0 14px 14px 0;

      background: var(--merino);
    }

    :deep(blockquote p:last-child) {
      margin-bottom: 0;
    }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    width: 100%;
    min-height: 420px;
  }

  &__error {
    text-align: center;
  }

  &__retry {
    margin-top: 18px;

    padding: 11px 22px;

    border: 0;
    border-radius: 999px;

    background: var(--copper);

    @include ibm-12-700;

    color: var(--janna);

    cursor: pointer;

    transition: background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background: var(--tuscany);
      }
    }
  }
}

@media (max-width: $md2) {
  .static-page {
    &__document {
      border-radius: 26px;
    }
  }
}

@media (max-width: $md3) {
  .static-page {
    &__document {
      margin-top: 24px;

      border-radius: 22px;
    }

    &__content {
      :deep(p),
      :deep(ul),
      :deep(ol) {
        font-size: 14px !important;
      }

      :deep(h2) {
        margin-top: 25px;

        font-size: 18px !important;
      }
    }
  }
}

@media (max-width: $md5) {
  .static-page {
    &__document {
      margin-right: -4px;
      margin-left: -4px;

      border-radius: 18px;
    }

    &__updated {
      margin-top: 9px;
    }
  }
}
</style>
