<script setup>
import { PasswordIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, onMounted, ref, useAttrs, useSlots } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  steam: { type: Boolean, default: false },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  regular: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  regularPrefix: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'on' },
  label: { type: String, default: '' },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
  actionable: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'left',
    validator: v => ['left', 'center'].includes(v),
  },
})

const emit = defineEmits(['update:modelValue', 'action', 'enter'])

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const slots = useSlots()

const isFocused = ref(false)
const passwordVisible = ref(false)
const isInitiallyFilled = ref(false)

const computedType = computed(() => {
  if (props.type === 'password')
    return passwordVisible.value ? 'text' : 'password'
  return props.type
})

const hasAction = computed(() => props.actionable && !!slots['action-icon'])

const hasValue = computed(() => {
  const v = props.modelValue
  return v !== null && v !== undefined && String(v).length > 0
})

const isFilled = computed(
  () => isFocused.value || hasValue.value || isInitiallyFilled.value,
)

const hasSuffix = computed(
  () => props.loading || props.type === 'password' || !!slots.suffix,
)

const hasPrefix = computed(() => !!slots.prefix)

const inputClasses = computed(() => ({
  'is-center': props.variant === 'center',
  'has-prefix': hasPrefix.value,
  'has-suffix': hasSuffix.value,
  'is-steam': props.steam,
}))

const containerClasses = computed(() => ({
  'base-input': true,
  'is-focused': isFocused.value,
  'is-filled': isFilled.value,
  'is-steam': props.steam,
  'has-error': !!props.error,
  'is-disabled': props.disabled || props.loading,
  regular: props.regular,
  empty: props.empty,
  regularPrefix: props.regularPrefix,
  'has-action': hasAction.value,
  'has-prefix': hasPrefix.value,
}))

const attrsExceptClass = computed(() => {
  const { class: _c, ...rest } = attrs
  return rest
})

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const onInput = e => emit('update:modelValue', e.target.value)
const onFocus = () => (isFocused.value = true)
const onBlur = () => (isFocused.value = false)

const onAction = () => emit('action')
const onEnter = () => emit('enter')

onMounted(() => {
  isInitiallyFilled.value = hasValue.value
})
</script>

<template>
  <div class="base-input-wrap" :class="attrs.class" v-bind="attrs">
    <div v-if="label" class="base-input__label" :class="{ error: error }">
      {{ label }}
    </div>

    <div class="base-input" :class="containerClasses">
      <div v-if="steam" class="base-input__steam _ibg-contain">
        <img src="@/assets/img/icons/steam.svg" />
      </div>
      <div v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix" />
      </div>
      <button
        v-else-if="hasAction"
        type="button"
        class="base-input__icon-btn"
        @click="onAction"
        :disabled="disabled || loading"
        aria-label="Search"
        title="Search"
      >
        <slot name="action-icon" />
      </button>

      <input
        :id="id"
        class="base-input__control"
        :class="inputClasses"
        :value="modelValue"
        :type="computedType"
        :readonly="readonly"
        :disabled="disabled || loading"
        :autocomplete="autocomplete"
        :required="required"
        placeholder=""
        v-bind="attrsExceptClass"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="onEnter"
      />

      <div
        class="base-input__placeholder"
        :class="{ 'is-raised': isFilled, 'has-prefix': hasPrefix }"
      >
        {{ placeholder }}
      </div>

      <div v-if="hasSuffix" class="base-input__suffix">
        <div
          v-if="loading"
          class="base-input__spinner"
          aria-hidden="true"
        ></div>

        <button
          v-else-if="type === 'password'"
          type="button"
          class="base-input__toggle"
          @click="togglePasswordVisibility"
          :disabled="disabled || loading"
        >
          <slot name="password-icon">
            <SvgIcon class="base-input__toggle-icon" :icon="PasswordIcon" />
          </slot>
        </button>

        <div v-else>
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <div v-if="error" class="base-input__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-input-wrap {
  width: 100%;
}

.base-input {
  position: relative;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: var(--merino);
  @include adaptiveValue('min-height', 50, 40);
  @include adaptiveValue('border-radius', 28, 20);
  box-shadow: inset 0 0 0 2px #dcd3c4;
  &.is-focused {
    box-shadow: inset 0 0 0 2px var(--copper);
    .base-input__placeholder {
      opacity: 0 !important;
      color: var(--hint-primary-color);
    }
  }
  &.has-error {
    border-color: var(--hairy-heath);
    .base-input__placeholder {
      opacity: 0 !important;
    }
  }
  &.has-action {
    .base-input__placeholder {
      left: 45px;
    }
  }
  &.has-prefix {
    .base-input__placeholder {
      left: 45px;
    }
  }
  &.is-steam {
    .base-input__placeholder {
      left: 45px;
    }
  }
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  &__prefix {
    @include adaptiveValue('left', 18, 15);
    font-weight: 400;
    transform: translateY(50%);
  }
  &.empty {
    .base-input__control {
      padding-top: 0px !important;
    }
  }
  &__label {
    font-size: 14px;
    line-height: 21.7px;
    color: var(--soya-bean);
    font-family: var(--font-ibm-plex);
    font-weight: 400;
    transition: color 0.3s ease 0s;
    &:not(:last-child) {
      margin-bottom: 8.7px;
    }
    &.error {
      color: var(--hairy-heath);
    }
  }
  &__control[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  &__control[type='number']::-webkit-outer-spin-button,
  &__control[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &__steam {
    top: 50%;
    min-width: 18px;
    min-height: 18px;
    @include adaptiveValue('left', 18, 15);
  }
  &__suffix,
  &__prefix {
    position: absolute;
    z-index: 1;
    top: 50%;
    display: flex;
    align-items: center;
    transform: translateY(-50%);
    @include adaptiveValue('gap', 14, 10);
  }
  &__suffix {
    @include adaptiveValue('right', 18, 15);
  }

  &__control {
    background: transparent;
    outline: none;
    border: none;
    width: 100%;
    height: 100%;
    font-weight: 400;
    overflow: hidden;
    font-size: 15px;
    color: var(--cod-gray);
    font-family: var(--font-ibm-plex);
    @include adaptiveValue('padding-left', 18, 15);
    @include adaptiveValue('padding-right', 18, 15);

    &.has-prefix {
      padding-left: 45px;
    }
    &.is-steam {
      @include adaptiveValue('padding-left', 18, 15);
    }

    &.has-suffix {
      padding-right: 45px;
    }

    &.is-center {
      text-align: center;
    }

    &::placeholder {
      color: transparent;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__placeholder {
    position: absolute;
    pointer-events: none;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    @include adaptiveValue('left', 18, 15);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 400;
    font-size: 16px;
    overflow: hidden;
    font-family: var(--font-ibm-plex);
    color: var(--zorba);
    max-width: calc(100% - 45px);
    &.has-prefix {
      @include adaptiveValue('left', 18, 15);
    }
    &.is-raised {
      opacity: 0 !important;
      font-size: 10px;
      line-height: 14px;
      top: 13px;
      font-weight: 400;
    }
  }
  &__icon-btn {
    background-color: transparent;
    @include adaptiveValue('min-height', 50, 40);
    @include adaptiveValue('min-width', 50, 40);
    @include adaptiveValue('border-radius', 20, 10);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    :deep(.body__input-icon) {
      min-width: 16px;
      height: 16px;
    }
    :deep(path) {
      stroke: var(--primary-color);
      transition: stroke 0.3s ease 0s;
    }
    @media (any-hover: hover) {
      &:hover {
        :deep(path) {
          stroke: var(--hint-primary-color);
        }
      }
    }
  }
  &__error {
    margin-top: 8px;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    @include adaptiveValue('min-height', 50, 40);
    @include adaptiveValue('min-width', 50, 40);
    @include adaptiveValue('border-radius', 20, 10);
    background-color: var(--hint-primary-color);
    border: 1px solid transparent;
    pointer-events: auto;
    transition: all 0.3s ease 0s;
    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        border-color: var(--hint-primary-color);
      }
    }
    &-icon {
      min-width: 16px;
      height: 16px;
      color: var(--primary-color);
      :deep(svg) {
        path {
          fill: var(--primary-color);
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes autofillStart {
}

.base-input__control:-webkit-autofill {
  animation-name: autofillStart;
  animation-duration: 0.01s;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--primary-color);
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
