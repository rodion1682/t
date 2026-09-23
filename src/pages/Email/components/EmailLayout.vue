<template>
  <div class="status-page" :class="containerClass">
    <div class="status-page__content">
      <div v-if="hint" class="status-page__hint _h4">
        {{ hint }}
      </div>

      <div
        v-if="title"
        class="status-page__title _h3"
        :class="`status-page__title_${titleColor}`"
      >
        {{ title }}
      </div>

      <div v-if="text" class="status-page__text">
        {{ text }}
      </div>

      <div v-if="$slots.default" class="status-page__body">
        <slot />
      </div>

      <BaseButton
        v-if="buttonText"
        class="status-page__button"
        :disabled="buttonDisabled"
        @click="emit('button-click')"
      >
        {{ buttonText }}
      </BaseButton>

      <div v-if="$slots.bottom" class="status-page__bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  hint: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  titleColor: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'hint', 'success', 'error'].includes(value),
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonDisabled: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['button-click'])
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

  &__texture {
    position: absolute;
    z-index: 1;

    left: 24%;
    top: -2%;

    width: 100%;
    height: 110%;

    transform: translate(-50%, -5%) rotate(-2deg);

    pointer-events: none;

    @media (max-width: $md4) {
      width: 150%;
      height: 150%;

      transform: translate(-55%, -20%) rotate(-1deg);
    }
  }

  &__image {
    position: absolute;
    z-index: 2;

    left: 10%;
    bottom: -3%;

    width: 36%;
    height: 103%;

    pointer-events: none;

    @media (max-width: $md2) {
      opacity: 0.8;
    }

    @media (max-width: $md4) {
      left: -25%;

      width: 100%;
      height: 100%;
    }
  }

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

  &__hint {
    color: var(--hint-primary-color);

    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
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

    &_hint {
      color: var(--hint-primary-color);
    }

    &_success {
      color: var(--success-color);
    }

    &_error {
      color: var(--error-color);
    }
  }

  &__text {
    color: var(--secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__body {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__button {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__bottom {
    color: var(--secondary-color);
  }
}
</style>
