<template>
  <div
    class="base-checkbox"
    :class="[
      attrs.class,
      `base-checkbox_${variant}`,
      {
        bordered,
        secondary,
        'is-checked': modelValue,
        'is-disabled': disabled,
      },
    ]"
  >
    <label class="base-checkbox__row">
      <input
        class="base-checkbox__input"
        :type="variant === 'radio' ? 'radio' : 'checkbox'"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />

      <span
        class="base-checkbox__box"
        :class="{
          'is-checked': modelValue,
          'has-error': !!error,
        }"
      >
        <SvgIcon
          v-if="variant !== 'radio'"
          :icon="CheckIcon"
          class="base-checkbox__check"
        />

        <span v-else class="base-checkbox__radio-dot" />
      </span>

      <span class="base-checkbox__label">
        <slot />

        <template v-if="terms">
          {{ $t('I agree with ') }}

          <router-link
            class="_link"
            :to="getPageUrl(termsPage)"
            target="_blank"
            @click.stop
          >
            {{ capitalizeWords(termsPage.title) }}
          </router-link>

          {{ $t(' and ') }}

          <router-link
            class="_link"
            :to="getPageUrl(privacyPage)"
            target="_blank"
            @click.stop
          >
            {{ capitalizeWords(privacyPage.title) }}
          </router-link>
        </template>
      </span>
    </label>

    <div v-if="error" class="base-checkbox__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue'

import { CheckIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useStaticPages } from '@/composables/useStaticPages'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  variant: {
    type: String,
    default: 'checkbox',
    validator: value => ['checkbox', 'radio'].includes(value),
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  secondary: {
    type: Boolean,
    default: false,
  },
  terms: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const onChange = event => {
  emit('update:modelValue', event.target.checked)
}

const capitalizeWords = text => {
  if (!text) return ''

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-checkbox {
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.bordered,
  &.secondary {
    .base-checkbox__row {
      gap: 10px;
    }

    .base-checkbox__box {
      &.is-checked {
        border-color: var(--link-color);
      }
    }
  }

  &_radio {
    .base-checkbox__box {
      border-radius: 50%;

      &.is-checked {
        .base-checkbox__radio-dot {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    }
  }

  &__row {
    cursor: pointer;
    display: flex;
    gap: 10px;

    @media (any-hover: hover) {
      &:hover {
        .base-checkbox__box {
          border-color: var(--link-color);
        }
      }
    }
  }

  &__input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__box {
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    min-width: 20px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: var(--bg-secondary-color);
    border: 1px solid var(--border-secondary-color);
    transition: all 0.3s ease 0s;

    &.has-error {
      border-color: var(--error-color);
    }

    &.is-checked {
      .base-checkbox__check {
        opacity: 1;
      }

      @media (any-hover: hover) {
        &:hover {
          border-color: var(--link-color);
        }
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--link-color);
      }
    }
  }

  &__check {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 12px;
    height: 9px;
    transform: translate(-50%, -50%);
    color: var(--link-color);
    opacity: 0;
    transition: opacity 0.3s ease 0s;
  }

  &__radio-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--link-color);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  &__label {
    align-self: center;
    flex: 1 1 100%;
    cursor: pointer;
    font-weight: 400;
    font-size: 16px;
    line-height: 150%;
    color: var(--secondary-color);
    font-family: var(--font-inter);

    :deep(a) {
      display: inline;
      font-weight: 400 !important;
    }
  }

  &__error {
    margin-top: 8px;
  }
}
</style>
