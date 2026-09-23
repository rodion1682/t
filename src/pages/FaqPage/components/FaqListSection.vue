<template>
  <section class="faq-section">
    <div class="faq-section__title _h3">
      {{ $t('Frequently asked questions') }}
    </div>

    <LoadingSpinner v-if="loadingFaq" class="faq-section__loading" />

    <template v-else-if="faqItems.length">
      <div class="faq-section__items">
        <div
          v-for="(item, index) in faqItems"
          :key="item.id"
          class="faq-section__item"
          :class="{ active: activeIndex === index }"
        >
          <div class="faq-section__content" @click="toggleItem(index)">
            <div class="faq-section__question">
              {{ item.question }}
            </div>

            <div
              class="faq-section__answer-wrapper"
              :class="{ open: activeIndex === index }"
            >
              <div class="faq-section__answer-inner">
                <div class="faq-section__answer" v-html="item.answer" />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="faq-section__icon-wrapper"
            :aria-expanded="activeIndex === index"
            @click="toggleItem(index)"
          >
            <SvgIcon
              class="faq-section__icon"
              :class="{ active: activeIndex === index }"
              :icon="ChevronDownIcon"
            />
          </button>
        </div>
      </div>
    </template>

    <div v-else class="faq-section__empty _empty">
      {{ $t('No questions found') }}
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import axios from '@/plugins/axios'

const faqItems = ref([])
const loadingFaq = ref(false)
const activeIndex = ref(0)

const toggleItem = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const fetchFaq = async () => {
  loadingFaq.value = true

  try {
    const { data } = await axios.get('/faq')

    const payload = Array.isArray(data)
      ? data
      : data?.status === 'OK' && Array.isArray(data?.payload)
        ? data.payload
        : []

    faqItems.value = payload
    activeIndex.value = payload.length ? 0 : null
  } catch (error) {
    console.error('Failed to fetch FAQ:', error)

    faqItems.value = []
    activeIndex.value = null
  } finally {
    loadingFaq.value = false
  }
}

onMounted(fetchFaq)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq-section {
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__item {
    position: relative;
    cursor: pointer;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 4);
    }
  }

  &__content {
    position: relative;

    @include adaptiveValue('padding', 16, 10);
    @include adaptiveValue('border-radius', 20, 10);

    padding-right: 40px;

    border: 1px solid var(--border-primary-color);

    background-color: var(--bg-primary-color);
    color: var(--primary-color);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__question {
    display: flex;
    justify-content: space-between;

    gap: 20px;

    color: inherit;
  }

  &__icon-wrapper {
    position: absolute;

    @include adaptiveValue('top', 16, 10);
    @include adaptiveValue('right', 16, 10);

    background-color: transparent;
  }

  &__icon {
    min-width: 16px;
    width: 16px;
    height: 16px;

    color: var(--hint-primary-color);

    transform: rotate(-180deg);

    transition: transform 0.3s ease;

    &.active {
      transform: rotate(0deg);
    }
  }

  &__answer-wrapper {
    display: grid;

    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.35s ease,
      opacity 0.3s ease;

    &.open {
      grid-template-rows: 1fr;
      opacity: 1;
    }
  }

  &__answer-inner {
    min-height: 0;
    overflow: hidden;
  }

  &__answer {
    padding-top: 10px;

    color: var(--third-color);

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 10px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 10px 0 0;
      padding-left: 22px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;

      margin-bottom: 6px;

      line-height: 150%;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(li > ul),
    :deep(li > ol) {
      margin-top: 6px;
    }

    :deep(a) {
      display: inline-block;

      color: var(--hint-primary-color);

      border-bottom: 1px solid transparent;

      transition: border-color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          border-color: inherit;
        }
      }
    }

    :deep(strong),
    :deep(b) {
      color: var(--primary-color);

      font-weight: 600;
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
      margin: 12px 0 6px;

      color: var(--primary-color);

      font-weight: 600;
      line-height: 130%;
    }

    :deep(*) {
      overflow-wrap: anywhere;
    }
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    text-align: center;
  }
}
</style>
