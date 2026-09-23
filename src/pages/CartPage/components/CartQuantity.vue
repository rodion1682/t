<template>
  <div class="quantity">
    <button
      type="button"
      class="quantity__button quantity__button_minus"
      :class="{
        quantity__button_disabled: isMinusDisabled,
      }"
      :disabled="isMinusDisabled"
      aria-label="Decrease quantity"
      @click="decrement"
    >
      −
    </button>

    <div class="quantity__value">
      {{ quantity }}
    </div>

    <button
      type="button"
      class="quantity__button quantity__button_plus"
      :disabled="loading"
      aria-label="Increase quantity"
      @click="increment"
    >
      +
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const quantity = computed(() => {
  const value = Number(props.modelValue)

  return Number.isFinite(value) && value >= 1 ? value : 1
})

const isMinusDisabled = computed(() => {
  return props.loading || quantity.value <= 1
})

const updateQuantity = value => {
  if (props.loading) return

  const nextQuantity = Math.max(1, Number(value) || 1)

  emit('update:modelValue', nextQuantity)
  emit('change', nextQuantity)
}

const decrement = () => {
  if (isMinusDisabled.value) return

  updateQuantity(quantity.value - 1)
}

const increment = () => {
  if (props.loading) return

  updateQuantity(quantity.value + 1)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.quantity {
  display: flex;
  align-items: center;
  @include adaptiveValue('gap', 13, 10);

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    @include adaptiveValue('min-width', 24, 32);
    @include adaptiveValue('height', 24, 32);
    padding: 0;
    border-radius: 50%;
    background-color: var(--bg-fourth-color);
    color: var(--secondary-color);
    font-size: 20px;
    line-height: 1;
    transition: all 0.3s ease 0s;

    &_disabled,
    &:disabled {
      cursor: default;
      pointer-events: none;
      opacity: 0.5;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
        background-color: var(--hint-primary-color);
      }
    }
  }

  &__value {
    min-width: 16px;
    text-align: center;
    color: var(--secondary-color);
    font-weight: 700;
    line-height: 120%;
  }
}
</style>
