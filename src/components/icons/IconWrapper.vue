<template>
  <div
    class="wrapper"
    :class="[className, size, color, { isHoverable: isHoverable }]"
  >
    <SvgIcon class="wrapper__icon" :icon="icon" />
  </div>
</template>

<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'

defineProps({
  className: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    required: true,
  },
  isHoverable: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'size-44', // size-44
  },
  color: {
    type: String,
    default: 'primary', // white | hint
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease 0s;
  cursor: default;
  position: relative;
  border: 1px solid transparent;
  @include adaptiveValue('border-radius', 12, 10);
  &.size-44 {
    @include adaptiveValue('min-width', 44, 40);
    @include adaptiveValue('min-height', 44, 40);
    .wrapper__icon {
      min-width: 18px;
      min-height: 18px;
    }
  }
  &.isHoverable {
    cursor: pointer;
  }
  &.primary {
    color: var(--primary-color);
    background-color: var(--bg-secondary-color);
    border: 1px solid var(--border-color);
    &.isHoverable {
      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-inverted-color);
          background-color: var(--bg-inverted-color);
        }
      }
    }
  }
  &.hint {
    color: var(--third-color);
    background-color: var(--hint-color);
    &.canHover {
      @media (any-hover: hover) {
        &:hover {
          color: var(--third-color);
          background-color: var(--bg-primary-inverted);
        }
      }
    }
  }
}
</style>
