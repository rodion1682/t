<template>
  <div class="static">
    <div class="static__inner _cnt">
      <LoadingSpinner v-if="loading" class="static__loading" />
      <div v-else-if="error" class="static__error _text-error">
        {{ error }}
      </div>
      <div v-else-if="currentPage" class="static__body">
        <div class="static__title _h2">{{ currentPage.title }}</div>
        <div v-html="sanitizedContent" class="static__contet"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

const loading = computed(() => staticStore.loading)
const error = computed(() => staticStore.error)
const currentPage = computed(() => staticStore.currentPage)

const sanitizedContent = computed(() => {
  if (!currentPage.value?.content) return ''

  let content = currentPage.value.content
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')

  // turn <br><br> into a spacer div
  content = content.replace(
    /(<br\s*\/?>\s*){2,}/gi,
    '<div class="br-space"></div>',
  )

  // Wrap tables in scroll container
  content = content.replace(
    /<table[^>]*>/gi,
    '<div class="table-scroll-wrapper"><table>',
  )
  content = content.replace(/<\/table>/gi, '</table></div>')

  return content
})

const fetchPage = async () => {
  const slug = route.params.slug
  if (!slug) {
    router.push({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPage({ slug })
    if (!staticStore.currentPage) router.push({ name: 'NotFound' })
  } catch (e) {
    router.push({ name: 'NotFound' })
  }
}

watch(() => route.params.slug, fetchPage, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.static {
  position: relative;
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  @include adaptiveValue('padding-top', 20, 25);
  @include adaptiveValue('padding-bottom', 130, 25);
  &__inner {
    width: 100%;
    flex: 1 1 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__loading,
  &__error {
    text-align: center;
  }

  &__body {
    width: 100%;
  }

  &__title {
    text-align: center;
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__contet {
    white-space: pre-line;
    color: var(--secondary-color);
    font-weight: 400;
    line-height: 150%;
    font-family: var(--font-inter);
    font-size: 16px;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4) {
      color: var(--secondary-color) !important;
      font-family: var(--font-inter) !important;
      font-weight: 400 !important;
      text-transform: capitalize !important;

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 32, 24);
      line-height: 120%;
      @include adaptiveValue('margin-top', 32, 18);
      @include adaptiveValue('margin-bottom', 32, 18);
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 24, 20);
      line-height: 120%;
      @include adaptiveValue('margin-top', 32, 18);
      @include adaptiveValue('margin-bottom', 24, 14);
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 20, 18);
      line-height: 120%;
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(h4) {
      @include adaptiveValue('font-size', 18, 16);
      line-height: 120%;
      @include adaptiveValue('margin-top', 16, 12);
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(p) {
      display: inline-block;
      margin-bottom: 15px;
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      background: transparent !important;
      text-align: left !important;
    }

    :deep(span) {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      background: transparent !important;
      text-transform: none !important;
    }

    :deep(ul),
    :deep(ol) {
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(ul) {
      list-style: none;
      padding-left: 0;
    }

    :deep(ul li) {
      position: relative;
      padding-left: 20px;
      list-style: none;
      @include adaptiveValue('margin-bottom', 8, 6);

      &::before {
        content: '';
        position: absolute;
        left: 3px;
        top: 9px;
        width: 5px;
        height: 5px;
        background-color: var(--secondary-color);
        border-radius: 50%;
        opacity: 0.8;
      }
    }

    :deep(ol) {
      padding-left: 22px;
    }

    :deep(ol li) {
      list-style: decimal;
      @include adaptiveValue('margin-bottom', 8, 6);
    }

    :deep(li) {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }

    :deep(a),
    :deep(a span) {
      color: var(--primary-color);
      border-bottom: 1px solid inherit;
      transition: color 0.3s ease 0s;

      @media (any-hover: hover) {
        &:hover {
          color: var(--link-color) !important;
        }
      }
    }

    :deep(blockquote) {
      border-left: 4px solid var(--link-color);
      padding-left: 16px;
      font-style: italic;
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(pre) {
      overflow: auto;
      background: var(--bg-secondary-color);
      color: var(--primary-color);
      border-radius: 12px;
      @include adaptiveValue('padding', 16, 12);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(code) {
      background: var(--bg-secondary-color);
      color: var(--hint-primary-color);
      border-radius: 8px;
      padding: 2px 8px;
    }

    :deep(strong),
    :deep(b) {
      text-transform: uppercase !important;
      font-weight: 500 !important;
      color: var(--secondary-color) !important;
    }

    :deep(em) {
      font-style: italic !important;
    }

    :deep(.br-space) {
      display: block;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(.table-scroll-wrapper) {
      width: 100%;
      overflow-x: auto;
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border-primary-color);
      background: transparent;
      color: var(--secondary-color) !important;
    }

    :deep(th) {
      border: 1px solid var(--border-primary-color);
      background: transparent;
      text-align: left;
      font-weight: 500;
      color: var(--secondary-color) !important;

      @include adaptiveValue('font-size', 18, 14);
      @include adaptiveValue('padding-top', 16, 10);
      @include adaptiveValue('padding-bottom', 16, 10);
      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
    }

    :deep(td) {
      border: 1px solid var(--border-color);
      color: var(--secondary-color) !important;

      @include adaptiveValue('font-size', 18, 14);
      @include adaptiveValue('padding-top', 16, 10);
      @include adaptiveValue('padding-bottom', 16, 10);
      @include adaptiveValue('padding-left', 16, 10);
      @include adaptiveValue('padding-right', 16, 10);
    }

    :deep(tr:nth-child(even)),
    :deep(tr:hover) {
      background: var(--bg-secondary-color);
    }

    @media (max-width: 768px) {
      :deep(table) {
        display: block;
        overflow-x: auto;
        white-space: normal;
        table-layout: fixed;
        min-width: 100%;
        font-size: 12px;
      }

      :deep(th),
      :deep(td) {
        min-width: 240px;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
        padding: 6px 8px;
      }
    }
  }
}
</style>
