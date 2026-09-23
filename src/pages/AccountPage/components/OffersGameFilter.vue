<template>
  <div class="offers-filter">
    <BaseSelect
      v-model="localValue"
      :options="options"
      option-label="label"
      option-value="value"
      :placeholder="$t('Game')"
      class="offers-filter__select"
    />
  </div>
</template>

<script setup>
import BaseSelect from '@/components/base/BaseSelect.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: 'all' },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const localValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const options = computed(() => [
  { label: t('All'), value: 'all' },
  { label: t('CS2'), value: 'cs2' },
  { label: t('Dota 2'), value: 'dota2' },
])
</script>

<style scoped lang="scss">
.offers-filter {
  width: 100%;

  &__select {
    width: 100%;
  }
}
</style>
