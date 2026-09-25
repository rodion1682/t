<template>
  <section class="faq-list">
    <LoadingSpinner v-if="faqStore.isLoading" class="faq-list__loading" />

    <div v-else-if="faqStore.error" class="faq-list__state">
      <div class="faq-list__error">
        {{ faqStore.error }}
      </div>

      <button type="button" class="faq-list__retry" @click="reload">
        {{ $t('Try again') }}
      </button>
    </div>

    <div v-else-if="faqItems.length" class="faq-list__items">
      <article
        v-for="(item, index) in faqItems"
        :key="item.id ?? index"
        class="faq-list__item"
        :class="{
          'faq-list__item_open': activeIndex === index,
        }"
      >
        <button
          type="button"
          class="faq-list__trigger"
          :aria-expanded="activeIndex === index"
          :aria-controls="`faq-answer-${item.id ?? index}`"
          @click="toggleItem(index)"
        >
          <span class="faq-list__question">
            {{ item.question }}
          </span>

          <span class="faq-list__icon">
            <SvgIcon :icon="ChevronDownIcon" class="faq-list__icon-svg" />
          </span>
        </button>

        <div
          :id="`faq-answer-${item.id ?? index}`"
          class="faq-list__answer-wrapper"
          :class="{
            'faq-list__answer-wrapper_open': activeIndex === index,
          }"
        >
          <div class="faq-list__answer-inner">
            <div class="faq-list__answer" v-html="item.answer" />
          </div>
        </div>
      </article>
    </div>

    <div v-else class="faq-list__empty">
      {{ $t('No questions found') }}
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useFaqStore } from '@/stores/faq'
import { useLanguageStore } from '@/stores/language'

const faqStore = useFaqStore()

const languageStore = useLanguageStore()

const activeIndex = ref(null)

const faqItems = computed(() => {
  return Array.isArray(faqStore.faq) ? faqStore.faq : []
})

const toggleItem = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const loadFaq = async (langId, force = false) => {
  if (!langId) {
    activeIndex.value = null

    return
  }

  const items = await faqStore.fetchFaq(langId, force)

  activeIndex.value = items.length ? 0 : null
}

const reload = async () => {
  await loadFaq(languageStore.currentLanguageId, true)
}

onMounted(async () => {
  await languageStore.initializeLanguages()

  await loadFaq(languageStore.currentLanguageId)
})

watch(
  () => languageStore.currentLanguageId,

  async (newLangId, oldLangId) => {
    if (!newLangId || String(newLangId) === String(oldLangId)) {
      return
    }

    await loadFaq(newLangId)
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq-list {
  width: 100%;

  &__items {
    display: flex;
    flex-direction: column;

    gap: 10px;
  }

  /* =========================
     ITEM
  ========================= */

  &__item {
    width: 100%;

    overflow: hidden;

    border-radius: 30px;

    background: var(--double-spanish-white);

    transition:
      background-color 0.3s ease,
      box-shadow 0.3s ease;

    &_open {
      .faq-list__icon {
        background: var(--hemlock);

        color: var(--janna);
      }

      .faq-list__icon-svg {
        transform: rotate(180deg);
      }
    }
  }

  /* =========================
     QUESTION
  ========================= */

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    min-height: 62px;

    @include adaptiveValue('gap', 25, 15);

    @include adaptiveValue('padding-top', 16, 13);

    @include adaptiveValue('padding-right', 20, 13);

    @include adaptiveValue('padding-bottom', 16, 13);

    @include adaptiveValue('padding-left', 24, 16);

    border: 0;

    background: transparent;

    text-align: left;

    color: var(--cod-gray);

    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        .faq-list__question {
          color: var(--copper);
        }

        .faq-list__icon {
          background: var(--hemlock);

          color: var(--janna);
        }
      }
    }
  }

  &__question {
    min-width: 0;

    @include ibm-14-700;

    color: var(--cod-gray);

    text-transform: none;
    letter-spacing: normal;

    transition: color 0.3s ease;
  }

  /* =========================
     ICON
  ========================= */

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 32px;

    width: 32px;
    height: 32px;

    border-radius: 50%;

    background: var(--merino);

    color: var(--cod-gray);

    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  &__icon-svg {
    width: 12px;
    height: 12px;

    transition: transform 0.3s ease;
  }

  /* =========================
     ANSWER ANIMATION
  ========================= */

  &__answer-wrapper {
    display: grid;

    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.35s ease,
      opacity 0.3s ease;

    &_open {
      grid-template-rows: 1fr;

      opacity: 1;
    }
  }

  &__answer-inner {
    min-height: 0;

    overflow: hidden;
  }

  &__answer {
    @include adaptiveValue('padding-right', 70, 18);

    @include adaptiveValue('padding-bottom', 24, 18);

    @include adaptiveValue('padding-left', 24, 16);

    @include ibm-14-400;

    color: var(--soya-bean);

    /* API HTML */

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 10px;
    }

    :deep(a) {
      color: var(--copper);

      border-bottom: 1px solid transparent;

      transition:
        border-color 0.3s ease,
        color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--rope);

          border-color: currentColor;
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 10px 0 0;

      padding-left: 20px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;

      &:not(:last-child) {
        margin-bottom: 6px;
      }
    }

    :deep(strong),
    :deep(b) {
      font-weight: 700;

      color: var(--cod-gray);
    }

    :deep(em),
    :deep(i) {
      font-style: italic;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 14px 0 7px;

      font-family: var(--font-space-grotesk);

      font-weight: 700;

      line-height: 130%;

      color: var(--cod-gray);
    }

    :deep(*) {
      overflow-wrap: anywhere;
    }
  }

  /* =========================
     STATES
  ========================= */

  &__loading {
    display: flex;

    justify-content: center;

    min-height: 250px;

    margin: auto;
  }

  &__state,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    min-height: 220px;

    padding: 30px;

    border-radius: 30px;

    background: var(--double-spanish-white);

    text-align: center;
  }

  &__error {
    @include ibm-14-400;

    color: var(--error-color);
  }

  &__retry {
    margin-top: 15px;

    padding: 10px 20px;

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

  &__empty {
    @include ibm-14-400;

    color: var(--makara);
  }
}

/* =========================
   TABLET
========================= */

@media (max-width: $md2) {
  .faq-list {
    &__item {
      border-radius: 24px;
    }
  }
}

/* =========================
   MOBILE
========================= */

@media (max-width: $md3) {
  .faq-list {
    &__items {
      gap: 8px;
    }

    &__item {
      border-radius: 20px;
    }

    &__trigger {
      min-height: 58px;
    }
  }
}

@media (max-width: $md5) {
  .faq-list {
    &__item {
      border-radius: 17px;
    }

    &__question {
      font-size: 13px;
      line-height: 18px;
    }

    &__icon {
      flex-basis: 28px;

      width: 28px;
      height: 28px;
    }

    &__icon-svg {
      width: 10px;
      height: 10px;
    }

    &__answer {
      font-size: 13px;
      line-height: 20px;
    }
  }
}
</style>
