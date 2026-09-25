<template>
  <main class="faq-page">
    <div class="faq-page__container _cnt">
      <div class="faq-page__grid">
        <div class="faq-page__intro">
          <div class="faq-page__eyebrow">
            {{ $t('Home') }}
          </div>

          <h1 class="faq-page__title">
            {{ $t('FAQ') }}
          </h1>

          <p class="faq-page__description">
            {{ $t('Still stuck? Write to') }}

            <a :href="`mailto:${supportEmail}`" class="faq-page__email">
              {{ supportEmail }}
            </a>

            {{ $t('and a person will answer.') }}
          </p>
        </div>

        <FaqListSection class="faq-page__list" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'

import FaqListSection from './components/FaqListSection.vue'

import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const supportEmail = computed(() => {
  return (
    settingsStore.settings?.support_email ||
    settingsStore.settings?.contact_email ||
    'help@ochraskins.com'
  )
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq-page {
  display: flex;
  flex-direction: column;

  flex: 1 1 auto;

  width: 100%;

  @include adaptiveValue('padding-top', 70, 32);

  @include adaptiveValue('padding-bottom', 120, 55);

  &__container {
    width: 100%;
  }

  &__grid {
    display: grid;

    grid-template-columns:
      minmax(250px, 0.48fr)
      minmax(0, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 75, 30);
  }

  &__intro {
    position: sticky;

    top: 100px;

    min-width: 0;

    @include adaptiveValue('padding-top', 10, 0);
  }

  &__eyebrow {
    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
  }

  &__title {
    margin: 12px 0 0;

    @include sg-44-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__description {
    max-width: 340px;

    margin: 18px 0 0;

    @include ibm-15-400;

    color: var(--soya-bean);
  }

  &__email {
    color: var(--copper);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--rope);
      }
    }
  }

  &__list {
    min-width: 0;
  }
}

@media (max-width: $md2) {
  .faq-page {
    &__grid {
      grid-template-columns:
        minmax(220px, 0.4fr)
        minmax(0, 1fr);

      gap: 30px;
    }
  }
}

@media (max-width: $md3) {
  .faq-page {
    &__grid {
      grid-template-columns: 1fr;

      gap: 30px;
    }

    &__intro {
      position: static;
    }

    &__description {
      max-width: 520px;
    }
  }
}

@media (max-width: $md5) {
  .faq-page {
    padding-top: 28px;

    &__grid {
      gap: 24px;
    }

    &__description {
      margin-top: 14px;
    }
  }
}
</style>
