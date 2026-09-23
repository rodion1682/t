<template>
  <div class="base-textarea-wrap" :class="attrs.class">
    <div v-if="label" class="base-textarea__label" :class="{ error }">
      {{ label }}
    </div>

    <div class="base-textarea" :class="containerClasses">
      <textarea
        :id="id"
        class="base-textarea__control"
        :value="modelValue"
        :rows="rows"
        :maxlength="maxLength"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        placeholder=""
        v-bind="attrsExceptClass"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <div
        v-if="placeholder"
        class="base-textarea__placeholder"
        :class="{ 'is-raised': isFilled }"
      >
        {{ placeholder }}
      </div>

      <div v-if="showCounter" class="base-textarea__counter">
        {{ currentLength }}/{{ maxLength }}
      </div>
    </div>

    <div v-if="error" class="base-textarea__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useAttrs } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`,
  },
  rows: {
    type: Number,
    default: 4,
  },
  maxLength: {
    type: Number,
    default: 5000,
  },
  showCounter: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const isFocused = ref(false)
const isInitiallyFilled = ref(false)

const hasValue = computed(() => {
  const value = props.modelValue

  return value !== null && value !== undefined && String(value).length > 0
})

const isFilled = computed(() => {
  return isFocused.value || hasValue.value || isInitiallyFilled.value
})

const currentLength = computed(() => {
  return String(props.modelValue ?? '').length
})

const containerClasses = computed(() => ({
  'is-focused': isFocused.value,
  'is-filled': isFilled.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled,
  'has-counter': props.showCounter,
}))

const attrsExceptClass = computed(() => {
  const { class: _class, ...rest } = attrs

  return rest
})

const onInput = event => {
  emit('update:modelValue', event.target.value)
}

const onFocus = event => {
  isFocused.value = true

  emit('focus', event)
}

const onBlur = event => {
  isFocused.value = false

  emit('blur', event)
}

onMounted(() => {
  isInitiallyFilled.value = hasValue.value
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-textarea-wrap {
  width: 100%;
}

.base-textarea {
  position: relative;

  display: flex;

  width: 100%;
  min-height: 120px;

  overflow: hidden;

  background-color: var(--bg-secondary-color);

  border: 1px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 20, 10);

  transition: all 0.3s ease;

  &.is-focused {
    border-color: var(--hint-primary-color);

    .base-textarea__placeholder {
      color: var(--hint-primary-color);
      opacity: 0;
    }
  }

  &.has-error {
    border-color: var(--error-color);

    .base-textarea__placeholder {
      opacity: 0;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.has-counter {
    .base-textarea__control {
      padding-bottom: 35px;
    }
  }

  &__label {
    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    text-shadow: 1px 1px 1px var(--bg-primary-color);

    transition: color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 5px;
    }

    &.error {
      color: var(--error-color);
    }
  }

  &__control {
    position: relative;
    z-index: 1;

    display: block;

    width: 100%;
    min-height: 120px;

    padding-top: 15px;
    padding-bottom: 15px;

    @include adaptiveValue('padding-left', 18, 15);
    @include adaptiveValue('padding-right', 18, 15);

    background: transparent;

    border: none;
    outline: none;

    resize: none;

    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;

    &::placeholder {
      color: transparent;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__placeholder {
    position: absolute;
    z-index: 2;

    top: 15px;

    @include adaptiveValue('left', 18, 15);

    max-width: calc(100% - 36px);

    overflow: hidden;

    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;

    white-space: nowrap;
    text-overflow: ellipsis;

    pointer-events: none;

    transition: all 0.3s ease;

    &.is-raised {
      opacity: 0;
    }
  }

  &__counter {
    position: absolute;
    z-index: 2;

    right: 15px;
    bottom: 10px;

    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 120%;

    pointer-events: none;

    opacity: 0.7;
  }

  &__error {
    margin-top: 8px;
  }
}
</style>
