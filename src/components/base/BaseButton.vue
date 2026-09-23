<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ChevronDownIcon, OfferIcon, UserIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | transparent | bordered
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  hasArrow: { type: Boolean, default: false },
  activeMd3: { type: Boolean, default: false },
  icon: { type: String, default: '' }, // user | chevron | offer
  class: { type: [String, Array, Object], default: '' },
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  props.variant,
  {
    'with-addons': !!(slots.prefix || slots.postfix),
    'has-icon': props.icon,
    active: props.active,
    'active-md3': props.activeMd3,
  },
  props.class,
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <template v-if="variant === 'toggle'">
      <span class="btn__toggle-line"></span>
      <span class="btn__toggle-line"></span>
      <span class="btn__toggle-line"></span>
    </template>

    <template v-else>
      <span v-if="slots.prefix" class="btn__addon">
        <slot name="prefix" />
      </span>

      <SvgIcon
        v-if="props.icon === 'user'"
        :icon="UserIcon"
        class="btn__icon"
      />
      <SvgIcon
        v-else-if="props.icon === 'offer'"
        :icon="OfferIcon"
        class="btn__icon"
      />

      <span v-if="$slots.default" class="btn__text">
        <slot />
      </span>

      <SvgIcon
        v-if="props.icon === 'chevron'"
        :icon="ChevronDownIcon"
        class="btn__icon btn__icon_chevron"
      />

      <span v-if="slots.postfix" class="btn__addon">
        <slot name="postfix" />
      </span>
    </template>
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  width: 100%;
  pointer-events: auto;
  transition: all 0.3s ease 0s;
  position: relative;
  z-index: 1;
  overflow: hidden;
  text-align: center;
  font-weight: 700;
  font-family: var(--font-space-grotesk);
  border: 1px solid transparent;
  font-size: 14px;
  line-height: 16.8px;
  gap: 10px;
  border-radius: 999px;
  @include adaptiveValue('min-height', 36.6, 40);
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.has-icon {
    gap: 10px;
  }
  &.primary {
    color: var(--janna);
    background-color: var(--copper);
    padding: 9px 16px;
    @media (any-hover: hover) {
      &:hover {
        background-color: transparent;
        background-color: var(--tuscany);
      }
    }
  }
  &.transparent {
    padding: 8.8px 4.4px;
    background-color: transparent;
    color: var(--copper);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--copper-10);
      }
    }
  }
  &.bordered {
    padding: 8.8px 15px;
    background-color: transparent;
    border: 1px solid var(--cod-gray-16);
    text-shadow: 1px 1px 1px var(--cod-gray-16);
    color: var(--cod-gray);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--cod-gray-07);
      }
    }
  }
  &.with-addons {
    gap: 10px;
  }

  &__text {
    position: relative;
    z-index: 1;
  }

  &__addon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    &_chevron {
    }
  }
}
</style>
