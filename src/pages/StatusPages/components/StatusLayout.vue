<template>
  <div class="status-page">
    <div class="status-page__inner _cnt">
      <div class="status-page__content">
        <div v-if="showLoader" class="status-page__loader">
          <div class="status-page__spinner"></div>
        </div>

        <div
          v-if="title"
          class="status-page__title _h3"
          :class="`status-page__title_${tone}`"
        >
          {{ title }}
        </div>

        <div v-if="text || subtext" class="status-page__top">
          <div v-if="text" class="status-page__text">
            {{ text }}
          </div>

          <div v-if="subtext" class="status-page__subtext">
            {{ subtext }}
          </div>
        </div>

        <div v-if="$slots.default" class="status-page__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="status-page__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  subtext: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'primary',
    validator: value =>
      ['primary', 'success', 'error', 'pending'].includes(value),
  },
  showLoader: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.status-page {
  position: relative;
  z-index: 2;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  align-items: center;

  width: 100%;

  @include adaptiveValue('padding-top', 80, 25);
  @include adaptiveValue('padding-bottom', 80, 25);

  overflow: hidden;

  &__inner {
    width: 100%;
    align-self: center;
    margin: auto;
  }

  &__content {
    position: relative;
    z-index: 3;

    width: 100%;
    max-width: 466px;

    margin-left: auto;

    @include adaptiveValue('margin-right', 122, 0, 1440, 620, 1);

    text-align: center;

    @media (max-width: $md4) {
      margin-right: 0;
      margin-left: auto;
    }
  }

  &__loader {
    display: flex;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__spinner {
    width: 64px;
    min-width: 64px;
    height: 64px;

    border: 4px solid var(--pending-color);
    border-top-color: transparent;
    border-radius: 50%;

    animation: status-page-spin 1s linear infinite;
  }

  &__title {
    text-align: center;
    font-weight: 700;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }

    &_primary {
      color: var(--primary-color);
    }

    &_success {
      color: var(--success-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: var(--pending-color);
    }
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__text {
    color: var(--secondary-color);
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  &__subtext {
    color: var(--secondary-color);
    line-height: 150%;
  }

  &__body {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    width: 100%;
  }
}

@keyframes status-page-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
