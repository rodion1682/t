<template>
  <main class="status">
    <div class="status__container _cnt">
      <div class="status__card">
        <div class="status__icon" :class="`status__icon_${tone}`">
          <span v-if="showLoader" class="status__spinner" />

          <span v-else class="status__symbol">
            {{ symbol }}
          </span>
        </div>

        <h1 class="status__title">
          {{ title }}
        </h1>

        <p v-if="text" class="status__text">
          {{ text }}
        </p>

        <p v-if="subtext" class="status__subtext">
          {{ subtext }}
        </p>

        <div v-if="$slots.default" class="status__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="status__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
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
  },

  showLoader: {
    type: Boolean,
    default: false,
  },
})

const symbol = computed(() => {
  if (props.tone === 'success') {
    return '✓'
  }

  if (props.tone === 'error') {
    return '!'
  }

  if (props.tone === 'pending') {
    return '…'
  }

  return 'i'
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.status {
  display: flex;
  flex: 1 1 auto;
  align-items: center;

  width: 100%;

  @include adaptiveValue('padding-top', 80, 35);
  @include adaptiveValue('padding-bottom', 100, 50);

  &__container {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
  }

  &__card {
    display: flex;
    align-items: center;
    flex-direction: column;

    width: 100%;
    max-width: 680px;

    @include adaptiveValue('padding-top', 56, 32);
    @include adaptiveValue('padding-right', 56, 20);
    @include adaptiveValue('padding-bottom', 50, 30);
    @include adaptiveValue('padding-left', 56, 20);

    border-radius: 30px;

    background: var(--double-spanish-white);

    box-shadow: 0 12px 40px var(--cod-gray-07);

    text-align: center;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 72px;
    height: 72px;

    margin-bottom: 24px;

    border-radius: 50%;

    &_success {
      background: rgba(52, 168, 83, 0.12);

      color: var(--success-color);
    }

    &_error {
      background: rgba(237, 0, 6, 0.1);

      color: var(--error-color);
    }

    &_pending {
      background: var(--copper-10);

      color: var(--copper);
    }

    &_primary {
      background: rgba(114, 129, 87, 0.12);

      color: var(--hemlock);
    }
  }

  &__symbol {
    font-family: var(--font-space-grotesk);
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
  }

  &__spinner {
    width: 34px;
    height: 34px;

    border: 3px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;

    animation: status-spin 0.8s linear infinite;
  }

  &__title {
    margin: 0;

    @include sg-36-700;

    color: var(--cod-gray);
  }

  &__text {
    max-width: 500px;

    margin: 16px 0 0;

    @include ibm-15-400;

    color: var(--cod-gray);
  }

  &__subtext {
    max-width: 500px;

    margin: 8px 0 0;

    @include ibm-14-400;

    color: var(--makara);
  }

  &__body {
    width: 100%;

    margin-top: 24px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    width: 100%;

    gap: 10px;

    margin-top: 30px;

    :deep(.base-button),
    :deep(button),
    :deep(a) {
      flex: 1 1 180px;

      max-width: 240px;
    }
  }
}

@media (max-width: $md3) {
  .status {
    align-items: flex-start;

    &__card {
      border-radius: 24px;
    }

    &__icon {
      width: 64px;
      height: 64px;

      margin-bottom: 20px;
    }

    &__symbol {
      font-size: 28px;
    }
  }
}

@media (max-width: $md5) {
  .status {
    &__card {
      border-radius: 20px;
    }

    &__icon {
      width: 58px;
      height: 58px;

      margin-bottom: 18px;
    }

    &__symbol {
      font-size: 25px;
    }

    &__actions {
      align-items: stretch;
      flex-direction: column;

      margin-top: 24px;

      :deep(.base-button),
      :deep(button),
      :deep(a) {
        flex: none;

        width: 100%;
        max-width: none;
      }
    }
  }
}

@keyframes status-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
