<template>
  <div class="order-filter">
    <BaseButton
      v-for="option in options"
      :key="option.value"
      type="button"
      variant="secondary"
      class="order-filter__button"
      :class="{ active: modelValue === option.value }"
      :aria-label="$t(option.label)"
      @click="$emit('update:modelValue', option.value)"
    >
      <SvgIcon
        v-if="option.icon"
        :icon="option.icon"
        class="order-filter__icon"
        :class="`order-filter__icon_${option.value}`"
      />

      <span v-else>
        {{ $t(option.label) }}
      </span>
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { CS, DOTA } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

defineProps({
  modelValue: {
    type: String,
    default: 'all',
  },
})

defineEmits(['update:modelValue'])

const options = [
  { label: 'All', value: 'all' },
  { label: 'CS2', value: 'cs2', icon: CS },
  { label: 'Dota 2', value: 'dota2', icon: DOTA },
]
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.order-filter {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  &:not(:last-child) {
    @include adaptiveValue('margin-bottom', 20, 15);
  }

  &__button {
    width: fit-content;
    @include adaptiveValue('min-width', 48, 50);
    @include adaptiveValue('min-height', 48, 50);
    padding: 0px;

    &.active {
      background-color: var(--hint-primary-color);
      color: var(--primary-color);
      pointer-events: none;
    }
  }

  &__icon {
    &_cs2 {
      width: 38px;
      min-width: 38px;
      height: 16px;
    }

    &_dota2 {
      width: 20px;
      min-width: 20px;
      height: 20px;
    }
  }
}
</style>
