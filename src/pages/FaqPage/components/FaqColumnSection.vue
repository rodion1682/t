<template>
  <section class="faq-section">
    <LoadingSpinner v-if="faqStore.isLoading" class="faq-section__loading" />

    <div v-else-if="faqStore.error" class="faq-section__error _text-error">
      {{ faqStore.error }}
    </div>

    <div v-else-if="faqItems.length" class="faq-section__body">
      <div class="faq-section__items">
        <button
          v-for="(item, index) in faqItems"
          :key="item.id"
          type="button"
          class="faq-section__item"
          :class="{ active: activeIndex === index }"
          @click="toggleItem(index)"
        >
          <span class="faq-section__question">
            {{ item.question }}
          </span>

          <SvgIcon :icon="ArrowIcon" class="faq-section__icon" />
        </button>
      </div>

      <div class="faq-section__answer-card">
        <template v-if="activeItem">
          <div class="faq-section__answer-title _md">
            {{ activeItem.question }}
          </div>

          <div class="faq-section__answer" v-html="activeItem.answer" />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ArrowIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useFaqStore } from '@/stores/faq'
import { useLanguageStore } from '@/stores/language'

const faqStore = useFaqStore()
const languageStore = useLanguageStore()

const activeIndex = ref(0)
const loadedLangId = ref(null)

const faqItems = computed(() => {
  return Array.isArray(faqStore.faq) ? faqStore.faq : []
})

const activeItem = computed(() => {
  return faqItems.value[activeIndex.value] || faqItems.value[0] || null
})

const loadFaq = async langId => {
  if (!langId) return
  if (loadedLangId.value === langId) return
  if (faqStore.isLoading) return

  loadedLangId.value = langId

  await faqStore.fetchFaq(langId)
  activeIndex.value = 0
}

const toggleItem = index => {
  activeIndex.value = index
}

onMounted(async () => {
  await languageStore.initializeLanguages()
  await loadFaq(languageStore.currentLanguageId)
})

onBeforeUnmount(() => {})

watch(
  () => languageStore.currentLanguageId,
  async newLangId => {
    await loadFaq(newLangId)
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq-section {
  &__loading,
  &__error {
    text-align: center;
    margin: auto;
    display: flex;
    justify-content: center;
  }
  &__body {
    @media (min-width: $md4) {
      display: flex;
      @include adaptiveValue('gap', 24, 10);
    }
    @media (max-width: $md5) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }
  &__items {
    flex: 0 1 50%;
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
  &__item {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    @include adaptiveValue('padding-top', 12, 8);
    @include adaptiveValue('padding-bottom', 12, 8);
    @include adaptiveValue('padding-left', 16, 10);
    @include adaptiveValue('padding-right', 16, 10);
    border-radius: 8px;
    background-color: rgb(255, 255, 255, 0.1);
    color: var(--primary-color);
    font-family: var(--font-oswald);
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
    text-align: left;
    text-transform: uppercase;
    transition: all 0.3s ease 0s;
    max-width: 408px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 4);
    }
    &.active {
      max-width: 100%;
      color: var(--bg-primary-color);
      background-color: var(--success-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--bg-primary-color);
        background-color: var(--success-color);
      }
    }
    @media (min-width: $md6) {
      @include adaptiveValue('min-height', 45, 40);
    }
  }

  &__question {
    min-width: 0;
  }

  &__icon {
    width: 12px;
    min-width: 12px;
    height: 12px;
    color: currentColor;
  }

  &__answer-card {
    flex: 0 1 50%;
    @include adaptiveValue('padding-top', 48, 15);
    @include adaptiveValue('padding-bottom', 48, 15);
    @include adaptiveValue('padding-left', 52, 10);
    @include adaptiveValue('padding-right', 52, 10);
    background-color: rgb(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  &__answer-title {
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 15);
    }
  }

  &__answer {
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;
    color: var(--primary-color);

    :deep(p),
    :deep(li) {
      font-size: inherit;
      line-height: inherit;
      color: inherit;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    :deep(ol),
    :deep(ul) {
      padding-left: 18px;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
